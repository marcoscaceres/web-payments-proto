import { defineEventAttribute } from "event-target-shim";
import {
  updatePaymentResponse,
  _retrying,
  _retryPromise,
  _payerEmail,
  _payerName,
  _payerPhone,
} from "./PaymentResponse.js";
import InvertedPromise from "./InvertedPromise.js";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import PaymentDetailsUpdate from "./PaymentDetailsUpdate";
import PaymentMethodChooser from "./datacollectors/PaymentMethodChooser";
import PaymentRequestUpdateEvent from "./PaymentRequestUpdateEvent";
import PaymentResponse from "./PaymentResponse";
import paymentSheet from "./PaymentSheet.js";
import uuid from "uuid/v4";
const defaultPaymentOptions = Object.freeze({
  requestPayerEmail: false,
  requestPayerName: false,
  requestPayerPhone: false,
  requestShipping: false,
  shippingType: "shipping",
});

// Internal slots
export const _details = Symbol("[[details]]");
export const _options = Symbol("[[options]]");
export const _serializedMethodData = Symbol("[[serializedMethodData]]");
export const _originalMethodData = Symbol("[[originalMethodDataa]]");
export const _serializedModifierData = Symbol("[[serializedMethodData]]");
export const _state = Symbol("[[state]]");
export const _updating = Symbol("[[updating]]");
export const _response = Symbol("[[response]]");

const _disableForm = Symbol("disableForm");
const _acceptPromise = Symbol("[[acceptPromise]]");
const _selectedShippingOption = Symbol("[[selectedShippingOption]]");
const _shippingAddress = Symbol("[[shippingAddressSymbol]]");


class PaymentRequest extends EventTarget {
  constructor(originalMethodData, originalDetails, originalOptions) {
    super();
    if (typeof originalOptions !== "object") {
      throw TypeError("invalid options argument");
    }
    const options = Object.assign({}, defaultPaymentOptions, originalOptions);
    const methodData = originalMethodData.concat();
    const details = Object.assign({}, originalDetails);
    const serializedMethodData = new Map();
    //Establish the request's id:
    if (typeof details.id === "undefined") {
      details.id = uuid();
    }

    // Process payment methods
    if (methodData.length === 0) {
      throw new TypeError("At least one payment method is required");
    }
    for (const paymentMethod of methodData) {
      if (paymentMethod.supportedMethods.length === 0) {
        throw new TypeError(
          "Each payment method needs to include at least one payment method identifier"
        );
      }
      let serializedData = paymentMethod.data
        ? JSON.stringify(paymentMethod.data)
        : null;
      serializedMethodData.set(
        paymentMethod.supportedMethods.concat(),
        serializedData
      );
    }


    // Process the total:
    if (!PaymentCurrencyAmount.isValid(details.total.amount.value)) {
      throw new TypeError("The value of total is invalid.");
    }
    if (!PaymentCurrencyAmount.isPositive(details.total.amount.value)) {
      throw new TypeError("total can't be negative.");
    }
    if ("displayItems" in details) {
      for (const item of details.displayItems) {
        if (PaymentCurrencyAmount.isValid(item.amount.value)) {
          continue;
        }
        throw new TypeError("A currency value of displayItems is invalid");
      }
    }
    // Process shipping options
    const { selectedShippingOption, shippingOptions } = processShippingOptions(
      details
    );
    details.shippingOptions = shippingOptions;

    // Process payment details modifiers
    const {
      modifiers,
      serializedModifierData,
    } = processPaymentDetailsModifiers(details);
    details.modifiers = modifiers;

    // set the internal slots
    this[_details] = details;
    this[_options] = options;
    this[_serializedMethodData] = serializedMethodData;
    this[_serializedModifierData] = serializedModifierData;
    this[_state] = "created";
    this[_updating] = false;
    this[_shippingAddress] = null;
    this[_selectedShippingOption] = selectedShippingOption;
    this[_response] = null;
    this[_originalMethodData] = originalMethodData;
  }

  [_disableForm]() {
    paymentSheet.disableInputs();
  }

  //readonly attribute DOMString id;
  get id() {
    return this[_details].id;
  }

  //readonly attribute PaymentAddress? shippingAddress;
  get shippingAddress() {
    return this[_shippingAddress];
  }

  //readonly attribute DOMString? shippingOption;
  get shippingOption() {
    return this[_selectedShippingOption];
  }

  //readonly attribute PaymentShippingType? shippingType;
  get shippingType() {
    const { shippingType } = this[_options];
    return shippingType ? shippingType : null;
  }

  get serializedMethodData() {
    return this[_serializedMethodData];
  }

  get originalMethodData() {
    return this[_originalMethodData];
  }

  /**
   * @param {Promise<PaymentDetailsUpdate>} detailsPromise
   * @returns {Promise<PaymentResponse>}
   */
  async show(detailsPromise) {
    if (this[_state] !== "created") {
      throw new DOMException(
        "Payment request was already used",
        "InvalidStateError"
      );
    }
    if (!window.top.document.hasFocus()) {
      console.info(
        new DOMException(
          "Top window must be focused to call .show()",
          "SecurityError"
        )
      );
    }
    this[_state] = "interactive";
    this[_acceptPromise] = new InvertedPromise();
    const supported = [...this[_serializedMethodData].keys()]
      .reduce((accumulator, method) => accumulator.concat(method), [])
      .filter(PaymentMethodChooser.supports);
    if (!supported.length) {
      const err = new DOMException(
        "No supported payment methods found.",
        "NotSupportedError"
      );
      this[_acceptPromise].reject(err);
    }

    paymentSheet.addEventListener("userabort", async () => {
      userAbortsPayment(this);
    });

    paymentSheet.addEventListener("shippingoptionchange", ev => {
      console.log("shippingoptionchange event");
      this[_selectedShippingOption] = ev.detail.shippingOption;
      paymentRequestUpdated(this, "shippingoptionchange");
    });

    paymentSheet.addEventListener("shippingaddresschange", ev => {
      console.log("shippingaddresschange event");
      this[_shippingAddress] = ev.detail.shippingAddress;
      paymentRequestUpdated(this, "shippingaddresschange");
    });
    try {
      const finalDetailsPromise = paymentSheet.open(this);
      if (detailsPromise) await updatePaymentRequest(detailsPromise, this);
      await userAcceptsThePaymentRequest(this, finalDetailsPromise);
    } catch (err) {
      this[_acceptPromise].reject(err);
    }
    return this[_acceptPromise].promise;
  }

  // Promise <void> abort();
  async abort() {
    if (this[_state] !== "interactive") {
      throw new DOMException(
        "Payment request was already consumed",
        "InvalidStateError"
      );
    }
    return new Promise(async (resolve, reject) => {
      try {
        await paymentSheet.requestClose("abort");
      } catch (err) {
        const invalidStateErr = new DOMException(
          "Could not abort at this time",
          "InvalidStateError"
        );
        reject(invalidStateErr);
        return;
      }
      // Set the value of the internal slot request.[[\state]] to "closed".
      this[_state] = "closed";
      // Reject the promise request.[[\acceptPromise]] with an "AbortError" DOMException.
      const abortErr = new DOMException(
        "Payment request was aborted",
        "AbortError"
      );
      this[_acceptPromise].reject(abortErr);
      // Resolve promise with undefined.
      resolve(undefined);
    });
  }

  // Promise <boolean> canMakePayment();
  async canMakePayment() {
    if (this[_state] !== "interactive") {
      throw new DOMException(
        "Payment request was already consumed",
        "InvalidStateError"
      );
    }
    // Optionally, at the user agent's discretion, return a promise rejected with a "QuotaExceededError" DOMException.
    return Array.from(this[_serializedMethodData].keys())
      .reduce((accumulator, method) => accumulator.concat(method), [])
      .some(PaymentMethodChooser.supports);
  }
} // class PaymentRequest
defineEventAttribute(PaymentRequest, "shippingoptionchange");
defineEventAttribute(PaymentRequest, "shippingaddresschange");

export async function userAcceptsThePaymentRequest(request, sheetDetails) {
  await sheetDetails;
  if (request[_updating]) {
    console.assert(false, "This should never happen: in [[updating]] state");
    return;
  }
  if (request[_state] !== "interactive") {
    console.assert(
      false,
      "The user agent user interface should ensure that this never occurs."
    );
    return;
  }
  const options = request[_options];
  if (options.requestShipping) {
    if (request.shippingAddress === null || request.shippingOption === null) {
      console.assert(
        false,
        "Either shippingAddress or shippingOption was null"
      );
      return;
    }
  }
  const isRetry = request[_response] ? true : false;
  const details = await sheetDetails;
  const response = isRetry
    ? request[_response]
    : new PaymentResponse(request, details);

  // If isRetry if false, initialize the newly created response:
  // response[_request] = request;
  // response[_retrying] = false;
  // response[_complete] = false;
  // response[_id] = request.id;
  // response[_methodName] = details.methodName;
  // response[_retryPromise] = undefined;

  updatePaymentResponse(response, request, details);
  if (!isRetry) {
    request[_response] = response;
    request[_acceptPromise].resolve(response);
  } else {
    response[_retryPromise].resolve(undefined);
  }
  request[_state] = "closed";
}

function userAbortsPayment(request) {
  console.assert(request[_updating] === false, "This should never happen");
  console.assert(
    request[_state] === "interactive",
    "UA should ensure that this never occurs."
  );
  request[_state] = "closed";
  const err = new DOMException("User aborted payment request", "AbortError");
  const response = request[_response];
  if (response) {
    console.assert(response[_retrying]);
    response[_retryPromise].reject(err);
  } else {
    request[_acceptPromise].reject(err);
  }
}

function paymentRequestUpdated(request, eventName) {
  console.assert(!request[_updating], "This should never happen");
  console.assert(
    request[_state] === "interactive",
    "The user agent user interface should ensure that this never occurs."
  );
  const updateEvent = new PaymentRequestUpdateEvent(eventName);
  request.dispatchEvent(updateEvent);
}

function processPaymentDetailsModifiers({ modifiers: originalModifiers }) {
  if (!originalModifiers) {
    return {};
  }
  let serializedModifierData = [];
  let modifiers = originalModifiers.concat();
  for (const modifier of modifiers) {
    const { total, additionalDisplayItems, data } = modifier;
    if (total) {
      if (!PaymentCurrencyAmount.isValid(total.amount.value)) {
        throw new TypeError("A modifier monetary value is invalid.");
      }
      if (!PaymentCurrencyAmount.isPositive(total.amount.value)) {
        throw new TypeError("A modifier can't be negative.");
      }
    }
    if (additionalDisplayItems) {
      for (const item of additionalDisplayItems) {
        if (PaymentCurrencyAmount.isValid(item.amount.value)) {
          throw new TypeError(
            "Invalid monetary value in additionalDisplayItems"
          );
        }
      }
    }
    const serializedData = data ? JSON.strigify(data) : null;
    serializedModifierData.push(serializedData);
    delete modifier.data;
  }
  return {
    modifiers,
    serializedModifierData,
  };
}

function processShippingOptions({ shippingOptions }) {
  if (!shippingOptions) {
    return {};
  }
  const areValid = shippingOptions.every(({ amount: { value } }) =>
    PaymentCurrencyAmount.isValid(value)
  );
  if (!areValid) {
    throw new TypeError(
      "One of the ShippingOption monetary values is invalid."
    );
  }
  const options = new Set(shippingOptions);
  const seenIDs = new Set();
  for (const option of shippingOptions) {
    if (seenIDs.has(option.id)) {
      options.clear();
      break;
    }
    seenIDs.add(option.id);
  }
  // find last selected
  const selected = Array.from(options)
    .reverse()
    .find(({ selected }) => selected);
  return {
    shippingOptions: [...options],
    selectedShippingOption: selected ? selected.id : null,
  };
}

class TimeoutBomb {
  constructor(timeout, msg) {
    const self = this;
    this.defused = false;
    this.promise = new Promise((_, reject) => {
      const explode = () => reject(new Error(msg));
      self.id = setTimeout(explode, timeout);
    });
  }
  defuse() {
    if (this.defused) throw new Error("already defused.");
    this.defused = true;
    clearTimeout(this.id);
  }
}

/**
 *
 * @param {Promise<PaymentDetailsUpdate>} detailsPromise
 * @param {PaymentRequest} request
 */
export async function updatePaymentRequest(detailsPromise, request) {
  paymentSheet.disableInputs();
  const bomb = new TimeoutBomb(5000, "Sheet timed out");
  let value;
  try {
    // it either times out, or detailsPromise rejects
    value = await Promise.race([bomb.promise, Promise.resolve(detailsPromise)]);
    bomb.defuse();
  } catch (err) {
    return abortTheUpdate(request, new DOMException(err.message, "AbortError"));
  }
  try {
    // Let details be the result of converting value to a PaymentDetailsUpdate dictionary.
    // If this throws an exception, abort the update with the thrown exception.
    const details = new PaymentDetailsUpdate(value).toObject();
    const newDetails = validateAndCanonicalize(details, request);
    updatePaymentRequestWith(request, newDetails);
  } catch (err) {
    return abortTheUpdate(request, err);
  }
  request[_updating] = false;
  // Update the user interface based on any changed values in request.
  paymentSheet.update();
  // Re-enable user interface elements disabled prior to running this algorithm.
  paymentSheet.enableInputs();
}

function validateAndCanonicalize(details, request) {
  const finalDetails = {};
  // If the total member of details is present, then:
  if (details.total) {
    Object.assign(finalDetails, { total: details.total });
  }
  // If the displayItems member of details is present, then for each item in details.displayItems:
  if (details.displayItems) {
    for (const item of details.displayItems) {
      // Check and canonicalize amount item.amount.
      // If an exception is thrown, then abort the update with that exception.
      PaymentCurrencyAmount.checkAndCanonicalize(item.amount);
    }
    Object.assign(finalDetails, { ...details.displayItems });
  }
  if (details.shippingOptions && request[_options].requestShipping) {
    const result = processShippingOptions(details);
    Object.assign(finalDetails, { ...result });
  }
  // If the modifiers member of details is present, then:
  if (details.modifiers) {
    const result = processPaymentDetailsModifiers(details);
    Object.assign(finalDetails, { ...result });
  }
  return finalDetails;
}

/**
 * @param {PaymentRequest} request
 * @param {PaymentDetailsUpdate} newDetails
 */
function updatePaymentRequestWith(request, newDetails) {
  if ("total" in newDetails) {
    request[_details].total = newDetails.total;
  }
  if ("displayItems" in newDetails) {
    request[_details].displayItems = newDetails.displayItems;
  }
  if ("shippingOptions" in newDetails && request[_options].requestShipping) {
    request[_details].shippingOptions = newDetails.shippingOptions;
  }
  //Set the value of request's shippingOption attribute to selectedShippingOption.
  request[_selectedShippingOption] = newDetails.selectedShippingOption;
  if ("modifiers" in newDetails) {
    request[_details].modifiers = newDetails.modifiers;
    request[_serializedModifierData] = newDetails.serializedModifierData;
  }
  if (
    request[_options].requestShipping &&
    request[_details].shippingOptions.length === 0
  ) {
    // developer has signified that there are no valid shipping options for the currently-chosen shipping address
    // (given by request's shippingAddress). In this case, the user agent SHOULD display an error indicating this,
    // and MAY indicate that the currently-chosen shipping address is invalid in some way.
    // The user agent SHOULD use the error member of details, if it is present,
    // to give more information about why there are no valid shipping options for that address
  }
}

/**
 * @param {PaymentRequest} request
 * @param {Error} err
 */
async function abortTheUpdate(request, err) {
  // Abort the current user interaction and close down any remaining user interface.
  await paymentSheet.abort(err.message);
  //  request._state]] to "closed".
  request[_state] = "closed";
  const isRetry = request[_response] ? true : false;
  if (!isRetry) {
    const response = request[_response];
    console.assert(response[_retrying]);
    response[_retryPromise].reject(err);
  } else {
    // Reject the promise request.[[acceptPromise]] with exception.
    request[_acceptPromise].reject(err);
  }
  //Set request.[[\updating]] to false.
  request[_updating] = false;
}

export function payerDetailChange(request, changeDetails) {
  const { payerName, payerEmail, payerPhone } = changeDetails;
  // Let request be the PaymentRequest object that the user is interacting with.
  // If request[[response]] is null, terminate this algorithm.
  if (request[_response] === null) {
    console.assert("There should always be a response here");
    return;
  }
  // Let response be request[[response]].
  const response = request[_response];
  // Assert: response[[retrying]] is true.
  console.assert(response[_retrying], "Must be in a retry");
  // Queue a task on the user interaction task source to run the following steps:
  // Assert: request.[[updating]] is false.
  console.assert(request[_updating] === false, "Must not be updating!");
  // Assert: request.[[state]] is "interactive".
  console.assert(
    request[_state] === "interactive",
    "Request must be interactive"
  );
  // If payer name changed:
  if (response.payerName !== payerName) {
    // Assert: request[[options]].requestPayerName is true.
    console.assert(
      request[_options].requestPayerName,
      "Unexpected change to payer name"
    );
    // Set response's payerName attribute to payer name.
    response[_payerName] = payerName;
  }
  // If payer email changed:
  if (response.payerEmail !== payerEmail) {
    // Assert: request[[options]].requestPayerEmail is true.
    console.assert(
      request[_options].requestPayerEmail,
      "Unexpected change to payer email"
    );
    // Set response's payerEmail attribute to payer Email.
    response[_payerEmail] = payerEmail;
  }
  if (response.payerPhone !== payerPhone) {
    // Assert: request[[options]].requestPayerPhone is true.
    console.assert(
      request[_options].requestPayerPhone,
      "Unexpected change to payer phone"
    );
    // Set response's payerPhone attribute to payer Phone.
    response[_payerPhone] = payerPhone;
  }
  // Let event be the result of creating an event using PaymentRequestUpdateEvent.
  // Initialize event's type attribute to "payerdetailchange".
  const event = new PaymentRequestUpdateEvent("payerdetailchange");
  // Dispatch event at response.
  response.dispatchEvent(event);
  // If event.[[waitForUpdate]] is true, disable any part of the user
  // interface that could cause another update event to be fired.
  paymentSheet.disableInputs();
}

window.PaymentRequest = PaymentRequest;

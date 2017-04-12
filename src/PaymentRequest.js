import uuid from 'uuid/v4';
import EventTarget from "event-target-shim";
import paymentSheet from "./PaymentSheet.js";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import PaymentMethodChooser from "./datacollectors/PaymentMethodChooser"
import PaymentRequestUpdateEvent from "./PaymentRequestUpdateEvent";
import PaymentResponse from "./PaymentResponse";
const defaultPaymentOptions = Object.freeze({
  requestPayerEmail: false,
  requestPayerName: false,
  requestPayerPhone: false,
  requestShipping: false,
  shippingType: "shipping",
});

const attributes = new WeakMap();
const internalSlots = new WeakMap();
const eventListeners = [
  "shippingoptionchange",
  "shippingaddresschange",
];

class PaymentRequest extends EventTarget(eventListeners) {
  constructor(originalMethodData, originalDetails, originalOptions = defaultPaymentOptions) {
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
        throw new TypeError("Each payment method needs to include at least one payment method identifier");
      }
      let serializedData = paymentMethod.data ? JSON.strigify(paymentMethod.data) : null;
      serializedMethodData.set(paymentMethod.supportedMethods.concat(), serializedData);
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
    const {
      selectedShippingOption,
      shippingOptions
    } = processShippingOptions(details)
    details.shippingOptions = shippingOptions;

    // Process payment details modifiers
    const {
      modifiers,
      serializedModifierData
    } = processPaymentDetailsModifiers(details);
    details.modifiers = modifiers;
    internalSlots.set(this, new Map([
      ["[[details]]", details],
      ["[[options]]", options],
      ["[[serializedMethodData]]", serializedMethodData],
      ["[[serializedModifierData]]", serializedModifierData],
      ["[[state]]", "created"],
      ["[[updating]]", false],
      ["[[shippingAddress]]", null],
      ["[[selectedShippingOption]]", selectedShippingOption],
    ]));
  }

  //readonly attribute DOMString id;
  get id() {
    return internalSlots.get(this).get("[[details]]").id;
  }

  //readonly attribute PaymentAddress? shippingAddress;
  get shippingAddress() {
    return internalSlots.get(this).get("[[shippingAddress]]");
  }

  //readonly attribute DOMString ? shippingOption;
  get shippingOption() {
    return internalSlots.get(this).get("[[selectedShippingOption]]");
  }

  //readonly attribute PaymentShippingType ? shippingType;
  get shippingType() {
    const {
      shippingType
    } = internalSlots.get(this).get("[[options]]");
    return shippingType ? shippingType : null;
  }

  //Promise <PaymentResponse> show();
  show() {
    const slots = internalSlots.get(this);
    if (slots.get("[[state]]") !== "created") {
      throw new DOMException("Payment request was already used", "InvalidStateError");
    }
    if (!window.top.document.hasFocus()) {
      throw new DOMException("Top window must be focused to call .show()", "SecurityError");
    }
    slots.set("[[state]]", "interactive");

    return new Promise(async(resolve, reject) => {
      slots.set("[[acceptPromise]]", {
        resolve,
        reject
      });
      const supported = Array
        .from(slots.get("[[serializedMethodData]]").keys())
        .reduce((accumulator, method) => accumulator.concat(method), [])
        .filter(PaymentMethodChooser.supports);
      if (!supported.length) {
        return reject(new DOMException("No supported payment methods found.", "NotSupportedError"));
      }
      const {
        displayItems,
        total,
        shippingOptions
      } = slots.get("[[details]]");

      const options = slots.get("[[options]]");

      paymentSheet.addEventListener("abort", () => {
        userAbortsPayment(this);
      });

      paymentSheet.addEventListener("shippingoptionchange", ev => {
        console.log("shippingoptionchange event");
        slots.set("[[selectedShippingOption]]", ev.detail.shippingOption);
        paymentRequestUpdated(this, "shippingoptionchange");
      });

      paymentSheet.addEventListener("shippingaddresschange", ev => {
        slots.set("[[shippingAddress]]", ev.detail.shippingAddress);
        paymentRequestUpdated(this, "shippingaddresschange");
      });

      try {
        const detail = await paymentSheet.open({
          displayItems,
          options,
          shippingOptions,
          supported,
          total,
        });
        userAcceptsThePaymentRequest(this, detail);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Promise <void> abort();
  async abort() {
    // TODO: add develper feedback about error to spec.
    const slots = internalSlots.get(this);
    if (slots.get("[[state]]") !== "interactive") {
      throw new DOMException("Payment request was already consumed", "InvalidStateError");
    }
    return new Promise(async(resolve, reject) => {
      try {
        await paymentSheet.requestClose("abort");
      } catch (err) {
        const invalidStateErr = new DOMException("Could not abort at this time", "InvalidStateError")
        reject(invalidStateErr);
        return;
      }
      // Set the value of the internal slot request.[[\state]] to "closed".
      slots.set("[[\state]]", "closed");
      // Reject the promise request.[[\acceptPromise]] with an "AbortError" DOMException.
      const abortErr = new DOMException("Payment request was aborted", "AbortError");
      slots.get("[[\acceptPromise]]").reject(abortErr);
      // Resolve promise with undefined.
      resolve(undefined);
    });
  }

  // Promise <boolean> canMakePayment();
  async canMakePayment() {
    const slots = internalSlots.get(this);
    if (slots.get("[[state]]") !== "interactive") {
      throw new DOMException("Payment request was already consumed", "InvalidStateError");
    }
    // Optionally, at the user agent's discretion, return a promise rejected with a "QuotaExceededError" DOMException.
    return Array
      .from(slots.get("[[serializedMethodData]]").keys())
      .reduce((accumulator, method) => accumulator.concat(method), [])
      .some(PaymentMethodChooser.supports);
  }
}

function userAcceptsThePaymentRequest(request, detail) {
  const slots = internalSlots.get(request);
  if (slots.get("[[updating]]")) {
    console.assert(false, "This should never happen");
    return;
  }
  if (slots.get("[[state]]" !== "interactive")) {
    console.assert(false, "The user agent user interface should ensure that this never occurs.");
    return;
  }
  const options = slots.get("[[options]]");
  if (options.requestShipping) {
    if (request.shippingAddress === null || request.shippingOption === null) {
      console.assert(false, "This should never occur.");
      return;
    }
  }
  const response = new PaymentResponse(request, options, detail);
  slots.set("[[state]]", "closed");
  slots.get("[[acceptPromise]]").resolve(response);
}

async function userAbortsPayment(request) {
  const slots = internalSlots.get(request);
  if (slots.get("[[updating]]")) {
    console.assert(false, "This should never happen");
    return;
  }
  if (slots.get("[[state]]" !== "interactive")) {
    console.assert(false, "The user agent user interface should ensure that this never occurs.");
    return;
  }
  await Promise.resolve(); // spin the event loop
  slots.set("[[state]]", "closed");
  const err = new DOMException("User aborted payment request", "AbortError");
  slots.get("[[acceptPromise]]").reject(err);
}

function paymentRequestUpdated(request, eventName) {
  const slots = internalSlots.get(request);
  if (slots.get("[[updating]]")) {
    console.assert(false, "This should never happen");
    return;
  }
  if (slots.get("[[state]]" !== "interactive")) {
    console.assert(false, "The user agent user interface should ensure that this never occurs.");
    return;
  }
  const updateEvent = new PaymentRequestUpdateEvent(name);
  request.dispatchEvent(updateEvent);
}

function processPaymentDetailsModifiers({
  modifiers: originalModifiers
}) {
  if (!originalModifiers) {
    return [];
  }
  let serializedModifierData = [];
  let modifiers = originalModifiers.concat();
  for (const modifier of modifiers) {
    const {
      total,
      additionalDisplayItems,
      data
    } = modifier;
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
          throw new TypeError("Invalid monetary value in additionalDisplayItems");
        }
      }
    }
    const serializedData = data ? JSON.strigify(data) : null;
    serializedModifierData.push(serializedData);
    delete modifier.data;
  }
  return {
    modifiers,
    serializedModifierData
  };
}

function processShippingOptions({
  shippingOptions
}) {
  if (!shippingOptions) {
    return [];
  }
  const areValid = shippingOptions.every(
    ({
      amount: {
        value
      }
    }) => PaymentCurrencyAmount.isValid(value)
  );
  if (!areValid) {
    throw new TypeError("One of the ShippingOption monetary values is invalid.");
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
  const selected = Array
    .from(options)
    .reverse()
    .find(({
      selected
    }) => selected);
  return {
    shippingOptions: Array.from(options),
    selectedShippingOption: selected ? selected.id : null
  };
}

function makeInvertedPromise() {
  let reject, resolve;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject;
  });
  return {
    promise,
    resolve,
    reject
  };
}

window.PaymentRequest = PaymentRequest;

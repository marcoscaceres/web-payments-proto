import paymentSheet from "./PaymentSheet.js";
import {
  _state as _requestState,
  _options as _requestOptions,
  userAcceptsThePaymentRequest,
} from "./PaymentRequest";
import InvertedPromise from "./InvertedPromise.js";

const _complete = Symbol("[[complete]]");
const _id = Symbol("[[id]]");
const _methodName = Symbol("[[methodName]]");
const _payerEmail = Symbol("[[payerEmail]]");
const _payerName = Symbol("[[payerName]]");
const _payerPhone = Symbol("[[payerPhone]]");
const _request = Symbol("[[request]]");
const _shippingAddress = Symbol("[[shippingAddress]]");
const _shippingOption = Symbol("[[shippingOption]]");
export const _details = Symbol("[[details]]");
export const _retrying = Symbol("[[retrying]]");
export const _retryPromise = Symbol("[[retryPromise]]");

const PaymentCompleteEnum = Object.freeze(["fail", "success", "unknown"]);

export default class PaymentResponse {
  constructor(request, { methodName }) {
    this[_request] = request;
    this[_retrying] = false;
    this[_complete] = false;
    this[_id] = request.id;
    this[_methodName] = methodName;
    this[_retryPromise] = undefined;
  }

  //readonly attribute DOMString requestId;
  get requestId() {
    return this[_id];
  }
  //readonly attribute DOMString methodName;
  get methodName() {
    return this[_methodName];
  }
  //readonly attribute object details;
  get details() {
    return this[_details];
  }
  //readonly attribute PaymentAddress? shippingAddress;
  get shippingAddress() {
    return this[_shippingAddress];
  }
  //readonly attribute DOMString? shippingOption;
  get shippingOption() {
    return this[_shippingOption];
  }
  //readonly attribute DOMString? payerName;
  get payerName() {
    return this[_payerName];
  }
  //readonly attribute DOMString? payerEmail;
  get payerEmail() {
    return this[_payerEmail];
  }
  //readonly attribute DOMString? payerPhone;
  get payerPhone() {
    return this[_payerPhone];
  }

  //Promise<void> complete(optional PaymentComplete result = "unknown");
  async complete(result = "unknown") {
    if (!PaymentCompleteEnum.includes(result)) {
      throw new TypeError("Invalid argument value: " + result);
    }
    if (this[_complete]) {
      throw new DOMException("Response already completed", "InvalidStateError");
    }
    this[_complete] = true;
    await paymentSheet.requestClose(result);
  }

  async retry() {
    // ✅ Let request be response.[[request]].
    const request = this[_request];
    // ✅ If response.[[complete]] is true, return a promise rejected with an "InvalidStateError" DOMException.
    if (this[_complete]) {
      throw new DOMException("Payment response completed", "InvalidStateError");
    }
    // ✅ If response.[[retrying]] is true, return a promise rejected with an "InvalidStateError" DOMException.
    if (this[_retrying]) {
      throw new DOMException("Already retrying", "InvalidStateError");
    }
    // ✅ Set response.[[retrying]] to true.
    this[_retrying] = true;
    // ✅ Set request.[[state]] to "interactive".
    request[_requestState] = "interactive";
    // ✅ Let retryPromise be a newly created promise.
    const retryPromise = new InvertedPromise();
    // ✅ Set response.[[retryPromise]] to retryPromise.
    this[_retryPromise] = retryPromise;
    // ✅ In parallel:
    // ✅ Indicate to the end-user that something is wrong with the data of the payment response.
    const retryDetailsPromise = paymentSheet.retry();
    // ✅ The retryPromise will later be resolved or rejected by either the user accepts the payment
    // request algorithm or the user aborts the payment request algorithm, which are triggered
    // through interaction with the user interface.
    try {
      await userAcceptsThePaymentRequest(request, retryDetailsPromise);
    } catch (err) {
      // nothing to do... it's done by userAbortsPaymentRequest
    } finally {
      // ✅ Finally, when retryPromise settles, set response[[retrying]] to false.
      this[_retrying] = false;
    }
    // ✅  Return retryPromise.
    return retryPromise.promise;
  }

  //serializer = { attribute };
  toJSON() {
    return JSON.stringify({
      requestId: this.requestId,
      methodName: this.methodName,
      details: this.details,
      shippingAddress: this.shippingAddress,
      shippingOption: this.shippingOption,
      payerName: this.payerName,
      payerEmail: this.payerEmail,
      payerPhone: this.payerPhone,
    });
  }
}

export function updatePaymentResponse(response, request, details) {
  const { requestShipping, requestPayerName, requestPayerPhone } = request[
    _requestOptions
  ];
  response[_payerName] = requestPayerName ? details.payerName : null;
  response[_payerPhone] = requestPayerPhone ? details.payerPhone : null;
  response[_shippingAddress] = requestShipping ? details.shippingAddress : null;
  response[_shippingOption] = request.selectedShippingOption;
  response[_details] = details;
}

window.PaymentResponse = PaymentResponse;

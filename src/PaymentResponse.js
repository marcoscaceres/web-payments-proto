import paymentSheet from "./PaymentSheet.js";
import {
  _state as _requestState,
  _options as _requestOptions,
  userAcceptsThePaymentRequest,
  payerDetailChange,
} from "./PaymentRequest";
import InvertedPromise from "./InvertedPromise.js";

const _complete = Symbol("[[complete]]");
const _methodName = Symbol("[[methodName]]");
export const _details = Symbol("[[details]]");
export const _payerEmail = Symbol("[[payerEmail]]");
export const _payerName = Symbol("[[payerName]]");
export const _payerPhone = Symbol("[[payerPhone]]");
export const _request = Symbol("[[request]]");
export const _retrying = Symbol("[[retrying]]");
export const _retryPromise = Symbol("[[retryPromise]]");

const PaymentCompleteEnum = Object.freeze(["fail", "success", "unknown"]);

export default class PaymentResponse extends EventTarget {
  constructor(request, { methodName = "basic-card" }) {
    super();
    this[_request] = request;
    this[_retrying] = false;
    this[_complete] = false;
    this[_methodName] = methodName;
    this[_retryPromise] = undefined;
    this[_payerEmail] = null;
    this[_payerName] = null;
    this[_payerPhone] = null;
  }

  //readonly attribute DOMString requestId;
  get requestId() {
    return this[_request].id;
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
    return this[_request].shippingAddress;
  }
  //readonly attribute DOMString? shippingOption;
  get shippingOption() {
    return this[_request].shippingOption;
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

  async retry(errorFields = {}) {
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
    const { requestPayerName, requestPayerPhone, requestPayerEmail } = request[
      _requestOptions
    ];
    const payerDetailListener = ({ detail }) => {
      payerDetailChange(request, detail);
    };
    if (requestPayerName || requestPayerPhone || requestPayerEmail) {
      paymentSheet.addEventListener("payerdetailschange", payerDetailListener);
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
    const retryDetailsPromise = paymentSheet.retry(errorFields);
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
      paymentSheet.removeEventListener(
        "payerdetailschange",
        payerDetailListener
      );
    }
    // ✅  Return retryPromise.
    return retryPromise.promise;
  }

  //serializer = { attribute };
  toJSON() {
    return JSON.stringify({
      requestId: this.requestId,
      methodName: this.methodName,
      details: { ...this.details },
      shippingAddress: this.shippingAddress.toJSON(),
      shippingOption: this.shippingOption,
      payerName: this.payerName,
      payerEmail: this.payerEmail,
      payerPhone: this.payerPhone,
    });
  }
}

export function updatePaymentResponse(response, request, details) {
  const { requestPayerName, requestPayerPhone, requestPayerEmail } = request[
    _requestOptions
  ];
  response[_payerName] = requestPayerName ? details.payerName : null;
  response[_payerPhone] = requestPayerPhone ? details.payerPhone : null;
  response[_payerEmail] = requestPayerEmail ? details.payerEmail : null;
  response[_details] = details;
}

window.PaymentResponse = PaymentResponse;

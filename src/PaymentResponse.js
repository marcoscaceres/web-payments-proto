import paymentSheet from "./PaymentSheet.js";
import {
  _state as _requestState,
  _options as _requestOptions,
} from "./PaymentRequest";

const PaymentCompleteEnum = Object.freeze(["fail", "success", "unknown"]);
const _request = Symbol("[[request]]");
const _retrying = Symbol("[[retrying]]");
const _complete = Symbol("[[complete]]");
const _details = Symbol("[[details]]");
const _id = Symbol("[[id]]");
const _methodName = Symbol("[[methodName]]");
const _payerName = Symbol("[[payerName]]");
const _payerPhone = Symbol("[[payerPhone]]");
const _shippingAddress = Symbol("[[shippingAddress]]");
const _shippingOption = Symbol("[[shippingOption]]");
const _payerEmail = Symbol("[[payerEmail]]");

export default class PaymentResponse {
  constructor(request, responseDetail) {
    const { requestShipping, requestPayerName, requestPayerPhone } = request[
      _requestOptions
    ];
    const payerPhone = requestPayerPhone ? responseDetail.payerPhone : null;
    const shippingAddress = requestShipping
      ? responseDetail.shippingAddress
      : null;
    const payerName = requestPayerName ? responseDetail.payerName : null;
    this[_request] = request;
    this[_retrying] = false;
    this[_complete] = false;
    this[_details] = Object.assign({}, responseDetail.details);
    this[_id] = request.id;
    this[_methodName] = responseDetail.methodName;
    this[_payerName] = payerName;
    this[_payerPhone] = payerPhone;
    this[_shippingAddress] = shippingAddress;
    this[_shippingOption] = request.selectedShippingOption;
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

window.PaymentResponse = PaymentResponse;

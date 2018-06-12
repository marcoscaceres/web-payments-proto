import { _state, _updating, updatePaymentRequest } from "./PaymentRequest.js";
import PaymentResponse from "./PaymentResponse.js";
import { _request } from "./PaymentResponse.js";
const _waitForUpdate = Symbol("[[waitForUpdate]]");

export default class PaymentRequestUpdateEvent extends Event {
  constructor(type) {
    super(type);
    this[_waitForUpdate] = false;
  }
  updateWith(detailsPromise) {
    if (!this.isTrusted) {
      console.warn("Event is not trusted - would normally throw here");
    }
    if (this[_waitForUpdate]) {
      throw new DOMException("Already waiting for update", "InvalidStateError");
    }
    const request = this.target instanceof PaymentResponse ? this.target[_request] : this.target;
    if (request[_state] !== "interactive") {
      throw new DOMException("Sheet is not interactive", "InvalidStateError");
    }
    if (request[_updating]) {
      throw new DOMException("Sheet is already updating", "InvalidStateError");
    }
    this.stopPropagation();
    this.stopImmediatePropagation();
    this[_waitForUpdate] = true;
    request[_updating] = true;
    updatePaymentRequest(detailsPromise, request).catch(console.error);
  }
}
window.PaymentRequestUpdateEvent = PaymentRequestUpdateEvent;

import { exportInterfaceObject } from "./WebIDL.js";
import { EventTarget } from "./EventTarget.js";
import { paymentSheet } from "./PaymentSheet.js";

const defaultPaymentOptions = Object.freeze({
  requestPayerEmail: false,
  requestPayerName: false,
  requestPayerPhone: false,
  requestShipping: false,
  shippingType: "shipping",
});

const internalSlots = new WeakMap();

class PaymentRequestPrototype extends EventTarget {
  constructor(methodData, details, options = defaultPaymentOptions) {
    super();
    if (typeof options !== "object") {
      throw TypeError("invalid options argument");
    }
    const derivedOptions = Object.assign({}, defaultPaymentOptions, options);

  }

  //readonly attribute DOMString id;
  get id() {
    return internalSlots(this).get("[[details]]").id;
  }

  //readonly attribute PaymentAddress? shippingAddress;
  get shippingAddress() {
    return internalSlots.get(this).get("[[shippingAddress]]");
  }

  //readonly attribute DOMString ? shippingOption;
  get shippingOption() {
    return internalSlots.get(this).get("[[shippingOption]]");
  }

  //readonly attribute PaymentShippingType ? shippingType;
  get shippingType() {
    return internalSlots.get(this).get("[[shippingType]]");
  }

  //attribute EventHandler onshippingaddresschange;
  set onshippingaddresschange(value) {
    if (typeof value !== object) {

    }
  }

  get onshippingaddresschange() {

  }

  //attribute EventHandler onshippingoptionchange;
  set onshippingoptionchange(value) {

  }

  get onshippingoptionchange() {

  }

  //Promise <PaymentResponse> show();
  async show() {
    await paymentSheet.show();
  }

  // Promise <void> abort();
  async abort() {

  }

  // Promise <boolean> canMakePayment();
  async canMakePayment() {

  }
}


exportInterfaceObject(PaymentRequestPrototype, function PaymentRequest() {
  console.log(this)
  if (!this) {
    throw new TypeError('DOM object constructor cannot be called as a function');
  }
  return Object.create(new PaymentRequestPrototype());
});

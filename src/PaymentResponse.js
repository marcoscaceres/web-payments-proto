import paymentSheet from "./PaymentSheet.js";

const PaymentCompleteEnum = Object.freeze([
  "fail",
  "success",
  "unknown",
]);

const internalSlots = new WeakMap();

export default class PaymentResponse {
  constructor(request, requestOptions, responseDetail){
    const { requestShipping, requestPayerName, requestPayerPhone } = requestOptions;
    internalSlots.set(this, new Map([
      ["[[completeCalled]]", false],
      ["[[details]]", Object.assign({}, responseDetail.details)],
      ["[[id]]", request.id],
      ["[[methodName]]", responseDetail.methodName],
      ["[[payerName]]", requestPayerName ? responseDetail.payerName : null],
      ["[[payerPhone]]", requestPayerPhone ? responseDetail.payerPhone : null],
      ["[[shippingAddress]]", requestShipping ? responseDetail.shippingAddress : null],
      ["[[shippingOption]]", request.selectedShippingOption],
    ]));
    // Set the details attribute value of response to an object containing 
    // the payment method specific message that will be used by the merchant 
    // to process the transaction. The format of this response will be defined
    // for each payment method.
  }

  
  //readonly attribute DOMString requestId;
  get requestId(){
    return internalSlots.get(this).get("[[id]]"); 
  }
  //readonly attribute DOMString methodName;
  get methodName(){
    return internalSlots.get(this).get("[[methodName]]"); 
  }
  //readonly attribute object details;
  get details(){
   return internalSlots.get(this).get("[[details]]");  
  }

  //readonly attribute PaymentAddress? shippingAddress;
  get shippingAddress(){
    return internalSlots.get(this).get("[[shippingAddress]]"); 
  }
  //readonly attribute DOMString? shippingOption;
  get shippingOption(){
    return internalSlots.get(this).get("[[shippingOption]]"); 
  }
  
  //readonly attribute DOMString? payerName;
  get payerName(){
    return internalSlots.get(this).get("[[payerName]]"); 
  }
  //readonly attribute DOMString? payerEmail;
  get payerEmail(){
    return internalSlots.get(this).get("[[payerEmail]]");
  }
  //readonly attribute DOMString? payerPhone;
  get payerPhone(){
    return internalSlots.get(this).get("[[payerPhone]]");
  }

  //Promise<void> complete(optional PaymentComplete result = "unknown");
  async complete(result = "unknown"){
    if(!PaymentCompleteEnum.includes(result)){
      throw new TypeError("Invalid argument value: " + result);
    }
    const slots = internalSlots.get(this);
    if(slots.get("[[completeCalled]]")){
      throw new DOMException("Reponse already completed", "InvalidStateError");
    }
    slots.set("[[completeCalled]]", true);
    await paymentSheet.requestClose(result);
  }

  //serializer = { attribute };
  toJSON(){
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
};

window.PaymentResponse = PaymentResponse;

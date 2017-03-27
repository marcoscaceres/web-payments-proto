const privates = new WeakMap();

export default class PaymentAddress {
  constructor(details){
    const priv = privates.set(this, new Map()).get(this);
  }
  // serializer = {attribute};
  toJSON(){

  }
  // readonly attribute DOMString              region;
  
  // readonly attribute FrozenArray<DOMString> addressLine;
  // readonly attribute DOMString              country;
  // readonly attribute DOMString              city;
  // readonly attribute DOMString              dependentLocality;
  // readonly attribute DOMString              postalCode;
  // readonly attribute DOMString              sortingCode;
  // readonly attribute DOMString              languageCode;
  // readonly attribute DOMString              phone;
  // readonly attribute DOMString              organization;
  // readonly attribute DOMString              recipient;
};
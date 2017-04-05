const privates = new WeakMap();


export default class PaymentAddress {
  constructor(details){
    const priv = privates.set(this, new Map()).get(this);
    details
      .keys(key => [`[[${key}]]`, details[key]])
      .reduce((accum, [internalSlotName, value]) => priv.set(internalSlotName, value) , priv);
  }
  // serializer = {attribute};
  toJSON(){
    JSON.stringify({
      region: this.region,
      country: this.country,
      city: this.city,
      dependentLocality: this.dependentLocality,
      postalCode: this.postalCode,
      sortingCode: this.sortingCode,
      languageCode: this.languageCode,
      phone: this.phone,
      organization: this.organization,
      recipient: this.recipient,
    });
  }
  // readonly attribute DOMString region;
  get region(){
    return privates.get(this).get("[[region]]");
  }
  // readonly attribute FrozenArray<DOMString> addressLine;
  get addressLine(){
    return privates.get(this).get("[[addressLine]]");
  }
  // readonly attribute DOMString country;
  get country(){
    return privates.get(this).get("[[country]]");
  }
  // readonly attribute DOMString city;
  get city(){
    return privates.get(this).get("[[city]]");
  }
  // readonly attribute DOMString dependentLocality;
  get dependentLocality(){
    return privates.get(this).get("[[dependentLocality]]");
  }
  // readonly attribute DOMString postalCode;
  get postalCode(){
    return privates.get(this).get("[[postalCode]]");
  }
  // readonly attribute DOMString sortingCode;
  get sortingCode(){
    return privates.get(this).get("[[sortingCode]]");
  }
  // readonly attribute DOMString languageCode;
  get languageCode(){
    return privates.get(this).get("[[languageCode]]");
  }
  // readonly attribute DOMString phone;
  get phone(){
    return privates.get(this).get("[[phone]]");
  }
  // readonly attribute DOMString organization;
  get organization(){
    return privates.get(this).get("[[organization]]");
  }
  // readonly attribute DOMString recipient;
  get recipient(){
    return privates.get(this).get("[[recipient]]");
  }
}

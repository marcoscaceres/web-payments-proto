const privates = new WeakMap();

const expectedStringKeys = Object.freeze([
  "city",
  "country",
  "dependentLocality",
  "languageCode",
  "organization",
  "phone",
  "postalCode",
  "recipient",
  "region",
  "sortingCode",
]);
const expectedArrayKeys = Object.freeze([
  "addressLine",
]);

function typeMapper(typeConverter){
  return function(details){
    return key => [`[[${key}]]`, typeConverter(details.hasOwnProperty(key) ? details[key] : "")];
  };
}

const stringMapper = typeMapper(value => String(value));
const arrayMapper = typeMapper(value => Array(...value));

export default class PaymentAddress {
  constructor(details) {
    const priv = privates.set(this, new Map()).get(this);
    // Build internal slots [["foo"]] and reduce in to priv
    expectedStringKeys
      .map(stringMapper(details))
      .concat(expectedArrayKeys.map(arrayMapper(details)))
      .reduce((accum, [internalSlotName, value]) => priv.set(internalSlotName, value), priv);
  }
  // serializer = {attribute};
  toJSON() {
    JSON.stringify({
      city: this.city,
      country: this.country,
      dependentLocality: this.dependentLocality,
      languageCode: this.languageCode,
      organization: this.organization,
      phone: this.phone,
      postalCode: this.postalCode,
      recipient: this.recipient,
      region: this.region,
      sortingCode: this.sortingCode,
    });
  }
  // readonly attribute DOMString region;
  get region() {
    return privates.get(this).get("[[region]]");
  }
  // readonly attribute FrozenArray<DOMString> addressLine;
  get addressLine() {
    return privates.get(this).get("[[addressLine]]");
  }
  // readonly attribute DOMString country;
  get country() {
    return privates.get(this).get("[[country]]");
  }
  // readonly attribute DOMString city;
  get city() {
    return privates.get(this).get("[[city]]");
  }
  // readonly attribute DOMString dependentLocality;
  get dependentLocality() {
    return privates.get(this).get("[[dependentLocality]]");
  }
  // readonly attribute DOMString postalCode;
  get postalCode() {
    return privates.get(this).get("[[postalCode]]");
  }
  // readonly attribute DOMString sortingCode;
  get sortingCode() {
    return privates.get(this).get("[[sortingCode]]");
  }
  // readonly attribute DOMString languageCode;
  get languageCode() {
    return privates.get(this).get("[[languageCode]]");
  }
  // readonly attribute DOMString phone;
  get phone() {
    return privates.get(this).get("[[phone]]");
  }
  // readonly attribute DOMString organization;
  get organization() {
    return privates.get(this).get("[[organization]]");
  }
  // readonly attribute DOMString recipient;
  get recipient() {
    return privates.get(this).get("[[recipient]]");
  }
}

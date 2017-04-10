import hyperHTML from "hyperhtml/hyperhtml.js";
/**
interface PaymentAddress {
    serializer = {attribute};
    readonly attribute DOMString              country;
    readonly attribute FrozenArray<DOMString> addressLine;
    readonly attribute DOMString              region;
    readonly attribute DOMString              city;
    readonly attribute DOMString              dependentLocality;
    readonly attribute DOMString              postalCode;
    readonly attribute DOMString              sortingCode;
    readonly attribute DOMString              languageCode;
    readonly attribute DOMString              organization;
    readonly attribute DOMString              recipient;
    readonly attribute DOMString              phone;
};
 */

export default class Addressformat {
  constructor(locales, options = {}){

  }

  format(paymentAddress, outputFormat="text"){
    let result; 
    switch(outputFormat){
    case "html": {
      result = hyperHTML.wire(paymentAddress)`
          <div>
            ${paymentAddress.addressLine.join(" ")}
          </div>
          <div>
            ${paymentAddress.city}, ${paymentAddress.region} ${paymentAddress.country}
          </div>
          <div>
            ${paymentAddress.postalCode}
          </div>
        `;
      break;
    }
    default:
      result = `${paymentAddress.addressLine.join(" ")}\n${paymentAddress.city}, ${paymentAddress.region} ${paymentAddress.country}`;
    }
    return result;
  }

  static supportedLocalesOf(locales, options = {}){

  }
}

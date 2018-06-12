import { wire } from "hyperhtml/cjs";
import Countries from "../Countries";
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

export default class AddressFormat {
  // constructor(locales, options = {}) {}

  format(paymentAddress, outputFormat = "text") {
    let result;
    const { name: countryName } = {
      name: "",
      ...Countries.get(paymentAddress.country),
    };
    switch (outputFormat) {
      case "html":
        result = wire(paymentAddress)`
          <div>
            ${paymentAddress.addressLine.join(" ")}
          </div>
          <div>
            ${paymentAddress.city}, ${paymentAddress.region}
          </div>
          <div>
             ${countryName.toLocaleUpperCase()} ${paymentAddress.postalCode}
          </div>
        `;
        break;
      default:
        result = `${paymentAddress.addressLine.join(" ")} ${
          paymentAddress.city
        }, ${paymentAddress.region} ${countryName}`;
    }
    return result;
  }

  static supportedLocalesOf(locales, options = {}) {}
}

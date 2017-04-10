import PaymentAddress from "./PaymentAddress";
const privates = new WeakMap();
const toString = value => String(value);
const toPaymentAddress = address => new PaymentAddress(address);
const members = new Map([
  ["billingAddress", toPaymentAddress],
  ["cardholderName", toString],
  ["cardNumber", toString],
  ["cardSecurityCode", toString],
  ["expiryMonth", toString],
  ["expiryYear", toString],
]);

export default class BasicCardResponse {
  constructor(details) {
    const priv = privates.set(this, new Map()).get(this);
    if (typeof details !== "object") {
      throw TypeError("Expected object for details");
    }
    if (("cardNumber" in details) === false) {
      throw TypeError("cardNumber member is required");
    }
    if ("billingAddress" in details && !(details.billingAddress instanceof PaymentAddress)) {
      throw TypeError("Expected billingAddress to be a PaymentAddress");
    }
    // Save members as privates
    Array
      .from(members.entries())
      .filter(([member]) => member in details)
      .reduce(
        (accum, [member, caster]) => priv.set(member, caster(details[member])), priv
      );
  }
  // DOMString cardholderName;
  get cardholderName() {
    return privates.get(this).get("cardholderName");
  }
  // required DOMString cardNumber;
  get cardNumber() {
    return privates.get(this).get("cardNumber");
  }
  // DOMString expiryMonth;
  get expiryMonth() {
    return privates.get(this).get("expiryMonth");
  }
  // DOMString expiryYear;
  get expiryYear() {
    return privates.get(this).get("expiryYear");
  }
  // DOMString cardSecurityCode;
  get cardSecurityCode() {
    return privates.get(this).get("cardSecurityCode");
  }
  //PaymentAddress? billingAddress;
  get billingAddress() {
    return privates.get(this).get("billingAddress");
  }
}

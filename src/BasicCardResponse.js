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

const ccTypes = new Map([
  ["American Express", [34, 37]],
  ["CARDGUARD EAD BG ILS", [5392]],
  ["China UnionPay", [62]],
  ["Dankort", [5019]],
  ["Diners Club", [[300, 305], 309, 36, [38, 39]]],
  ["Discover Card", [6011, [622126, 622925], [644, 649], 65]],
  ["JCB", [[3528, 3589]]],
  ["Maestro", [50, [56, 58], 6]],
  ["MasterCard", [[2221, 2720], [51, 55]]],
  ["MIR", [[2200, 2204]]],
  ["UATP", [1]],
  ["Verve", [[506099, 506198], [650002, 650027]]],
  ["Visa", [4]],
]);

export default class BasicCardResponse {
  constructor(details) {
    const priv = privates.set(this, new Map()).get(this);
    if (typeof details !== "object") {
      throw TypeError("Expected object for details");
    }
    if ("cardNumber" in details === false) {
      throw TypeError("cardNumber member is required");
    }
    if (
      "billingAddress" in details &&
      !(details.billingAddress instanceof PaymentAddress)
    ) {
      throw TypeError("Expected billingAddress to be a PaymentAddress");
    }
    // Save members as privates
    Array.from(members.entries())
      .filter(([member]) => member in details)
      .reduce(
        (accum, [member, caster]) => priv.set(member, caster(details[member])),
        priv
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
  /**
   * Luhn algorithm
   *
   * Used for validating credit card numbers.
   * https://en.wikipedia.org/wiki/Luhn_algorithm
   * based on https://gist.github.com/DiegoSalazar/4075533
   */
  static isValid(ccNumber) {
    if (/^\d+$/.test(ccNumber) === false) {
      return false;
    }
    let nCheck = 0;
    let nDigit = 0;
    let bEven = false;
    var value = ccNumber.replace(/\D/g, "");
    for (var n = value.length - 1; n >= 0; n--) {
      var cDigit = value.charAt(n);
      nDigit = parseInt(cDigit, 10);

      if (bEven) {
        if ((nDigit *= 2) > 9) nDigit -= 9;
      }

      nCheck += nDigit;
      bEven = !bEven;
    }
    return nCheck % 10 === 0;
  }

  static getCardNetwork(ccNumber) {
    const found = Array.from(ccTypes.entries()).find(([, startValues]) => {
      return startValues.find(
        startValue =>
          Array.isArray(startValue)
            ? inRange(ccNumber, startValue)
            : ccNumber.startsWith(startValue)
      );
    });
    return found ? found[0] : "";
  }
}

function inRange(ccNumber, [start, end]) {
  if (start > end) {
    throw RangeError("start greater than end?");
  }
  while (start <= end) {
    if (ccNumber.startsWith(String(start))) {
      return true;
    }
    start++;
  }
  return false;
}

window.pp = BasicCardResponse;

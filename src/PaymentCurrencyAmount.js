const privates = new WeakMap();
const currencySplitter = /(^\w*)\$(\d*\.*\d*)/;
const wellFormedCurrencyCode = /[A-Z]{3}/;
const validDecimalMonetaryValue = /^-?[0-9]+(\.[0-9]+)?$/;

export default class PaymentCurrencyAmount {
  constructor(currency, value) {
    const details = {
      currency,
      value,
    };
    PaymentCurrencyAmount.checkAndCanonicalize(details);
    if (!PaymentCurrencyAmount.isValid(value)) {
      throw TypeError("Invalid decimal monetary value");
    }
    const priv = privates.set(this, new Map()).get(this);
    priv.set("currency", details.currency);
    priv.set("value", details.value);
    priv.set(
      "formatter",
      new Intl.NumberFormat(navigator.languages, {
        style: "currency",
        currency,
        currencyDisplay: "symbol",
      })
    );
  }
  get currency() {
    return privates.get(this).get("currency");
  }
  set currency(value) {
    if (!wellFormedCurrencyCode.test(value)) {
      throw new RangeError("Invalid currency code");
    }
    return privates.get(this).set("currency", value);
  }
  get value() {
    return privates.get(this).get("value");
  }
  toString() {
    return privates
      .get(this)
      .get("formatter")
      .format(this.value);
  }
  toObject() {
    return {
      currency: this.currency,
      value: this.value,
    };
  }
  /**
   * @param {PaymentCurrencyAmount} amount
   */
  static checkAndCanonicalize(amount) {
    const { currency, value } = amount;
    if (!wellFormedCurrencyCode.test(currency.toLocaleUpperCase())) {
      throw new RangeError("Invalid currency code");
    }
    if (!PaymentCurrencyAmount.isValid(value)) {
      throw new RangeError("Invalid currency value");
    }
    amount.currency = currency.toUpperCase();
  }
  static checkAndCanonicalizeTotal(value) {
    PaymentCurrencyAmount.checkAndCanonicalize(value);
    if (value.amount.startsWith("-")) {
      throw TypeError("Total amount can't be a negative number.");
    }
  }
  static parseAmount(fullAmount) {
    const [, currency, value] = currencySplitter.exec(fullAmount);
    return new PaymentCurrencyAmount(currency, value);
  }
  static isValid(value) {
    return validDecimalMonetaryValue.test(value);
  }
  static isPositive(value) {
    return PaymentCurrencyAmount.isValid(value) && value[0] !== "\u002D";
  }
}

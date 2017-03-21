import { currencies } from "./currencies.js";
const privates = new WeakMap();
const currencySplitter = /(^\w*)\$(\d*\.*\d*)/;
const validDecimalMonetaryValue = /^-?[0-9]+(\.[0-9]+)?$/;

export default class PaymentCurrencyAmount {
  constructor(currency, value) {
    if (!currencies.has(currency)) {
      throw new TypeError(`Unknown currency: ${currency}`);
    }
    if (!validDecimalMonetaryValue.test(String(value))) {
      throw TypeError("Invalid decimal monetary value");
    }
    const priv = privates.set(this, new Map()).get(this);
    priv.set("currency", currency);
    priv.set("value", value);
  }
  get currency() {
    return privates.get(this).get("currency");
  }
  get value() {
    return privates.get(this).get("value");
  }
  toString() {
    const { symbol } = currencies.get(this.currency);
    return `${this.currency}${symbol}${this.value}`;
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
};

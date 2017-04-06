import Localizable from "./Localizable";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount.js";

const privates = new WeakMap();

export default class DisplayItem extends Localizable {
  constructor(label, amount) {
    super();
    if (!(amount instanceof PaymentCurrencyAmount)) {
      throw new TypeError("Amount must be a PaymentCurrencyAmount");
    }
    const priv = privates.set(this, new Map()).get(this);
    priv.set("label", String(label));
    priv.set("amount", amount);
  }
  get label() {
    return privates.get(this).get("label");
  }
  get amount() {
    return privates.get(this).get("amount");
  }
  toObject() {
    return Object.assign(super.toObject(), {
      label: this.label,
      amount: this.amount.toObject(),
    });
  }
}

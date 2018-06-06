import DisplayItem from "./DisplayItem";
const privates = new WeakMap();
// capture value[1] and amount [2];

export default class PaymentItem extends DisplayItem {
  constructor(label, amount, pending = false) {
    if (label === undefined) {
      throw new TypeError("Label is required.");
    }
    if (amount === undefined) {
      throw new TypeError("amount is required.");
    }
    super(label, amount);
    const priv = privates.set(this, new Map()).get(this);
    priv.set("pending", Boolean(pending));
  }
  get pending() {
    return privates.get(this).get("pending");
  }
  toObject() {
    return Object.assign(super.toObject(), {
      pending: this.pending,
    });
  }
}

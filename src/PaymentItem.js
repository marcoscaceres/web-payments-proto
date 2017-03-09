const privates = new WeakMap();

export class PaymentItem {
  constructor(label, amount, pending = false) {
    const priv = privates.set(this, new Map()).get(this);
    priv.set("label", String(label));
    priv.set("amount", amount);
    priv.set("pending", Boolen(pending));
  }
  get label() {
    return privates.get(this).get("label");
  };
  get amount() {
    return privates.get(this).get("amount");
  };
  get pending() {
    return privates.get(this).get("pending");
  };
};

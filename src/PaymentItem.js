import DisplayItem from "./DisplayItem";
const privates = new WeakMap();
// capture value[1] and amount [2];

export default class PaymentItem extends DisplayItem {
  constructor(label, amount, pending = false) {
    super(label, amount);
    const priv = privates.set(this, new Map()).get(this);
    priv.set("pending", Boolean(pending));
  }
  get pending() {
    return privates.get(this).get("pending");
  }
  toObject(){
    return Object.assign(super.toObject(), {
      pending: this.pending,
    });
  }
}

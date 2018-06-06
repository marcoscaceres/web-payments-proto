import DisplayItem from "./DisplayItem";

const privates = new WeakMap();

export default class PaymentShippingOption extends DisplayItem {
  constructor(id, label, amount, selected = false) {
    super(label, amount);
    const priv = privates.set(this, new Map()).get(this);
    priv.set("id", String(id));
    priv.set("selected", Boolean(selected));
  }
  get id() {
    return privates.get(this).get("id");
  }
  get selected() {
    return privates.get(this).get("selected");
  }
  set selected(value) {
    return privates.get(this).set("selected", Boolean(value));
  }
  toObject() {
    return Object.assign(super.toObject(), {
      id: this.id,
      selected: this.selected,
    });
  }
}

const privates = new WeakMap();

export class PaymentShippingOption {
  constructor(id, label, amount, selected = false) {
    const priv = privates.set(this, new Map()).get(this);
    priv.set("id", String(id));
    priv.set("label", String(label));
    priv.set("amount", String(amount));
    priv.set("selected", Boolean(selected));
  }
  get id(){
    return privates.get(this).get("id");
  }
  get label(){
    return privates.get(this).get("label");
  }
  get amount(){
    return privates.get(this).get("amount");
  }
  get selected(){
    return privates.get(this).get("selected");
  }
};

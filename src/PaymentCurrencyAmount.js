const privates = new WeakMap();

export class PaymentCurrencyAmount {
  constructor(currency, value){
    const priv = privates.set(this, new Map()).get(this);
    priv.set("currency", currency);
    priv.set("value", value);
  }
  get currency(){
    return privates.get(this).get("currency")
  }
  get value(){
    return privates.get(this).get("value")
  }
  toString(){
    return `${this.currency}${this.value}`;
  }
};

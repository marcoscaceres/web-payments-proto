const states = new Set(["created", "interactive", "closed"]);
const privates = new WeakMap();

export default class PaymentRequestSlots {
  constructor() {
    privates.set(this, new Map());
    this.state = "created";
    this.updating = false;
    this.shippingAddress = null;
  }
  get details() {
    return privates.get(this).get("details");
  }
  set details(value) {
    privates.get(this).set("details", value);
    return value;
  }
  get options() {
    return privates.get(this).get("options");
  }
  set options(value) {
    privates.get(this).set("options", value);
    return value;
  }
  get serializedMethodData() {
    return privates.get(this).get("serializedMethodData");
  }
  set serializedMethodData(value) {
    privates.get(this).set("serializedMethodData", value);
    return value;
  }
  get serializedModifierData() {
    return privates.get(this).get("serializedModifierData");
  }
  set serializedModifierData(value) {
    privates.get(this).set("serializedModifierData", value);
    return value;
  }
  get state() {
    return privates.get(this).get("state");
  }
  set state(value) {
    if (!states.has(value)) {
      throw new TypeError(`Invalid state value: ${value}`);
    }
    privates.get(this).set("state", value);
    return value;
  }
  get updating() {
    return privates.get(this).get("updating");
  }
  set updating(value) {
    privates.get(this).set("updating", value);
    return value;
  }
  get shippingAddress() {
    return privates.get(this).get("shippingAddress");
  }
  set shippingAddress(value) {
    privates.get(this).set("shippingAddress", value);
    return value;
  }
  get selectedShippingOption() {
    return privates.get(this).get("selectedShippingOption");
  }
  set selectedShippingOption(value) {
    privates.get(this).set("selectedShippingOption", value);
    return value;
  }
  get acceptPromise() {
    return privates.get(this).get("acceptPromise");
  }
  set acceptPromise(value) {
    privates.get(this).set("acceptPromise", value);
    return value;
  }
}

const privates = new WeakMap();
export default class PaymentRequestUpdateEventSlots {
  constructor() {
    const privates = new WeakMap();
    privates.set(this, new Map());
    this.waitForUpdate = false;
  }
  get waitForUpdate() {
    return privates.get(this).get("waitForUpdate");
  }
  set waitForUpdate(value) {
    privates.get(this).set("waitForUpdate", value);
    return value;
  }
}

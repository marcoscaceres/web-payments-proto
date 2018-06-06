import { bind } from "hyperhtml/cjs";
const privates = new WeakMap();

export default class RenderableWidget extends EventTarget {
  constructor(element, active = true) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    this.active = active;
    priv.set("renderer", bind(element));
    priv.set("element", element);
    priv.set("disabled", false);
  }

  /**
   * @param {PaymentRequest} request
   */
  set request(request) {
    const priv = privates.get(this);
    priv.set("request", request);
  }
  /**
   * @returns {PaymentRequest}
   */
  get request() {
    const priv = privates.get(this);
    return priv.get("request");
  }

  disable() {
    privates.get(this).set("disabled", true);
    this.render();
  }

  enable() {
    privates.get(this).set("disabled", false);
    this.render();
  }

  get isDisabled() {
    return privates.get(this).get("disabled");
  }

  get renderer() {
    return privates.get(this).get("renderer");
  }

  get active() {
    return privates.get(this).get("active");
  }

  set active(value) {
    return privates.get(this).set("active", Boolean(value));
  }

  get element() {
    return privates.get(this).get("element");
  }

  render() {
    throw new Error("Abstact method.");
  }
}

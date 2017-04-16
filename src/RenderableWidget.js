import EventTarget from "event-target-shim";
import hyperHTML from "hyperhtml/hyperhtml.js";
const privates = new WeakMap();

export default class RenderableWidget extends EventTarget {
  constructor(element, active = true) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    this.active = active;
    priv.set("renderer", hyperHTML.bind(element));
    priv.set("element", element);
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

import EventTarget from "event-target-shim";
const privates = new WeakMap();

export default class WidgetManager {
  constructor(...widgets) {
    const priv = privates.set(this, new Map()).get(this);
    priv.set("widgets", widgets);
  }
}

const privates = new WeakMap();

const AddEventListenerOptions = Object.freeze({
  capture: false,
  once: false,
  passive: false,
});

export class EventTarget {
  constructor() {
    const dispatcher = document.createElement("x-dispatcher");
    privates.set(this, new Map([
      ["dispatcher", dispatcher],
    ]));
  }

  addEventListener(type, cb, ops = AddEventListenerOptions) {
    const dispatcher = privates.get(this).get("dispatcher");
    dispatcher.addEventListener(type, cb, ops);
  }

  dispatchEvent(ev) {
    const dispatcher = privates.get(this).get("dispatcher");
    dispatcher.dispatchEvent(ev);
  }

  removeEventListener(type, cb, ops = AddEventListenerOptions) {
    const dispatcher = privates.get(this).get("dispatcher");
    dispatcher.removeEventListener(type, cb, ops);
  }
}

import { bind } from "hyperhtml/cjs";
const privates = new WeakMap();

export default class Renderable {
  constructor(elem) {
    const priv = privates.set(this, new Map()).get(this);
    let containerElem;
    switch (typeof elem) {
      case "string":
        containerElem = document.createElement(elem);
        break;
      default:
        containerElem = elem;
    }
    priv.set("containerElem", containerElem);
    priv.set("renderer", bind(containerElem));
  }
  get containerElem() {
    return privates.get(this).get("containerElem");
  }
  get renderer() {
    return privates.get(this).get("renderer");
  }
  render() {
    throw new Error("Abstract! make your own!");
  }
}

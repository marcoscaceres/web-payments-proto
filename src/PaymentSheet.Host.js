import { bind } from "hyperhtml/cjs";
import RenderableWidget from "./RenderableWidget";

const privates = new WeakMap();

export default class Host extends RenderableWidget {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    containerElem.id = "payment-sheet-host";
    priv.set("renderer", bind(containerElem));
  }
  render() {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    return renderer`<p>Requested by <span>${window.location.host}</span></p>`;
  }
}

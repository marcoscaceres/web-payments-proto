import hyperHTML from "hyperhtml/hyperhtml";
import Controls from "./PaymentSheet.Controls";
const privates = new WeakMap();
import EventTarget from "event-target-shim";

export default class DataSheet extends EventTarget(["abort"]) {
  constructor(heading, dataForm) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    containerElem.classList.add("payment-sheet-data-collector");
    priv.set("containerElem", containerElem);
    priv.set("heading", heading);
    priv.set("renderer", hyperHTML.bind(containerElem));
    const controlButtons = new Controls();
  }
  render(data) {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const heading = priv.get("heading");
    return renderer `<h2>${heading}</h2>
      <section>${form.render()}</section>
    `;
  }
  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}

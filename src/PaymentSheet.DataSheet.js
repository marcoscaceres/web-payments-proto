import hyperHTML from "hyperhtml/hyperhtml";
import Controls from "./PaymentSheet.DataSheetControls";
const privates = new WeakMap();
import EventTarget from "event-target-shim";

export default class DataSheet extends EventTarget(["abort"]) {
  constructor(heading, dataCollector) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    containerElem.classList.add("payment-sheet-data-collector");
    priv.set("dataCollector", dataCollector);
    priv.set("heading", heading);
    priv.set("renderer", hyperHTML.bind(containerElem));
    const controlButtons = new Controls(this);

    dataCollector.addEventListener("cancontinue", () => {
      console.log("can continue");
      controlButtons.activate();
    });

    dataCollector.addEventListener("invalid", () => {
      console.log("invalid, disable");
      controlButtons.deactivate();
    });

    priv.set("controlButtons", controlButtons);
  }
  render(requestData) {
    const priv = privates.get(this);
    const dataCollector = priv.get("dataCollector");
    const renderer = priv.get("renderer");
    const heading = priv.get("heading");
    const controlButtons = priv.get("controlButtons");
    return renderer `<h2 hidden="${!heading}">${heading}</h2>
    <section>${dataCollector.render(requestData)}</section>
    <section>${controlButtons.render(dataCollector.buttonLabels)}</section>`;
  }
  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}

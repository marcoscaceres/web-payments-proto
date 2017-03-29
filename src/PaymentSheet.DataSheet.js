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
    dataCollector.addEventListener("datacollected", () => {
      console.log("something changes");
      controlButtons.activate();
    });
    priv.set("controlButtons", controlButtons);
  }
  render() {
    const priv = privates.get(this);
    const dataCollector = priv.get("dataCollector");
    const renderer = priv.get("renderer");
    const heading = priv.get("heading");
    const controlButtons = priv.get("controlButtons");
    return renderer `<h2>${heading}</h2>
    <section>${dataCollector.render()}</section>
    <section>${controlButtons.render()}</section>`;
  }
  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}

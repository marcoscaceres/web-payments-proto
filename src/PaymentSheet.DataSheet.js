import hyperHTML from "hyperhtml/hyperhtml";
import Controls from "./PaymentSheet.DataSheetControls";
import EventTarget from "event-target-shim";
const privates = new WeakMap();
const events = Object.freeze([
  "abort",
]);

export default class DataSheet extends EventTarget(events) {
  constructor(heading, dataCollector) {
    super();
    const controlButtons = new Controls(dataCollector.buttonLabels);
    controlButtons.addEventListener("continue", () => {
      this.dispatchEvent(new CustomEvent("continue"));
    });
    controlButtons.addEventListener("cancel", () => {
      this.dispatchEvent(new CustomEvent("abort"));
    })
    const form = document.createElement("form");
    form.classList.add("payment-sheet-data-collector");
    form.addEventListener("change", this.validate.bind(this));
    form.addEventListener("submit", e => e.preventDefault());
    dataCollector.addEventListener("datacollected", async () => {
      await this.validate()
    });
    dataCollector.addEventListener("invaliddata", async () => {
      await this.validate()
    });
    const priv = privates.set(this, new Map()).get(this);
    priv.set("controlButtons", controlButtons);
    priv.set("dataCollector", dataCollector);
    priv.set("form", form);
    priv.set("heading", heading);
    priv.set("renderer", hyperHTML.bind(form));
    priv.set("ready", Promise.resolve(dataCollector.ready));
  }

  get ready() {
    return privates.get(this).get("ready");
  }

  get isValid() {
    return privates.get(this).get("form").checkValidity();
  }

  async validate() {
    const priv = privates.get(this);
    const dataCollector = priv.get("dataCollector");
    const controlButtons = priv.get("controlButtons");
    const form = priv.get("form");
    if (!form.checkValidity()) {
      controlButtons.deactivate();
      return;
    }
    controlButtons.activate();
    await dataCollector.save();
  }

  render(requestData) {
    const priv = privates.get(this);
    const dataCollector = priv.get("dataCollector");
    const renderer = priv.get("renderer");
    const heading = priv.get("heading");
    const controlButtons = priv.get("controlButtons");
    return renderer `
    <h2 hidden="${!heading}">
      ${heading}
    </h2>
    <section>${dataCollector.render(requestData)}</section>
    <section>${controlButtons.render(dataCollector.buttonLabels)}</section>`;
  }
}

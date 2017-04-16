import hyperHTML from "hyperhtml/hyperhtml";
import Controls from "./PaymentSheet.DataSheetControls";
import EventTarget from "event-target-shim";
const privates = new WeakMap();

export default class DataSheet extends EventTarget(["abort"]) {
  constructor(heading, dataCollector, options = { userMustChoose: false }) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    priv.set("form", form);
    dataCollector.dataSheet = this;
    const controlButtons = new Controls(dataCollector.buttonLabels);
    controlButtons.addEventListener("continue", () => {
      this.dispatchEvent(new CustomEvent("continue"));
    });
    controlButtons.addEventListener("cancel", () => {
      this.dispatchEvent(
        new CustomEvent("abort", { detail: { reason: "User aborted." } })
      );
    });
    form.classList.add("payment-sheet-data-collector");
    const changeListener = async ev => {
      this.validate();
      await dataCollector.save();
    };
    form.addEventListener("keyup", changeListener);
    form.addEventListener("change", changeListener);
    form.addEventListener("submit", ev => {
      ev.preventDefault();
      return false;
    });
    dataCollector.addEventListener("invaliddata", this.validate.bind(this));

    priv.set("controlButtons", controlButtons);
    priv.set("dataCollector", dataCollector);
    priv.set("heading", heading);
    priv.set("renderer", hyperHTML.bind(form));
    priv.set(
      "ready",
      dataCollector.ready.then(() => {
        this.render();
      })
    );
    priv.set("userMustChoose", options.userMustChoose);
  }
  get userMustChoose() {
    return privates.get(this).get("userMustChoose");
  }
  requestDisplay(nextSheet) {
    const opts = {
      detail: {
        sheet: this,
        nextSheet,
      },
    };
    this.dispatchEvent(new CustomEvent("requestdisplay", opts));
  }

  get collectedData() {
    return privates.get(this).get("dataCollector").toObject();
  }

  get form() {
    return privates.get(this).get("form");
  }

  get ready() {
    return privates.get(this).get("ready");
  }

  get isValid() {
    return privates.get(this).get("form").checkValidity();
  }

  validate() {
    const priv = privates.get(this);
    const dataCollector = priv.get("dataCollector");
    const controlButtons = priv.get("controlButtons");
    const form = priv.get("form");
    if (form.checkValidity()) {
      controlButtons.activate();
    } else {
      controlButtons.deactivate();
    }
  }

  reset() {
    const priv = privates.get(this);
    priv.get("dataCollector").form.reset();
  }

  render(requestData) {
    const priv = privates.get(this);
    const dataCollector = priv.get("dataCollector");
    const renderer = priv.get("renderer");
    const heading = priv.get("heading");
    const controlButtons = priv.get("controlButtons");
    return renderer`
    <h2 hidden="${!heading}">
      ${heading}
    </h2>
    <section>${dataCollector.render(requestData)}</section>
    <section>${controlButtons.render(dataCollector.buttonLabels)}</section>`;
  }
}

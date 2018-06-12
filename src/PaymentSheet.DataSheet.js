import { bind } from "hyperhtml/cjs";
import Controls from "./PaymentSheet.DataSheetControls";
const privates = new WeakMap();

export default class DataSheet extends EventTarget {
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
    const saveListener = async () => {
      this.validate();
      await dataCollector.save();
    };
    const changeListener = async () => {
      await saveListener();
      const detail = this.collectedData;
      const ev = new CustomEvent("change", { detail });
      this.dispatchEvent(ev);
    };
    form.addEventListener("keyup", saveListener);
    form.addEventListener("change", changeListener);
    form.addEventListener("submit", ev => {
      ev.preventDefault();
      return false;
    });
    dataCollector.addEventListener("invaliddata", this.validate.bind(this));
    const readyPromise = dataCollector.ready.then(() => {
      this.render();
      return this;
    });
    priv.set("controlButtons", controlButtons);
    priv.set("dataCollector", dataCollector);
    priv.set("heading", heading);
    priv.set("renderer", bind(form));
    priv.set("ready", readyPromise);
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
    return privates
      .get(this)
      .get("dataCollector")
      .toObject();
  }

  get form() {
    return privates.get(this).get("form");
  }

  get ready() {
    return privates.get(this).get("ready");
  }

  get isValid() {
    return privates
      .get(this)
      .get("form")
      .checkValidity();
  }

  validate() {
    const priv = privates.get(this);
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

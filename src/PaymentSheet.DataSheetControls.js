import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";

const defaultLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Continue",
});

const privates = new WeakMap();

export default class DataSheetControls extends EventTarget(["cancel", "continue"]) {
  constructor(labels = defaultLabels) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const containerElement = document.createElement("section");
    containerElement.classList.add("paysheet-controls");
    priv.set("canContinue", false);
    priv.set("labels", labels);
    priv.set("renderer", hyperHTML.bind(containerElement));
  }
  activate() {
    const priv = privates.get(this);
    priv.set("canContinue", true);
    this.render();
  }
  deactivate() {
    const priv = privates.get(this);
    priv.set("canContinue", false);
    this.render();
  }
  render({ cancelLabel, proceedLabel } = privates.get(this).get("labels")) {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const cancelHandler = () => {
      this.dispatchEvent(new CustomEvent("cancel"));
    };
    const continueHandler = () => {
      this.dispatchEvent(new CustomEvent("continue"));
    };
    const canContinue = !priv.get("canContinue");
    return renderer `
      <button class="cancel" onclick="${cancelHandler}">
        ${cancelLabel}
      </button>
      <button class="continue" onclick="${continueHandler}" disabled="${canContinue}">
        ${proceedLabel}
      </button>
    `;
  }
}

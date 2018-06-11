import { bind } from "hyperhtml/cjs";

const defaultLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Continue",
  nextSheet: null,
});

const privates = new WeakMap();

export default class DataSheetControls extends EventTarget {
  constructor(labels = defaultLabels) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const containerElement = document.createElement("section");
    containerElement.classList.add("paysheet-controls");
    priv.set("canContinue", false);
    priv.set("labels", labels);
    priv.set("renderer", bind(containerElement));
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
    return renderer`
      <button type="button" class="cancel" onclick="${cancelHandler}">
        ${cancelLabel}
      </button>
      <button type="submit" class="continue" onclick="${continueHandler}" disabled="${canContinue}">
        ${proceedLabel}
      </button>
    `;
  }
}

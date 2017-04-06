import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";

const privates = new WeakMap();

export default class DataSheetControls extends EventTarget(["cancel", "continue"]) {
  constructor(dataSheet) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    priv.set("canContinue", false);
    const containerElement = document.createElement("section");
    containerElement.classList.add("paysheet-controls");
    priv.set("renderer", hyperHTML.bind(containerElement));
    this.addEventListener("cancel", ()=>{
      dataSheet.dispatchEvent(new CustomEvent("abort"));
    });
    this.addEventListener("continue", ()=>{
      dataSheet.dispatchEvent(new CustomEvent("continue"));
    });
    priv.set("dataSheet", dataSheet);
  }
  activate(){
    const priv = privates.get(this);
    priv.set("canContinue", true);
    this.render(priv.get("dataSheet").buttonLabels);
  }
  deactivate(){
    const priv = privates.get(this);
    priv.set("canContinue", false);
    this.render(priv.get("dataSheet").buttonLabels);
  }
  render({cancelLabel, proceedLabel} = {cancelLabel: "Cancel", proceedLabel: "Continue"}) {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const cancelHandler = () => {
      this.dispatchEvent(new CustomEvent("cancel"));
    };
    const continueHandler = () => {
      console.log("next!");
      this.dispatchEvent(new CustomEvent("continue"));
    };
    const canContinue = !priv.get("canContinue");
    return renderer`
      <button class="cancel" onclick="${cancelHandler}">
        ${cancelLabel}
      </button>
      <button class="continue" onclick="${continueHandler}" disabled="${canContinue}">
        ${proceedLabel}
      </button>
    `;
  }
}

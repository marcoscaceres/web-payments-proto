import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";

const privates = new WeakMap();

export default class Controls extends EventTarget(["cancel", "continue"]) {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    priv.set("canContinue", false);
    const dialog = document.createElement("section");
    const containerElem = document.createElement("section");
  }
  activate(){
    privates.get(this).set("canContinue", true);
    this.render();
  }
  deactivate(){
    privates.get(this).set("canContinue", false);
    this.render();
  }
  render() {
    const cancelHandler = () => {
      this.dispatchEvent(new CustomEvent("cancel"));
    };
    const continueHandler = () => {
      this.dispatchEvent(new CustomEvent("continue"));
    };
    this.renderer `
      <button class="cancel" onclick="${cancelHandler}">Cancel</button>
      <button class="continue" onclick="${continueHandler}" disabled="${this.canContinue}">Continue</button>
    `;
  }
  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}

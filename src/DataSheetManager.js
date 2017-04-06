import EventTarget from "event-target-shim";
const privates = new WeakMap();

export default class DataSheetManager extends EventTarget(["done", "prev", "next"]) {
  constructor(dataSheets) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    priv.set("dataSheets", dataSheets.concat());
    this.reset();
    dataSheets.forEach(sheet => {
      sheet.addEventListener("previous", () => {
        const index = dataSheets.findIndex(item => item === this.active) - 1;
        const newActive = dataSheets[index];
        if (newActive) {
          priv.set("active", newActive);
          this.dispatchEvent(new CustomEvent("prev"));
          return;
        }
      });
      sheet.addEventListener("continue", () => {
        const index = dataSheets.findIndex(item => item === this.active) + 1;
        const newActive = dataSheets[index];
        if (newActive) {
          priv.set("active", newActive);
          this.dispatchEvent(new CustomEvent("next"));
          return;
        }
        priv.set("active", null);
        this.dispatchEvent(new CustomEvent("done"));
      });
    });
  }
  get active() {
    return privates.get(this).get("active");
  }
  get done() {
    return this.active === null;
  }
  reset() {
    const priv = privates.get(this);
    priv.set("active", priv.get("dataSheets")[0]);
  }
}

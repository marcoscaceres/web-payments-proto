import EventTarget from "event-target-shim";
const privates = new WeakMap();

export default class DataSheetManager extends EventTarget(["done", "next"]) {
  constructor(dataSheets) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    priv.set("dataSheets", dataSheets.concat());
    this.reset();
    dataSheets.forEach(sheet => sheet.addEventListener("continue", continueHandler.bind(this)));
  }
  get active() {
    return privates.get(this).get("active");
  }
  set active(sheet) {
    return privates.get(this).set("active", sheet);
  }
  get done() {
    return this.active === null;
  }
  reset() {
    const priv = privates.get(this);
    this.active = priv.get("dataSheets")[0];
  }
}

function continueHandler() {
  const priv = privates.get(this);
  const dataSheets = priv.get("dataSheets");
  const index = dataSheets.findIndex(item => item === this.active) + 1;
  const activeSheet = dataSheets[index];
  if (activeSheet) {
    this.active = activeSheet;
    const opts = {
      detail: {
        activeSheet
      }
    };
    this.dispatchEvent(new CustomEvent("next", opts));
    return;
  }
  // We are done! Gather all collected data
  this.active = null;
  const collectedData = dataSheets
    .map(sheet => sheet.collectedData)
    .reduce((accum, obj) => Object.assign(accum, obj), {});
  const opts = {
    detail: collectedData
  };
  this.dispatchEvent(new CustomEvent("done", opts));
}

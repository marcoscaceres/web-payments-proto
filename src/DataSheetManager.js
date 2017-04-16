import EventTarget from "event-target-shim";
const privates = new WeakMap();

export default class DataSheetManager extends EventTarget(["done", "update"]) {
  constructor(dataSheets) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    priv.set("dataSheets", dataSheets.concat());
    dataSheets.forEach(sheet =>
      sheet.addEventListener("continue", continueHandler.bind(this)));
    dataSheets.forEach(sheet =>
      sheet.addEventListener("requestdisplay", ev => {
        this.active = ev.detail.sheet;
        const opts = {
          detail: {
            activeSheet: ev.detail.sheet,
          },
        };
        this.dispatchEvent(new CustomEvent("update", opts));
      }));
    const readyPromise = Promise.all(dataSheets.map(sheet => sheet.ready)).then(
      this.reset.bind(this)
    );
    priv.set("ready", readyPromise);
  }

  get ready() {
    return privates.get(this).get("ready");
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
    const sheets = priv.get("dataSheets");
    sheets.forEach(sheet => sheet.reset());
    // find the first invalid sheet
    this.active = sheets.find(sheet => !sheet.isValid) ||
      sheets[sheets.length - 1];
  }
  update(requestData) {
    const priv = privates.get(this);
    const dataSheets = priv.get("dataSheets");
    dataSheets.forEach(sheet => sheet.render(requestData));
  }
}

function continueHandler() {
  const priv = privates.get(this);
  const dataSheets = priv.get("dataSheets");
  const activeSheet = dataSheets
    .slice(dataSheets.findIndex(sheet => sheet === this.active) + 1)
    .find(sheet => !sheet.isValid || sheet.userMustChoose);

  if (activeSheet) {
    this.active = activeSheet;
    const opts = {
      detail: {
        activeSheet,
      },
    };
    this.dispatchEvent(new CustomEvent("update", opts));
    return;
  }
  // We are done! Gather all collected data
  this.active = null;
  const collectedData = dataSheets
    .map(sheet => sheet.collectedData)
    .reduce((accum, obj) => Object.assign(accum, obj), {});
  const opts = {
    detail: collectedData,
  };
  this.dispatchEvent(new CustomEvent("done", opts));
}

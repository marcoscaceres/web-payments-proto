import { bind } from "hyperhtml/cjs";
import db from "../AutofillDB";

const privates = new WeakMap();
const buttonLabels = Object.freeze({
  proceedLabel: "Continue",
  cancelLabel: "Cancel",
});

/**
 * @class DataCollector
 *
 * Base class for collecting data based on schema. It provides simple means for
 * accessing collected data and for save data to IDB (via `tableName`).
 *
 * @param Set schema provides the names of the input fields this data collector is
 * concerned with.
 * @param classList A list of CSS classes to apply to the renderer, to layout form correctly.
 * @param String tableName Optional, the IndexedDB table name to save to.
 *
 * @see "datacollectors" folder.
 */
export default class DataCollector extends EventTarget {
  constructor(schema, classList = [], tableName = "", initialData = null) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const section = document.createElement("section");
    classList.forEach(name => section.classList.add(name));
    priv.set("data", null);
    priv.set("renderer", bind(section));
    priv.set("schema", schema);
    priv.set("section", section);
    priv.set("tableName", tableName);
    priv.set("ready", init.call(this, tableName, initialData));
  }

  get request() {
    return privates.get(this).get("request");
  }

  set request(value) {
    privates.get(this).set("request", value);
  }

  get renderer() {
    return privates.get(this).get("renderer");
  }

  get ready() {
    return privates.get(this).get("ready");
  }

  set data(value) {
    return privates.get(this).set("data", value);
  }

  get data() {
    return privates.get(this).get("data");
  }

  get form() {
    return privates
      .get(this)
      .get("section")
      .closest("form");
  }

  get dataSheet() {
    return privates.get(this).get("dataSheet");
  }

  set dataSheet(dataSheet) {
    dataSheet.form.addEventListener("reset", () => {
      console.log("Abstract resetting...");
      this.reset();
    });
    return privates.get(this).set("dataSheet", dataSheet);
  }

  reset() {
    console.log("Abstract DataCollector resetting...");
  }

  toObject() {
    const priv = privates.get(this);
    const schema = priv.get("schema");
    const form = this.form;
    // We filter the data related to this DataCollector, as per the given schema.
    return Array.from(new FormData(form).entries())
      .filter(([key]) => schema.has(key))
      .reduce((accum, [key, value]) => {
        accum[key] = value;
        return accum;
      }, {});
  }

  /**
   * Writes to Indexed DB. Requires an input element named "saveDetails"
   * and it must be "on".
   */
  async save() {
    const priv = privates.get(this);
    const tableName = priv.get("tableName");
    if (tableName) {
      const formData = new FormData(this.form);
      if (formData.get("saveDetails") !== "on") {
        return;
      }
      const dataToSave = Object.assign({}, this.data, this.toObject());
      if (!db.isOpen()) {
        await db.open();
      }
      await db[tableName].put(dataToSave);
      this.data = dataToSave;
    }
  }

  get buttonLabels() {
    // abstract - override as needed with object
    return buttonLabels;
  }
}

/**
 * Intialize either from default data or from database
 *
 * @this DataCollector
 * @param {String} tableName
 * @param {Object} initialData
 */
async function init(tableName, initialData) {
  if (!tableName) {
    return this;
  }
  if (!db.isOpen()) {
    await db.open();
  }
  if (!db[tableName]) throw new Error(`No database table/schema for ${tableName}`);
  const count = await db[tableName].count();
  if (!count) {
    this.data = Object.assign({}, initialData, {
      timeCreated: Date.now(),
      timeLastModified: Date.now(),
      timeLastUsed: Date.now(),
      timesUsed: 0,
    });
  } else {
    this.data = await db[tableName].orderBy("timeLastUsed").last();
  }
  return this;
}

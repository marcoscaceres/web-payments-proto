import hyperHTML from "hyperhtml/hyperhtml";
import db from "../AutofillDB";
const privates = new WeakMap();
const ready =  Promise.resolve();
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
 * @param String tableName Opitonal, the IndexedDB table name to save to.    
 * 
 * @see "datacollectors" folder. 
 */
export default class DataCollector {
  constructor(schema, classList=[], tableName = "") {
    const priv = privates.set(this, new Map()).get(this);
    const section = document.createElement("section");
    classList.forEach(name => section.classList.add(name));
    priv.set("data", null);
    priv.set("renderer", hyperHTML.bind(section));
    priv.set("schema", schema);
    priv.set("section", section);
    priv.set("tableName", tableName);
  }

  get renderer(){
    return privates.get(this).get("renderer");
  }

  get ready(){
    // Abstract, override as needed.
    return ready;
  }

  set data(value) {
    return privates.get(this).set("data", value);
  }

  get data() {
    return privates.get(this).get("data");
  }

  get form() {
    return privates.get(this).get("section").closest("form");
  }

  toObject() {
    const priv = privates.get(this);
    const schema = priv.get("schema");
    const form = this.form;
    // We filter the data related to this DataCollector, as per the given schema. 
    return Array
      .from(new FormData(form).entries())
      .filter(([key]) => schema.has(key))
      .filter(([, value]) => value)
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
    if (!tableName) {
      return; // nothing to do
    }
    const formData = new FormData(this.form);
    if (formData.get("saveDetails") !== "on") {
      return;
    }
    const dataToSave = Object.assign({}, this.data, this.toObject());
    if (!db.isOpen()) {
      await db.open();
    }
    await db[tableName].put(dataToSave);
  }

  get buttonLabels() {
    // abstract - override as needed with object 
    return buttonLabels;
  }
}

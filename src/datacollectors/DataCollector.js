import EventTarget from "event-target-shim";
const privates = new WeakMap();
const events = ["cancontinue", "invalid"];
import db from "../AutofillDB";

export default class DataCollector extends EventTarget(events) {
  constructor(schema, tableName = "") {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add("payment-sheet-data-collector");
    priv.set("form", form);
    priv.set("schema", schema);
    priv.set("tableName", tableName);
    priv.set("data", null);
    form.addEventListener("change", () => {
      this.validate();
    });
    form.onsubmit = () => {
      return false;
    };
  }

  set data(value){
    return privates.get(this).set("data", value);
  }

  get data(){
    return privates.get(this).get("data");
  }

  get form() {
    return privates.get(this).get("form");
  }

  toObject() {
    const priv = privates.get(this);
    const form = priv.get("form");
    const schema = priv.get("schema");
    return Array
      .from(new FormData(form).entries())
      .filter(([key]) => schema.has(key))
      .filter(([, value]) => value)
      .reduce((accum, [key, value]) => {
        accum[key] = value;
        return accum;
      }, {});
  }

  async save() {
    const priv = privates.get(this);
    const tableName = priv.get("tableName");
    if (!tableName) {
      throw new TypeError("No data table was specified during construction.")
    }
    const formData = new FormData(this.form);
    if (formData.get("saveDetails") !== "on") {
      return;
    }
    const data = priv.get("data");
    const newData = Object.assign({}, data, {
      timeLastModified: Date.now()
    }, this.toObject());
    priv.set("data", newData);
    await db[tableName].put(newData);
  }

  get isValid() {
    return this.form.checkValidity();
  }

  validate() {
    if (!this.form.checkValidity()) {
      this.dispatchEvent(new CustomEvent("invalid"));
      return;
    }
    this.dispatchEvent(new CustomEvent("cancontinue"));
  }

  get buttonLabels() {
    // abstract - override as needed with object { proceedLabel: string, cancelLabel: string }
    return;
  }
}

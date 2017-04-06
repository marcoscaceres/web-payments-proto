import EventTarget from "event-target-shim";
const privates = new WeakMap();
const events = ["cancontinue", "invalid"];

export default class DataCollector extends EventTarget(events) {
  constructor(schema) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add("payment-sheet-data-collector");
    priv.set("form", form);
    priv.set("schema", schema);
    form.addEventListener("change", () => {
      if (!form.checkValidity()) {
        this.dispatchEvent(new CustomEvent("invalid"));
        return;
      }
      this.dispatchEvent(new CustomEvent("cancontinue"));
    });
    form.onsubmit = () => {
      return false;
    };
  }

  get form() {
    return privates.get(this).get("form");
  }

  toData() {
    const form = privates.get(this).get("form");
    const schema = privates.get(this).get("schema");
    return Array
      .from(new FormData(form).entries())
      .filter(([key]) => schema.has(key))
      .filter(([, value]) => value)
      .reduce((accum, [key, value]) => {
        accum[key] = value;
        return accum;
      }, {});
  }

  get isValid() {
    return this.form.checkValidity();
  }

  get buttonLabels(){
    // abstract - override as needed with object { proceedLabel: string, cancelLabel: string }
    return;
  }
}

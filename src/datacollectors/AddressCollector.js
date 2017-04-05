import hyperHTML from "hyperhtml/hyperhtml.js";
import Countries from "../Countries";
import EventTarget from "event-target-shim";
import guid from "uuid/v4";
import autofillDB from "../AutofillDB";

const privates = new WeakMap();

//", , , 
// , , country, tel, email,
// timeCreated, timeLastUsed, timeLastModified, timesUsed",

const defaultData = Object.freeze({
  guid: "",
  organization: "",
  fullName: "",
  phoneNumber: "",
  addressLevel1: "",
  addressLevel2: "",
  state: "",
  country: "US",
  postalCode: "",
  timeCreated: "",
  timeLastUsed: "",
  timeLastModified: "",
  timesUsed: 0,
});

const addressTypes = new Set([
  "shipping",
  "billing",
]);

export default class AddressCollector extends EventTarget(["datacollected"]) {
  constructor(addressType = "shipping", initialData = defaultData) {
    super();
    if (!addressTypes.has(addressType)) {
      throw new TypeError(`Invalid address type: ${addressType}`);
    }
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add(`data-collector-${addressType}-address`);
    form.addEventListener("change", async() => {
      await this.save();
      this.dispatchEvent(new CustomEvent("datacollected"));
    });
    priv.set("form", form);
    priv.set("render", hyperHTML.bind(form));
    // Merge data
    const currentData = {
      guid: guid(),
      timeCreated: Date.now(),
      timeLastModified: Date.now(),
      timeLastUsed: Date.now(),
      addressType
    };
    priv.set("currentData", Object.assign({}, initialData, currentData));
    let readyResolver, readyRejector;
    priv.set("readyPromise", init(this));
  }

  get ready() {
    return privates.get(this).get("readyPromise");
  }

  toData() {
    const form = privates.get(this).get("form");
    return Array
      .from(new FormData(form).entries())
      .filter(([key]) => key !== "saveDetails") // Not part of schema
      .filter(([, value]) => value)
      .reduce((accum, [key, value]) => {
        accum[key] = value;
        return accum
      }, {});
  }

  async save() {
    const priv = privates.get(this);
    const formData = new FormData(priv.get("form"));
    if (formData.get("saveDetails") !== "on") {
      return;
    }
    const currentData = priv.get("currentData");
    const newData = Object.assign({}, currentData, this.toData());
    priv.set("currentData", newData);
    console.log("Sving", newData);
    await db.addresses.put(newData);
    console.log("Saved done");
  }

  render(newData) {
    const priv = privates.get(this);
    const render = priv.get("render");
    const currentData = priv.get("currentData");
    const data = Object.assign({}, currentData, newData);
    priv.set("currentData", data);
    return render `
        <input name="fullName" class="left-half" autocomplete="${data.addressType + " name"}" type="text" placeholder="Name" value="${data.fullName}">
        <input class="right-half" autocomplete="${data.addressType + " tel"}" name="phoneNumber" type="tel" placeholder="Phone Number" value="${data.phoneNumber}">
        <input class="full" autocomplete="${data.addressType + " address-level"}" name="addressLevel1" type="text" placeholder="Address" value="${data.addressLevel1}">
        <input class="two-thirds" autocomplete="${data.addressType + " address-level"}" name="addressLevel2" type="text" placeholder="City" value="${data.addressLevel2}">
        <input autocomplete="${data.addressType + " address-level"}" type="text" placeholder="State" value="${data.state}"
        >${Countries.asHTMLSelect("two-thirds", data.country)}<input name="postalCode" autocomplete="postal-code" type="text" name="postalCode" placeholder="Post code" value="${data.postalCode}">
        <label class="full"><input type="checkbox" name="saveDetails" checked> Save the address for faster checkout next time</label> 
    `;
  }
}
//"&guid, organization, addressLevel1, addressLevel2, 
// addressLevel1, postalCode, country, tel, email,
// timeCreated, timeLastUsed, timeLastModified, timesUsed",
async function init(dataCollector) {
  const priv = privates.get(dataCollector);
  if (!db.isOpen()) {
    await db.open();
  }
  const count = await db.addresses.count();
  if (!count) {
    console.log("database is empty");
    return;
  }
  const lastSavedData = await db.addresses.orderBy('timeLastUsed').first();
  priv.set("currentData", lastSavedData);
}

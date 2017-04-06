import hyperHTML from "hyperhtml/hyperhtml.js";
import Countries from "../Countries";
import EventTarget from "event-target-shim";
import guid from "uuid/v4";
import autofillDB from "../AutofillDB";

const privates = new WeakMap();

const addressTypes = new Set([
  "shipping",
  "billing",
]);

export default class AddressCollector extends EventTarget(["datacollected"]) {
  constructor(addressType = "shipping", requestedFields) {
    super();
    if (!addressTypes.has(addressType)) {
      throw new TypeError(`Invalid address type: ${addressType}`);
    }
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add(`data-collector-${addressType}-address`);
    form.addEventListener("change", async () => {
      await this.save();
      this.dispatchEvent(new CustomEvent("datacollected"));
    });
    priv.set("form", form);
    priv.set("render", hyperHTML.bind(form));
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
    const newData = Object.assign({}, currentData, {timeLastModified: Date.now()}, this.toData());
    priv.set("currentData", newData);
    console.log("Saving", newData);
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
        <input name="fullName" autocomplete="${data.addressType + " name"}" class="left-half" placeholder="Name" value="${data.fullName}" type="text">
        <input name="phoneNumber" autocomplete="${data.addressType + " tel"}" type="tel" class="right-half" placeholder="Phone Number" value="${data.phoneNumber}" type="text">
        <input name="streetAddress" autocomplete="${data.addressType + " street-address"}" class="full" placeholder="Address" value="${data.streetAddress}" type="text">
        <input name="addressLevel2" autocomplete="${data.addressType + " address-level2"}" class="two-thirds" placeholder="City" value="${data.addressLevel1}">
        <input name="addressLevel1" autocomplete="${data.addressType + " address-level1"}" placeholder="State" value="${data.state}" type="text"
        >${Countries.asHTMLSelect("two-thirds", data.country)}<input
          name="postalCode" autocomplete="${data.addressType + " postal-code"}" name="postalCode" placeholder="Post code" value="${data.postalCode}" type="text">
        <label class="full"><input type="checkbox" name="saveDetails" checked> Save the address for faster checkout next time</label> 
    `;
  }
}

async function init(dataCollector) {
  const priv = privates.get(dataCollector);
  if (!db.isOpen()) {
    await db.open();
  }
  const count = await db.addresses.count();
  if (!count) {
    const defaultData = {
      guid: guid(),
      organization: "",
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
      addressLevel1: "",
      addressLevel2: "",
      state: "",
      country: "US",
      postalCode: "",
      timeCreated: Date.now(),
      timeLastUsed: Date.now(),
      timeLastModified: Date.now(),
      timesUsed: 0,
    };
    priv.set("currentData", defaultData);
    return;
  }
  const lastSavedData = await db.addresses.orderBy('timeLastUsed').first();
  priv.set("currentData", lastSavedData);
}

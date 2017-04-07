import hyperHTML from "hyperhtml/hyperhtml.js";
import Countries from "../Countries";
import EventTarget from "event-target-shim";
import guid from "uuid/v4";
import DataCollector from "./DataCollector";
import db from "../AutofillDB";

const privates = new WeakMap();

const addressTypes = new Set([
  "shipping",
  "billing",
]);

const schema = new Set([
  "addressLevel1",
  "addressLevel2",
  "country",
  "fullName",
  "phoneNumber",
  "postalCode",
  "streetAddress",
]);

export default class AddressCollector extends DataCollector {
  constructor(addressType = "shipping", requestedFields) {
    super(schema);
    if (!addressTypes.has(addressType)) {
      throw new TypeError(`Invalid address type: ${addressType}`);
    }
    const priv = privates.set(this, new Map()).get(this);
    this.form.classList.add(`data-collector-${addressType}-address`);
    this.addEventListener("cancontinue", async () => {
      await this.save();
    });
    priv.set("addressType", addressType);
    priv.set("render", hyperHTML.bind(this.form));
    priv.set("readyPromise", init(this));
  }

  get ready() {
    return privates.get(this).get("readyPromise");
  }

  get addressType() {
    return privates.get(this).get("addressType");
  }

  async save() {
    const formData = new FormData(this.form);
    if (formData.get("saveDetails") !== "on") {
      return;
    }
    console.log("Saving address data....");
    const priv = privates.get(this);
    const addressData = priv.get("addressData");
    const newData = Object.assign({}, addressData, this.toData(), {
      timeLastModified: Date.now()
    }, this.toData());
    priv.set("addressData", newData);
    console.log("Saving", newData);
    await db.addresses.put(newData);
    console.log("Saved done");
  }

  render(requestData) {
    const priv = privates.get(this);
    const render = priv.get("render");
    const data = priv.get("addressData");
    const {
      options: {
        requestPayerEmail,
        requestPayerName,
        requestPayerPhone,
        requestShipping
      }
    } = requestData;
    const invalidHandler = function(ev) {

      //this.setCustomValidity("This is required.");
      //this.form.submit();
    }
    return render `
      <input
        autocomplete="${this.addressType + " name"}"
        class="left-half"
        name="fullName"
        oninvalid="${invalidHandler}"
        placeholder="Name"
        required="${requestPayerName}"
        type="text"
        value="${data.fullName}">
      <input
        autocomplete="${this.addressType + " tel"}"
        class="right-half"
        name="phoneNumber"
        oninvalid="${invalidHandler}"
        placeholder="Phone Number"
        required="${requestPayerPhone}"
        type="tel"
        value="${data.phoneNumber}">
      <input
        autocomplete="${this.addressType + " street-address"}"
        class="full"
        name="streetAddress"
        oninvalid="${invalidHandler}"
        placeholder="Address"
        required="${requestShipping}"
        type="text"
        value="${data.streetAddress}">
      <input
        autocomplete="${this.addressType + " address-level2"}"
        class="two-thirds"
        name="addressLevel2"
        oninvalid="${invalidHandler}"
        placeholder="City"
        required="${requestShipping}"
        type="text"
        value="${data.addressLevel2}">
      <input
        autocomplete="${this.addressType + " address-level1"}"
        name="addressLevel1"
        oninvalid="${invalidHandler}"
        placeholder="State"
        required="${requestShipping}"
        type="text"
        value="${data.addressLevel1}">${
          Countries.asHTMLSelect("two-thirds", data.country, "country", requestShipping ? "required" : null)
      }<input
        autocomplete="${this.addressType + " postal-code"}"
        name="postalCode"
        placeholder="Post code"
        required="${requestShipping}"
        type="text"
        value="${data.postalCode}">
      <label class="full">
        <input type="checkbox" name="saveDetails" checked> Save the address for faster checkout next time
      </label>
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
    const addressData = {
      guid: guid(),
      organization: "",
      fullName: "",
      phoneNumber: "",
      streetAddress: "",
      addressLevel1: "",
      addressLevel2: "",
      country: "",
      postalCode: "",
      timeCreated: Date.now(),
      timeLastUsed: Date.now(),
      timeLastModified: Date.now(),
      timesUsed: 0,
    };
    priv.set("addressData", addressData);
    return;
  }
  const lastSavedData = await db.addresses.orderBy('timeLastUsed').first();
  priv.set("addressData", lastSavedData);
}

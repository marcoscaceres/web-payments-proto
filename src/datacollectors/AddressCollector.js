import hyperHTML from "hyperhtml/hyperhtml.js";
import Countries from "../Countries";
import EventTarget from "event-target-shim";

const privates = new WeakMap();

const defaultData = Object.freeze({
  fullName: "",
  phoneNumber: "",
  streeAddress: "",
  city: "",
  state: "",
  country: "AR",
  postCode: "",
});

const addressTypes = new Set([
  "shipping",
  "billing",
]);

export default class AddressCollector extends EventTarget(["datacollected"]) {
  constructor(addressType="shipping", initialData = defaultData) {
    super();
    if(!addressTypes.has(addressType)){
      throw new TypeError(`Invalid address type: ${addressType}`);
    }
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add(`${addressType}-address`);
    form.addEventListener("change", () => {
      this.dispatchEvent(new CustomEvent("datacollected"));
    });
    priv.set("render", hyperHTML.bind(form));
    priv.set("currentData", Object.assign({}, initialData, { addressType }));
  }

  async getCollectedData() {

  }

  render(newData) {
    const priv = privates.get(this);
    const render = priv.get("render");
    const currentData = priv.get("currentData");
    const data = Object.assign({}, currentData, newData);
    priv.set("currentData", data);
    return render `
      <fieldset class="personal-details">
        <input autocomplete="${data.addressType + " name"}" name="name" type="text" placeholder="Name" value="${data.fullName}">
        <input autocomplete="${data.addressType + " tel"}" name="phoneNumber" type="tel" placeholder="Phone Number" value="${data.phoneNumber}">
      </fieldset>
      <fieldset class="street-address">
        <input autocomplete="${data.addressType + " address-level"}" type="text" placeholder="Address" value="${data.streeAddress}">
      </fieldset>
      <fieldset class="county-details">
        <input autocomplete="${data.addressType + " address-level"}" type="text" placeholder="City" value="${data.city}">
        <input autocomplete="${data.addressType + " address-level"}" type="text" placeholder="State" value="${data.state}">
      </fieldset>
      <fieldset class="county-details">${
          Countries.asHTMLSelect("", data.country)
      }<input autocomplete="postal-code" type="text" name="post-code" value="${data.postCode}">
      </fieldset>
    `;
  }
}

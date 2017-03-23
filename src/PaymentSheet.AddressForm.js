import hyperHTML from "hyperhtml/hyperhtml.js";
import Countries from "./Countries";
import Controls from "./PaymentSheet.Controls";

const privates = new WeakMap();

const defaultData = Object.freeze({
  fullName: "",
  phoneNumber: "",
  streeAddress: "",
  city: "",
  state: "",
  country: "",
  postCode: "",
});

export default class AddressForm extends EventTarget(["datacollected"]) {
  constructor(addressType, initialData = defaultData) {
    const priv = privates.set(this, new Map()).get(this);
    const containerElement = document.createElement("section");
    priv.set("containerElement", containerElement);
    priv.set("render", hyperHTML.bind(containerElement));
    priv.set("currentData", Object.assign({}, initialData, { addressType }));
    priv.set("controls", )
    this.update(priv.get("currentData"));
  }
  get section() {
    return privates.get(this).get("section");
  }
  render(newData) {
    const priv = privates.get(this);
    const render = priv.get("render");
    const currentData = priv.get("currentData");
    const data = Object.assign({}, currentData, newData);
    priv.set("currentData", data);
    render `
      <form id="${data.addressType + "-address"}">
        <h1>${data.addressType} address:</h1>
        <fieldset id="personal-details">
          <input autocomplete="${data.addressType + " name"}" name="name" type="text" placeholder="Name" value="${data.fullName}">
          <input autocomplete="${data.addressType + " tel"}" name="phoneNumber" type="tel" placeholder="Phone Number" value="${data.phoneNumber}">
        </fieldset>
        <fieldset id="street-address">
          <input autocomplete="${data.addressType + " address-level"}" type="text" placeholder="Address" value="${data.streeAddress}">
        </fieldset>
        <fieldset id="county-details">
          <input autocomplete="${data.addressType + " address-level"}" type="text" placeholder="City" value="${data.city}">
          <input autocomplete="${data.addressType + " address-level"}" type="text" placeholder="State" value="${data.state}">
        </fieldset>
        <fieldset id="county-details">
          <select autocomplete="country" name="country">
            ${Array.from(countries.entries()).map(toOption)}
          </select>
          <input autocomplete="postal-code" type="text" name="post-code" value="${data.postCode}">
        </fieldset>
        </form>
    `;
  }
}

function toOption(entry) {
  const [code, { name }] = entry;
  return hyperHTML.wire(entry)`<option value="${code}">${name}`
}

export const shippingAddress = new Address("shipping");
export const billingAddress = new Address("billing");

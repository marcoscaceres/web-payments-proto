import Countries from "../Countries";
import guid from "uuid/v4";
import DataCollector from "./DataCollector";
import PaymentAddress from "../PaymentAddress";

const privates = new WeakMap();
const addressTypes = new Set(["shipping", "billing"]);
const defaultAddress = {
  addressLevel1: "",
  addressLevel2: "",
  country: "",
  fullName: "",
  guid: "",
  phoneNumber: "",
  postalCode: "",
  streetAddress: "",
};
const schema = new Set([...Object.keys(defaultAddress)]);
const defaultRequestData = Object.freeze({
  options: {
    requestPayerEmail: false,
    requestPayerName: false,
    requestPayerPhone: false,
    requestShipping: false,
  },
});

function makeInitialData() {
  return Object.assign({}, defaultAddress, { guid: guid() });
}

export default class AddressCollector extends DataCollector {
  constructor(addressType = "shipping") {
    const initialData = makeInitialData();
    super(
      schema,
      [`data-collector-${addressType}-address`],
      "addresses",
      initialData
    );
    if (!addressTypes.has(addressType)) {
      throw new TypeError(`Invalid address type: ${addressType}`);
    }
    const priv = privates.set(this, new Map()).get(this);
    priv.set("addressType", addressType);
    priv.set("didNotifyAddressChange", false);
  }

  reset() {
    console.log("AddressCollector RESET!");
    privates.get(this).set("didNotifyAddressChange", false);
  }

  notifyAddressChange() {
    const priv = privates.get(this);
    const opts = {
      detail: {
        shippingAddress: this.toPaymentAddress(),
      },
    };
    this.dispatchEvent(new CustomEvent("shippingaddresschange", opts));
    priv.set("didNotifyAddressChange", true);
  }

  get didNotifyAddressChange() {
    return privates.get(this).get("didNotifyAddressChange");
  }

  get addressType() {
    return privates.get(this).get("addressType");
  }

  async save() {
    const { data } = this;
    data.addressLine = [].concat(data.streetAddress);
    data.timeLastModified = Date.now();
    await super.save();
  }

  toPaymentAddress() {
    const {
      streetAddress,
      addressLevel1: region,
      addressLevel2: city,
      country,
      //dependentLocality,
      //languageCode,
      //organization,
      phoneNumber: phone,
      postalCode,
      fullName: recipient,
      //sortingCode,
    } = this.toObject();
    const addressLine = [streetAddress];
    return new PaymentAddress({
      addressLine,
      city,
      country,
      phone,
      postalCode,
      recipient,
      region,
    });
  }

  render(requestData = defaultRequestData) {
    const { data } = this;
    const {
      options: { requestPayerName, requestPayerPhone, requestShipping },
    } = requestData;
    return this.renderer`
      <input 
        type="hidden"
        name="uuid"
        value="${data.guid}">
      <input
        autocomplete="${this.addressType + " name"}"
        class="left-half"
        name="fullName"
        placeholder="Name"
        required="${requestPayerName}"
        type="text"
        value="${data.fullName}">
      <input
        autocomplete="${this.addressType + " tel"}"
        class="right-half"
        name="phoneNumber"
        placeholder="Phone Number"
        required="${requestPayerPhone}"
        type="tel"
        value="${data.phoneNumber}">
      <input
        autocomplete="${this.addressType + " street-address"}"
        class="full"
        name="streetAddress"
        placeholder="Address"
        required="${requestShipping}"
        type="text"
        value="${data.streetAddress}">
      <input
        autocomplete="${this.addressType + " address-level2"}"
        class="two-thirds"
        name="addressLevel2"
        placeholder="City"
        required="${requestShipping}"
        type="text"
        value="${data.addressLevel2}">
      <input
        autocomplete="${this.addressType + " address-level1"}"
        name="addressLevel1"
        placeholder="State"
        required="${requestShipping}"
        type="text"
        value="${data.addressLevel1}">${Countries.asHTMLSelect(
      "two-thirds",
      data.country || "US",
      "country",
      requestShipping ? "required" : null
    )}<input
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

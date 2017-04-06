import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
const privates = new WeakMap();

export default class ShippingOptions extends EventTarget(["shippingoptionchange"]) {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("table");
    containerElem.id = "payment-sheet-shipping-options";
    priv.set("containerElem", containerElem);
    priv.set("renderer", hyperHTML.bind(containerElem));
  }
  render({ shippingOptions }) {
    if (!shippingOptions || shippingOptions.length === 0) {
      return;
    }
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const output = toOutput(shippingOptions.find(({ selected }) => selected));
    const changeHandler = (ev) => {
      const option = ev.target.item(ev.target.selectedIndex); 
      output.value = option.dataset.value;
      const event = new CustomEvent("shippingoptionchange", {detail: {shippingOption: option.value}});
      this.dispatchEvent(event);
    };
    const html = renderer `
    <tr>
      <td>Shipping: <select onchange="${changeHandler}">${shippingOptions.map(toOption)}</select></td>
      <td>${""}<td>
    </tr>`;
    return html;
  }
}

function toOption(shippingOption) {
  const { id, selected, label, dir, lang, amount: { currency, value } } = shippingOption;
  const shippingAmount = new PaymentCurrencyAmount(currency, value).toString();
  const option = hyperHTML.wire(shippingOption)`<option
      name="shippingOption"
      value="${id}" data-value="${shippingAmount}">
      <span dir="${dir}" lang="${lang}">
        ${label}
      </span> ${shippingAmount}</option>`;
  if(selected){
    option.selected = true;
  }
  return option;
}

function toOutput({ amount }) {
  return hyperHTML.wire()
  `<output>${amount.toString()}</output>`;
}

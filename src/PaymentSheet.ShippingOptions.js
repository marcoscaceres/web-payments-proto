import hyperHTML from "hyperhtml/hyperhtml.js";
import { currencies } from "./currencies.js";
const privates = new WeakMap();
import EventTarget from "event-target-shim";

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
    const output = toOutput(shippingOptions.find(({ selected }) => selected))
    const changeHandler = (ev) => {
      const option = ev.target.item(ev.target.selectedIndex); 
      output.value = option.dataset.value;
      const event = new CustomEvent("shippingoptionchange", {detail: {shippingOption: option.value}});
      this.dispatchEvent(event);
    }
    const html = renderer `
    <tr>
      <td>Shipping: <select onchange="${changeHandler}">${shippingOptions.map(toOption)}</select></td>
      <td>${""}<td>
    </tr>`;
    return html;
  }
}

function toOption(shippingOption) {
  const { id, selected, label, dir, lang } = shippingOption;
  const { currency, value } = shippingOption.amount;
  const { symbol } = currencies.get(currency);
  const optionValue = `${symbol}${value} ${currency}`; 
  const option = hyperHTML.wire(shippingOption)`<option
      name="shippingOption"
      value="${id}" data-value="${optionValue}">
      <span dir="${dir}" lang="${lang}">${label}</span> ${symbol}${value}</option>`;
  
  if(selected){
    option.selected = true;
  }
  return option;
}

function toOutput({ amount }) {
  const { currency, value } = amount;
  const { symbol } = currencies.get(currency);
  return hyperHTML.wire()
  `<output>${symbol}${value} ${currency}</output>`;
}

import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import RenderableWidget from "./RenderableWidget";

export default class ShippingOptions extends RenderableWidget {
  constructor() {
    super(document.createElement("table"));
    this.element.id = "payment-sheet-shipping-options";
  }
  render({ shippingOptions }) {
    if (!shippingOptions || shippingOptions.length === 0) {
      return;
    }
    const selected = shippingOptions.find(({ selected }) => selected); 
    const output = toOutput(selected);
    const changeHandler = ({ target }) => {
      const option = target.item(target.selectedIndex);
      output.value = option.textContent;
      const opts = {
        detail: {
          shippingOption: option.value
        }
      };
      const event = new CustomEvent("shippingoptionchange", opts);
      this.dispatchEvent(event);
    };
    return this.renderer `
    <tr>
      <td colspan="2">
        <label>
          Shipping: 
          <select onchange="${changeHandler}">${
            shippingOptions.map(toOption)
          }</select>
        </label>
      </td>
    </tr>`;
  }
}

function toOption(shippingOption) {
  const {
    id,
    selected,
    label,
    dir,
    lang,
    amount: {
      currency,
      value
    }
  } = shippingOption;
  const shippingAmount = new PaymentCurrencyAmount(currency, value).toString();
  return hyperHTML.wire(shippingOption)
  `
    <option
      dir="${dir}"
      lang="${lang}"
      name="shippingOption"
      selected="${selected}"
      value="${id}">
        ${label} 
        ${shippingAmount}
    </option>
  `;

}

function toOutput({
  amount
}) {
  return hyperHTML.wire()
  `
    <output>
      ${amount.toString()}
    </output>
  `;
}

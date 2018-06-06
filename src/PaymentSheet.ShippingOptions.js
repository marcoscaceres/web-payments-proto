import { wire } from "hyperhtml/cjs";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import RenderableWidget from "./RenderableWidget";
import { _details } from "./PaymentRequest.js";

export default class ShippingOptions extends RenderableWidget {
  constructor() {
    super(document.createElement("table"));
    this.element.id = "payment-sheet-shipping-options";
    this.addEventListener("statechange", () => {
      this.render();
    });
  }
  render() {
    const shippingOptions = this.request[_details].shippingOptions;
    if (!shippingOptions || shippingOptions.length === 0) {
      return;
    }
    if (shippingOptions !== this.shippingOptions) {
      this.shippingOptions = shippingOptions;
    }
    const selected = shippingOptions.find(({ selected }) => selected);
    const output = toOutput(selected);
    const changeHandler = ({ target }) => {
      const option = target.item(target.selectedIndex);
      output.value = option.textContent;
      const opts = {
        detail: {
          shippingOption: option.value,
        },
      };
      const event = new CustomEvent("shippingoptionchange", opts);
      this.dispatchEvent(event);
    };
    const options = shippingOptions.map(toOption);
    const disabled = this.isDisabled ? "disabled" : null;
    return this.renderer`
    <tr>
      <td colspan="2">
        <label>
          Shipping:
          <select onchange="${changeHandler}" disabled="${disabled}">
            ${options}
          </select>
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
    amount: { currency, value },
  } = shippingOption;
  const shippingAmount = new PaymentCurrencyAmount(currency, value).toString();
  return wire(shippingOption)`
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

function toOutput({ amount }) {
  return wire()`
    <output>
      ${amount.toString()}
    </output>
  `;
}

import RenderableWidget from "./RenderableWidget";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import { _details } from "./PaymentRequest";
const privates = new WeakMap();

export default class Total extends RenderableWidget {
  constructor() {
    super(document.createElement("section"));
    this.element.id = "payment-sheet-total";
  }

  render() {
    const { total } = this.request[_details];
    const { amount, dir, lang, label } = total;
    const { currency, value } = amount;
    const stringTotal = new PaymentCurrencyAmount(currency, value).toString();
    return this.renderer`
      <table id="payment-sheet-total">
        <tr>
          <td colspan="2">
            <span dir="${dir}" lang="${lang}">
              ${label}
            </span>:
            <output id="payment-sheet-total">
              ${stringTotal} 
              <span class="currency-code">
                ${currency}
              </span>
            </output>
          </td>
        </tr>
      </table>`;
  }

  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}

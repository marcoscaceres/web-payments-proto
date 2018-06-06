import { wire } from "hyperhtml/cjs";
import RenderableWidget from "./RenderableWidget.js";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount.js";
import { _details } from "./PaymentRequest.js";
const privates = new WeakMap();

export default class LineItems extends RenderableWidget {
  constructor() {
    super(document.createElement("details"));
    privates.set(this, new Map()).get(this);
    this.element.id = "payment-sheet-line-items";
  }

  render() {
    const priv = privates.get(this);
    const displayItems = this.request[_details].displayItems;
    const lineItemsHTML = displayItems.map(toTR);
    const tableData = lineItemsHTML.length
      ? displayItems.map(toTR)
      : wire(displayItems)`<tr><td colspan="2">No line items</td></tr>`;
    return this.renderer`
      <summary>
        View All Items
      </summary>
      <table id="line-items-table">${tableData}</table>
    `;
  }
}

function toTR(lineItem) {
  const {
    amount: { currency, value },
  } = lineItem;
  const itemCost = new PaymentCurrencyAmount(currency, value).toString();
  return wire(lineItem)`<tr>
     <td lang="${lineItem.lang}" dir="${lineItem.dir}">
       ${lineItem.label}
     </td>
     <td>
       ${itemCost} ${currency}
     </td>
   </tr>
  `;
}

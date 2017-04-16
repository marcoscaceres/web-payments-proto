import hyperHTML from "hyperhtml/hyperhtml.js";
import RenderableWidget from "./RenderableWidget";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
const privates = new WeakMap();

export default class LineItems extends RenderableWidget {
  constructor() {
    super(document.createElement("details"));
    const priv = privates.set(this, new Map()).get(this);
    this.element.id = "payment-sheet-line-items";
  }

  render({ displayItems }) {
    const lineItemsHTML = displayItems.map(toTR);
    const tableData = lineItemsHTML.length
      ? displayItems.map(toTR)
      : hyperHTML.wire()`<tr><td colspan="2">No line items</td></tr>`;
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
  return hyperHTML.wire(lineItem)`<tr>
     <td lang="${lineItem.lang}" dir="${lineItem.dir}">
       ${lineItem.label}
     </td>
     <td>
       ${itemCost} ${currency}
     </td>
   </tr>
  `;
}

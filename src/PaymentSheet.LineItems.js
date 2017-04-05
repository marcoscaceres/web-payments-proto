import hyperHTML from "hyperhtml/hyperhtml.js";
const privates = new WeakMap();

export default class LineItems {
  constructor() {
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("details");
    containerElem.id = "payment-sheet-line-items";
    priv.set("renderer", hyperHTML.bind(containerElem));
  }

  render(requestData) {
    const { displayItems } = requestData;
    const renderer = privates.get(this).get("renderer");
    const lineItemsHTML = displayItems.map(toTR);
    return renderer `<summary>View All Items</summary><table id="line-items-table">${
      lineItemsHTML.length ? lineItemsHTML : hyperHTML.wire()`<tr><td colspan="2">No line items</td></tr>`
    }</table>`;
  }
}

function toTR(lineItem) {
  const { label, dir, lang, amount } = lineItem;
  return hyperHTML.wire(lineItem)
  `<tr>
     <td lang="${lang}" dir="${dir}">${label}</td>
     <td>${amount.toString()}</td>
  </tr>
  `;
}

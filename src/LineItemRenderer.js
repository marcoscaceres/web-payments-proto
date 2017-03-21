import hyperHTML from "hyperhtml/hyperhtml";
import { currencies } from "./currencies.js";
const privates = new WeakMap();

export default class LineItemRenderer {

  constructor() {
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    priv.set("containerElem", containerElem);
    priv.set("renderer", hyperHTML.bind(containerElem));
  }

  render(paymentItems) {
    const renderer = privates.get(this).get("renderer");
    const htmlElems = paymentItems
      .map(toDefListItem)
      .reduce((accumulator, elem) => accumulator.concat(elem), []);
    renderer `
      <dl class="line-items">${htmlElems}</dl>
    `;
  }
  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}

function toDefListItem(paymentItem) {
  const code = paymentItem.amount.currency;
  const { name: currencyName, symbol: currencySymbol } = currencies.get(code);
  const { value } = paymentItem.amount;
  return hyperHTML.wire()`
    <dt>
      ${paymentItem.label}
    </dt>
    <dd>
    <abbr title="${currencyName}">${currencySymbol}</abbr>${value}
    </dd>
  `;
}

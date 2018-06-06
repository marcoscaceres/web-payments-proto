import { defineEventAttribute } from "event-target-shim";
import { bind, wire } from "hyperhtml/cjs";
const privates = new WeakMap();

export default class LineItemRenderer extends EventTarget {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    priv.set("containerElem", containerElem);
    priv.set("renderer", bind(containerElem));
  }

  render(paymentItems) {
    const renderer = privates.get(this).get("renderer");
    const htmlElems = paymentItems
      .map(toDefListItem)
      .reduce((accumulator, elem) => accumulator.concat(elem), []);
    return renderer`<dl class="line-items">${htmlElems}</dl>`;
  }

  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}
defineEventAttribute(LineItemRenderer, "change");

function toDefListItem(paymentItem) {
  const { currency, value } = paymentItem.amount;
  const formatter = new Intl.NumberFormat(navigator.languages, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });
  return wire(paymentItem)`
    <dt>
      ${paymentItem.label}
    </dt>
    <dd>
      ${formatter.format(value)}
    </dd>
  `;
}

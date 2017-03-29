import hyperHTML from "hyperhtml/hyperhtml.js";

const privates = new WeakMap();

export default class LineItems {
  constructor(containerElement, displayItems = []) {
    const priv = privates.set(this, new Map()).get(this);
    priv.set("renderer", hyperHTML.bind(containerElement));
    render(displayItems);
  }

  render(items) {
    const render = privates.get(this).get("render");
    const html = (items.length) ? items.map(toHTML) : "No items selected";
    render `
      <dl class="order-items">${items}</dl>
    `;
  }
}

function toHTML(paymentItem) {
  return hyperHTML.wire(paymentItem)
  `
    <dt>
      ${paymentItem.label}
    </dt>
    <dd>
      ${paymentItem.amount.toString()}
    </dd>
  `;
}

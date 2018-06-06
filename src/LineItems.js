import { bind, wire } from "hyperhtml/cjs";
import { _details } from "src/PaymentRequest";
import RenderableWidget from "./RenderableWidget";
const privates = new WeakMap();

export default class LineItems extends RenderableWidget {
  constructor(containerElement) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    priv.set("renderer", bind(containerElement));
  }

  render() {
    const priv = privates.get(this);
    const request = priv.get("request");
    const render = priv.get("render");
    const items = request[_details].displayItems;
    const html = items.length ? items.map(toHTML) : "No items selected";
    render`
      <dl class="order-items">${html}</dl>
    `;
  }
}

function toHTML(paymentItem) {
  return wire(paymentItem)`
    <dt>
      ${paymentItem.label}
    </dt>
    <dd>
      ${paymentItem.amount.toString()}
    </dd>
  `;
}

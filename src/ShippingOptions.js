import { defineEventAttribute } from "event-target-shim";
import { bind, wire } from "hyperhtml/cjs";
import PaymentShippingOption from "./PaymentShippingOption.js";

const privates = new WeakMap();

export default class ShippingOptions extends EventTarget {
  constructor(shippingOptions = []) {
    super();
    const containerElem = document.createElement("section");
    const priv = privates.set(this, new Map()).get(this);
    for (const shippingOption of shippingOptions) {
      if (shippingOption instanceof PaymentShippingOption) {
        continue;
      }
      throw new TypeError("Expected instance of PaymentShippingOption");
    }
    priv.set("containerElem", containerElem);
    priv.set("renderer", bind(containerElem));
    priv.set("shippingOptions", shippingOptions);
    this.render(shippingOptions);
  }

  get containerElem() {
    return privates.get(this).get("containerElem");
  }

  render() {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const shippingOptions = priv.get("shippingOptions");
    const wires = shippingOptions
      .map(toHTML)
      .reduce((accum, elems) => accum.concat(elems), []);
    const onChange = ev => {
      ev.stopPropagation();
      for (const opt of privates.get(this).get("shippingOptions")) {
        opt.selected = opt.id === ev.target.value;
      }
      this.dispatchEvent(new CustomEvent("change"));
    };
    return renderer`
      <dl class="shipping-options" onchange="${onChange}">${wires}</dl>
    `;
  }

  get selected() {
    return privates
      .get(this)
      .get("shippingOptions")
      .find(option => option.selected);
  }

  get displayItems() {
    return privates.get(this).get("shippingOptions");
  }
}
defineEventAttribute(ShippingOptions, "change");

function toHTML(shippingOption) {
  return wire(shippingOption)`
  <dt>
    <input
      type="radio"
      name="shipping"
      id="${"shipping_option_" + shippingOption.id}"
      value="${shippingOption.id}"
      checked="${shippingOption.selected}">
    <label for="${"shipping_option_" + shippingOption.id}">
      ${shippingOption.label}
    </label>
  </dt>
  <dd>
    ${shippingOption.amount}
  </dd>
  `;
}

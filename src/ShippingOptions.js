import EventTarget from "event-target-shim";
import hyperHTML from "hyperhtml/hyperhtml.js";

const privates = new WeakMap();

export default class ShippingOptions extends EventTarget(["change"]) {
  constructor(shippingOptions = []) {
    super();
    const containerElem = document.createElement("section");
    const priv = privates.set(this, new Map()).get(this);
    priv.set("containerElem", containerElem);
    priv.set("renderer", hyperHTML.bind(containerElem));
    priv.set("shippingOptions", shippingOptions);
    this.render(shippingOptions);
  }

  get containerElem() {
    return privates.get(this).get("containerElem");
  }

  render(shippingOptions) {
    const renderer = privates.get(this).get("renderer");
    const wires = shippingOptions
      .map(toHTML)
      .reduce((accum, elems) => accum.concat(elems), []);
    const onChange = (ev) => {
      ev.stopPropagation();
      for (const opt of privates.get(this).get("shippingOptions")) {
        opt.selected = (opt.id === ev.target.value);
      }
      this.dispatchEvent(new CustomEvent("change"));
    };
    return renderer `
      <dl class="shipping-options" onchange="${onChange}">${wires}</dl>
    `;
  }

  get selected() {
    return privates.get(this).get("shippingOptions")
      .find(option => option.selected);
  }

  get displayItems() {
    return privates.get(this).get("shippingOptions");
  }
}

function toHTML(shippingOption) {
  return hyperHTML.wire(shippingOption)
  `
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

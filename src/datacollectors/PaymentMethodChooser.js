import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
const privates = new WeakMap();

const defaultMethods = [{
  name: "basic-card",
  icons: [{
    src: "./payment-sheet/images/visa.svg",
    sizes: "256x256"
  }, ],
}, {
  name: "https://paypal.com",
  icons: [{
    src: "./payment-sheet/images/paypal.svg",
    sizes: "256x256"
  }, ],
}];

export default class PaymentMethodChooser extends EventTarget(["datacollected"]) {
  constructor(paymentMethods = defaultMethods) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add("payment-method-chooser");
    form.onsubmit = () => {
      return false;
    };
    form.addEventListener("change", () => {
      this.dispatchEvent(new CustomEvent("datacollected"));
    });
    priv.set("form", form);
    priv.set("renderer", hyperHTML.bind(form));
    priv.set("paymentMethods", paymentMethods);
  }
  toFormData() {
    const form = privates.get(this).get("form");
    return new FormData(form);
  }
  render() {
    const priv = privates.get(this);
    const paymentMethods = priv.get("paymentMethods");
    const renderer = priv.get("renderer");
    if (!paymentMethods.length) {
      return renderer `<h2>No payment methods available.</h2>`;
    }
    const buttons = paymentMethods.map(method => toRadio(method, this));
    return renderer `<div id="payment-methods-buttons">${buttons}</div>`;
  }
  static supports(method) {
    return defaultMethods.some(({
      name
    }) => method === name);
  }
}

function toRadio(paymentMethod, controller) {
  const {
    name,
    icons
  } = paymentMethod;
  const keyHandler = ev => {
    if(ev.keyCode === 32 || ev.keyCode === 13 ){
      ev.currentTarget.setAttribute("aria-checked", "true");
      ev.currentTarget.querySelector("input").checked = true;
      ev.currentTarget.querySelector("input").form.dispatchEvent(new Event("change"));
    }
  };
  const srcset = icons.map(toSrcset);
  const img = toImage(srcset, name);
  const frag = hyperHTML.wire()
      
  `<label onkeypress="${keyHandler}" role="radio" aria-checked="false"><input name="payment-method" type="radio">${img}</label>`;
  return frag;
}
// Either a srcset or just a src
function toImage(srcset, alt) {

  return hyperHTML.wire()
  `<img
      tabindex="0"
      alt="${alt}"
      srcset="${srcset.join(" ")}"
      width="195" height="80">`;
}

function toSrcset({
  src,
  sizes
}) {
  return sizes.split(" ")
    .map(size => size.split("x")[0] + "w")
    .reduce((collector, width) => {
      collector.push(`${src} ${width}`);
      return collector;
    }, [])
    .sort()
    .join();
}

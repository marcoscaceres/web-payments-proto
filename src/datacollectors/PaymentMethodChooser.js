import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
const privates = new WeakMap();

const defaultMethods = [{
  name: "basic-card",
  icons: [
    { src: "/payment-sheet/images/visa.svg", sizes: "256x256" },
  ],
}, {
  name: "https://paypal.com",
  icons: [
    { src: "/payment-sheet/images/paypal.svg", sizes: "256x256" },
  ],
}];

export default class PaymentMethodChooser extends EventTarget(["datacollected"]) {
  constructor(paymentMethods = defaultMethods) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add("payment-method-chooser");
    form.onsubmit = ()=>{
      return false;
    }
    form.addEventListener("change", () => {
      this.dispatchEvent(new CustomEvent("datacollected"));
    });
    priv.set("renderer", hyperHTML.bind(form));
    priv.set("paymentMethods", paymentMethods);
  }
  async getCollectedData() {

  }
  render() {
    const priv = privates.get(this);
    const paymentMethods = priv.get("paymentMethods"); 
    const renderer = priv.get("renderer");
    if (!paymentMethods.length) {
      return renderer`<h2>No payment methods available.</h2>`;
    }
    const buttons = paymentMethods.map(method => toRadio(method, this));
    return renderer`<div id="payment-methods-buttons">${buttons}</div>`;
  }
  static supports(method) {
    return defaultMethods.some(({ name }) => method === name);
  }
}

function toRadio(paymentMethod, controller) {
  const { name, icons } = paymentMethod;
  const srcset = icons.map(toSrcset);
  const handlerWrapper = () => {
    const ev = new CustomEvent("chosen", {

      detail: Object.assign({}, paymentMethod),
    });
    controller.dispatchEvent({
      type: "chosen",
      paymentMethod: ev.detail,
    });
  }
  const img = toImage(srcset, name);
  const frag = hyperHTML.wire()
  `<label><input name="payment-method" type="radio" onclick="${handlerWrapper}">${img}</label>`;
  return frag;
}
// Either a srcset or just a src
function toImage(srcset, alt) {
  return hyperHTML.wire()
  `<img
      role="button"
      alt="${alt}"
      srcset="${srcset.join(" ")}"
      width="195" height="80">`;
}

function toSrcset({ src, sizes }) {
  return sizes.split(" ")
    .map(size => size.split("x")[0] + "w")
    .reduce((collector, width) => {
      collector.push(`${src} ${width}`);
      return collector;
    }, [])
    .sort()
    .join();
}

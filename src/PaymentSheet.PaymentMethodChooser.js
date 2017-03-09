import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
const privates = new WeakMap();

class PaymentMethodChooser extends EventTarget(["choosen"]) {
  constructor(paymentMethods = []) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const section = document.createElement("section");
    section.id = "payment-method-chooser";
    priv.set("section", section);
    priv.set("render", hyperHTML.bind(section));
    this.update(paymentMethods);
  }
  update(paymentMethods) {
    const render = privates.get(this).get("render");
    if (!paymentMethods.length) {
      render `<h2>No payment methods available.</h2>`;
      return;
    }
    const buttons = paymentMethods.map(toButton.bind(this));
    render `
      <h2>How would you like to pay:</h2>
      <div id="payment-methods-buttons">${buttons}</div>
    `;
  }
  get section() {
    return privates.get(this).get("section");
  }
}

function toButton(paymentMethod) {
  const { name, icons } = paymentMethod;
  const srcset = icons.map(toSrcset);
  const handlerWrapper = () => {
    const ev = new CustomEvent("choosen", {
      detail: Object.assign({}, paymentMethod),
    });
    this.dispatchEvent({
      type: "choosen",
      paymentMethod: ev.detail,
    });;
  }
  return hyperHTML.wire()
  `<button onclick="${handlerWrapper}">
    <img 
        width="195"
        height="80"
        srcset="${srcset}"
        name="${name}">
    </button>
  `;
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

const defaultMethods = [{
  name: "Visa",
  icons: [
    { src: "/payment-sheet/images/visa.svg", sizes: "256x256" },
  ],
}, {
  name: "PayPal",
  icons: [
    { src: "/payment-sheet/images/paypal.svg", sizes: "256x256" },
  ],
}];

export const paymentMethodChooser = new PaymentMethodChooser(defaultMethods);

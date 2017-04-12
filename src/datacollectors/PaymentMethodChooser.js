import hyperHTML from "hyperhtml/hyperhtml.js";
import DataCollector from "./DataCollector";
const privates = new WeakMap();

const defaultMethods = [{
  name: "basic-card",
  value: "visa",
  icons: [{
    src: "./payment-sheet/images/visa.svg",
    sizes: "256x256",
  }, ],
}, {
  name: "https://paypal.com",
  value: "paypal",
  icons: [{
    src: "./payment-sheet/images/paypal.svg",
    sizes: "256x256",
  }, ],
}];

const schema = new Set([
  "payment-method",
]);

export default class PaymentMethodChooser extends DataCollector {
  constructor(paymentMethods = defaultMethods) {
    super(schema, ["payment-method-chooser"]);
    const priv = privates.set(this, new Map()).get(this);
    priv.set("paymentMethods", paymentMethods);
  }

  render() {
    const priv = privates.get(this);
    const paymentMethods = priv.get("paymentMethods");
    if (!paymentMethods.length) {
      return this.renderer`
        <h2>
          No payment methods available.
        </h2>
      `;
    }
    return this.renderer`
    <div id="payment-methods-buttons">${
      paymentMethods.map(method => toRadio(method))
    }</div>`;
  }
  static supports(method) {
    return defaultMethods.some(({
      name
    }) => method === name);
  }
}

function toRadio(paymentMethod) {
  const { name, icons, value } = paymentMethod;
  const keyHandler = ev => {
    if (ev.keyCode === 32 || ev.keyCode === 13) {
      ev.currentTarget.setAttribute("aria-checked", "true");
      ev.currentTarget.querySelector("input").checked = true;
      ev.currentTarget.querySelector("input").form.dispatchEvent(new Event("change"));
      ev.preventDefault(); // Prevents space bar from scrolling the web page.
    }
  };
  const srcset = icons.map(toSrcset);
  const frag = hyperHTML.wire(paymentMethod)
  `
    <label onkeypress="${keyHandler}" role="radio" aria-checked="false">
    <input required value="${value}" name="payment-method" type="radio">${toImage({srcset, name})}</label>`;
  return frag;
}
// Either a srcset or just a src
function toImage(details) {
  const {srcset, alt} = details;
  return hyperHTML.wire(details)
  `<img
     tabindex="0"
     alt="${alt}"
     srcset="${srcset.join(" ")}"
     width="195" 
     height="80">
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

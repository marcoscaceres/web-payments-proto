import hyperHTML from "hyperhtml/hyperhtml.js";
import DataSheet from "./PaymentSheet.DataSheet";

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

export default class PaymentMethodChooser extends DataSheet {
  constructor(sheet, paymentMethods = defaultMethods) {
    super("How would you like to pay?");
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    containerElem.id = "payment-method-chooser";
    priv.set("containerElem", containerElem);
    priv.set("renderer", hyperHTML.bind(containerElem));
    priv.set("sheet", sheet);
    this.render(paymentMethods);
  }
  render(paymentMethods) {
    const render = privates.get(this).get("renderer");
    const sheet = privates.get(this).get("sheet");
    if (!paymentMethods.length) {
      render `<h2>No payment methods available.</h2>`;
      return;
    }
    const buttons = paymentMethods
      .map(method => toRadio(method, this));

    const abortHandler = () => {
      sheet.abort();
    }

    return render`<h2>How would you like to pay:</h2>
      <div id="payment-methods-buttons">${buttons}</div>
      <section class="paysheet-controls">
        <button onclick="${abortHandler}">Cancel</button><button disabled>Continue</button>
      </div>
    `;
  }
  get containerElem() {
    return privates.get(this).get("containerElem");
  }
  static supports(method) {
    return defaultMethods.some(({ name }) => method === name)
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
  const frag = hyperHTML.wire()
  `<input onclick="${handlerWrapper}">${toImage(srcset, name)}</button>`;
  return frag;
}
// Either a srcset or just a src
function toImage(srcset, alt) {
  return hyperHTML.wire()
  `<img
      role="button"
      alt="${alt}"
      srcset="${srcset.join(" ")}"
      width="195" height="80"/>`;
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

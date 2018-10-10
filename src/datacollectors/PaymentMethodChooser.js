import { wire } from "hyperhtml/cjs";
import DataCollector from "./DataCollector";
const privates = new WeakMap();

const defaultMethods = [
  {
    name: "basic-card",
    value: "visa",
    icons: [
      {
        src: "./payment-sheet/images/visa.svg",
        sizes: "256x256",
      },
    ],
  },
  {
    name: "tokenized-card",
    value: "test1",
    icons: [
      {
        src: "./payment-sheet/images/paypal.svg",
        sizes: "256x256",
      },
    ],
  },
  {
    name: "token-reference",
    value: "test2",
    icons: [
      {
        src: "./payment-sheet/images/paypal.svg",
        sizes: "256x256",
      },
    ],
  },
  {
    name: "token-cryptogram",
    value: "test3",
    icons: [
      {
        src: "./payment-sheet/images/paypal.svg",
        sizes: "256x256",
      },
    ],
  },
  {
    name: "https://paypal.com",
    value: "paypal",
    icons: [
      {
        src: "./payment-sheet/images/paypal.svg",
        sizes: "256x256",
      },
    ],
  },
];

const schema = new Set(["payment-method"]);

export default class PaymentMethodChooser extends DataCollector {
  constructor(paymentMethods = defaultMethods) {
    super(schema, ["payment-method-chooser"], null, {
      "payment-method": "visa",
    });
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
    const radioButtons = paymentMethods.map(method => toRadio(method));
    return this.renderer`
      <div id="payment-methods-buttons">${radioButtons}</div>
    `;
  }
  static supports(method) {
    return defaultMethods.some(({ name }) => name === method);
  }
}

function toRadio(paymentMethod) {
  const { name, icons, value } = paymentMethod;
  const keyHandler = ev => {
    if (ev.keyCode === 32 || ev.keyCode === 13) {
      ev.currentTarget.setAttribute("aria-checked", "true");
      ev.currentTarget.querySelector("input").checked = true;
      ev.currentTarget
        .querySelector("input")
        .form.dispatchEvent(new Event("change"));
      ev.preventDefault(); // Prevents space bar from scrolling the web page.
    }
  };
  const srcset = icons.map(toSrcset);
  const img = toImage({ srcset, name });
  return wire(paymentMethod)`
    <label onkeypress="${keyHandler}" role="radio" aria-checked="false">
    <input required value="${value}" required name="payment-method" type="radio">${img}</label>`;
}
// Either a srcset or just a src
function toImage(details) {
  const { srcset, alt } = details;
  return wire(details)`<img
     tabindex="0"
     alt="${alt}"
     srcset="${srcset.join(" ")}"
     width="195" 
     height="80">
  `;
}

function toSrcset({ src, sizes }) {
  return sizes
    .split(" ")
    .map(size => size.split("x")[0] + "w")
    .reduce((collector, width) => {
      collector.push(`${src} ${width}`);
      return collector;
    }, [])
    .sort()
    .join();
}

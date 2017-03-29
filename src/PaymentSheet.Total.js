import hyperHTML from "hyperhtml/hyperhtml.js";
const privates = new WeakMap();

export default class Total {
  constructor() {
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    containerElem.id = "payment-sheet-total";
    const table = document.createElement("table");
    table.id = "payment-sheet-total";
    containerElem.appendChild(table);
    priv.set("containerElem", containerElem);
    priv.set("renderer", hyperHTML.bind(table));
  }

  render({ total }) {
    const renderer = privates.get(this).get("renderer");
    const { amount, dir, lang, label } = total;
    const { currency, value } = amount;
    const ops = { 
      style: "currency", 
      currency, 
      currencyDisplay: "symbol",
    };
    const numberFormatter = new Intl.NumberFormat(navigator.languages, ops);
    return renderer `
      <tr>
        <td colspan="2"><span dir="${dir}" lang="${lang}">${label}</span>:
          <output id="payment-sheet-total">
            ${numberFormatter.format(value)}
          </output>
        </td>
      </tr>`;
  }

  get containerElem() {
    return privates.get(this).get("containerElem");
  }
}

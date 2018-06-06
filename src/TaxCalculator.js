import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import LineItemRenderer from "./LineItemRenderer";
import PaymentItem from "./PaymentItem";

const privates = new WeakMap();

export default class TaxCalculator extends LineItemRenderer {
  constructor(taxPercent = 0.1, sections = [], defaultCurrency = "USD") {
    super(sections);
    const priv = privates.set(this, new Map()).get(this);
    this.containerElem.classList.add("tax-line");
    priv.set("taxPercent", taxPercent);
    priv.set("defaultCurrency", defaultCurrency);
    priv.set("sections", new Set(sections));
    // subscribe to changes from dependent sections, and render on change
    const renderListener = this.render.bind(this);
    sections.forEach(section =>
      section.addEventListener("change", renderListener)
    );
    this.render();
  }

  get displayItems() {
    const priv = privates.get(this);
    const defaultCurrency = priv.get("defaultCurrency");
    const sections = priv.get("sections");
    const taxPercent = priv.get("taxPercent");
    const total = Array.from(sections)
      .map(section => section.displayItems)
      .reduce(
        (accumulator, displayItems) => accumulator.concat(displayItems),
        []
      )
      .map(displayItem => parseInt(displayItem.amount.value, 10))
      .reduce((total, value) => total + value, 0);
    const tax = total * taxPercent;
    const amount = new PaymentCurrencyAmount(defaultCurrency, tax);
    return [new PaymentItem("Tax", amount)];
  }

  render() {
    const result = super.render(this.displayItems);
    this.dispatchEvent(new CustomEvent("change"));
    return result;
  }
}

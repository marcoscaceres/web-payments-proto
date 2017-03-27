import hyperHTML from "hyperhtml/hyperhtml";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import PaymentShippingOption from "./PaymentShippingOption";
import PaymentItem from "./PaymentItem";
const privates = new WeakMap();

export default class OrderSummary {
  constructor(summaryElem, sections = [], defaultCurrency = "USD") {
    const priv = privates.set(this, new Map()).get(this);
    priv.set("sections", new Set(sections));
    priv.set("renderer", hyperHTML.bind(summaryElem));
    priv.set("defaultCurrency", defaultCurrency);
    this.render(sections);
  }

  sumTotal() {
    const sections = privates.get(this).get("sections");
    const sum = Array
      .from(sections)
      .map(section => section.displayItems)
      .reduce((accumulator, item) => accumulator.concat(item), [])
      .map(({ amount: { value } }) => parseInt(value, 10))
      .reduce((accumulator, value) => accumulator + value, 0);
    const defaultCurrency = privates.get(this).get("defaultCurrency");
    const totalAmount = new PaymentCurrencyAmount(defaultCurrency, sum);
    const displayItem = new PaymentItem("Total", totalAmount);
    return displayItem;
  }

  render(sections) {
    const renderer = privates.get(this).get("renderer");
    const clickHandler = doPaymentRequest.bind(this);
    const sectionElems = sections.map(section => section.containerElem);
    renderer `
      <h3>Order summary</h3>
      <section>${sectionElems}</section>
      <div id="button-container">
        <button id="checkout-button" onclick="${clickHandler}">Checkout</button>
      </div>
    `;
  }
}

function makeSplitter(condition) {
  return (accumulator = { left: [], right: [] }, item) => {
    const { left, right } = accumulator;
    const bucket = condition(item) ? left : right;
    bucket.push(item);
    return accumulator;
  }
}

async function doPaymentRequest() {
  const sections = privates.get(this).get("sections");
  const typeSplitter = makeSplitter(item => item instanceof PaymentShippingOption);
  const { left: shippingOptions, right: displayItems } = Array
    .from(sections)
    .map(section => section.displayItems)
    .reduce((accumulator, items) => accumulator.concat(items), [])
    .reduce(typeSplitter, undefined);
  const total = this.sumTotal();
  const methodData = [{
    supportedMethods: ["basic-card"],
  }];
  const id = `super-store-order-${String(Math.random()).substr(2)}`;
  const details = {
    id,
    displayItems,
    total,
    shippingOptions,
  }
  const options = {
    requestShipping: true,
  }
  const request = new PaymentRequest(methodData, details, options);
  console.log(request)
  
  request.onshippingoptionchange = (ev) => {
    console.log("hmmm.", ev)
  }
  try{
    const response = await request.show();
  }catch(err){
    console.log(err);
  }
}

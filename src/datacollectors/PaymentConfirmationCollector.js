import hyperHTML from "hyperhtml/hyperhtml.js";
import DataCollector from "./DataCollector";
import AddressFormat from "../formatters/AddressFormat";
import db from "../AutofillDB";

const privates = new WeakMap();

const schema = new Set([]);

const buttonLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Pay",
});

function makeInitialData(){
  return Array
    .from(schema)
    .reduce((obj, propName) =>{
      obj[propName] = "";
      return obj; 
    }, {});
}

export default class PaymentConfirmationCollector extends DataCollector {
  constructor(addressCollector, creditCardCollector) {
    super(schema, ["payment-preview-collector"]);
    const priv = privates.set(this, new Map()).get(this);
    priv.set("addressCollector", addressCollector);
  }

  get buttonLabels() {
    return buttonLabels;
  }

  toBasicCardResponse(){
    const {
      cardholderName,
      cardNumber,
      cardSecurityCode,
      expiryMonth,
      expiryYear,
    } = this.toObject();
  }

  render(newData) {
    const priv = privates.get(this);
    const paymentAddress = priv.get("addressCollector").toPaymentAddress();
    const shippingAddress = new AddressFormat().format(paymentAddress, "html");
    return this.renderer `
      <section class="credit-card-details">
        <h3 class="fullspan">Enter payment details</h3>
        <input type="text" inputmode="numeric" class="fullspan" placeholder="Card Number" name="cardNumber" required autocomplete="cc-number" maxlength="19" pattern="[0-9]{13,16}">
        <input type="text" class="fullspan" name="cardholderName" required placeholder="Name on card" autocomplete="cc-name">
        <input type="text" name="expiryYear" required autocomplete="cc-exp-month">
        <input type="text" name="expiryMonth" required autocomplete="cc-exp-year">
        <input type="text" name="cardSecurityCode" placeholder="CVV">
        <label class="fullspan">
          <input type="checkbox" name="saveDetails" checked>
          Save the credit card (CVV will not be saved)
        </label> 
      </section>
      <section class="billing-address-info">
        <h3>Enter billing address</h3>
        <div>
          <label>
            <input type="checkbox" name="" checked>
            Same as shipping address
            <div>${shippingAddress}</div>
          </label>
        </div>
      </section>
    `;
  }
}


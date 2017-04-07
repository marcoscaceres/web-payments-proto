import hyperHTML from "hyperhtml/hyperhtml.js";
import DataCollector from "./DataCollector";
import AddressFormat from "../formatters/AddressFormat";

const privates = new WeakMap();

const schema = new Set([
  "billingAddressUuid",
  "ccExpMonth",
  "ccExpYear",
  "ccName",
  "ccNumber",
]);

const buttonLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Preview",
});

export default class CreditCardCollector extends DataCollector {
  constructor(addressCollector) {
    super(schema, "creditcards");
    const priv = privates.set(this, new Map()).get(this);
    this.form.classList.add("credit-card-collector");
    priv.set("renderer", hyperHTML.bind(this.form));
    priv.set("addressCollector", addressCollector);
  }
  get buttonLabels(){
    // abstract - override as needed with object
    return buttonLabels;
  }

  render(newData) {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const paymentAddress = priv.get("addressCollector").toPaymentAddress();
    const shippingAddress = new AddressFormat().format(paymentAddress, "html");
    return renderer`
      <section class="credit-card-details">
        <h3 class="fullspan">Enter payment details</h3>
        <input type="text" inputmode="numeric" class="fullspan" placeholder="Card Number" name="ccnumber" required autocomplete="cc-number" maxlength="19" pattern="[0-9]{13,16}">
        <input type="text" class="fullspan" name="ccname" required placeholder="Name on card" autocomplete="cc-name">
        <input type="text" name="ccExpMonth" required autocomplete="cc-exp-month">
        <input type="text" name="ccExpYear" required autocomplete="cc-exp-year">
        <input type="text" name="cvc" placeholder="CVV">
        <label class="fullspan">
          <input type="checkbox" placeholder="CVV" name="saveDetails" checked>
          Save the credit card (CVV will not be saved)
        </label> 
      </section>
      <section>
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

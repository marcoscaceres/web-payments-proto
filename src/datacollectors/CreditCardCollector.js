import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
import DataCollector from "./DataCollector";
const privates = new WeakMap();

const schema = new Set([
  "card-number",
  "name-on-card",
  "expire-month",
  "expire-year",
  "valid-from-month",
  "valid-from-year",
]);

const buttonLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Preview",
});

export default class CreditCardCollector extends DataCollector {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    this.form.classList.add("credit-card-collector");
    priv.set("renderer", hyperHTML.bind(this.form));
  }
  get buttonLabels(){
    // abstract - override as needed with object
    return buttonLabels;
  }

  render(newData) {
    const renderer = privates.get(this).get("renderer");
    return renderer`
      <section class="credit-card-details">
        <h3 class="fullspan">Enter payment details</h3>
        <input type="text" class="fullspan" placeholder="Card Number" name="cardnumber" required autocomplete="cc-number" maxlength="19" pattern="[0-9]{13,16}">
        <input type="text" class="fullspan" name="ccname" required placeholder="Name on card" autocomplete="cc-name">
        <input type="text" name="cc-exp" id="frmCCExp" required placeholder="MM-YYYY" autocomplete="cc-exp">
        <input type="text" name="cvc">
        <label class="fullspan">
          <input type="checkbox" placeholder="CVV" name="saveDetails" checked>
          Save the credit card (CVV will not be saved)
        </label> 
      </section>
      <section>
        <h3>Enter billing address</h3>
        <div>
          <label>
            <input type="checkbox" name="save-cc-details" checked>
            Same as shipping address
          </label> 
        </div>
      </section>
    `;
  }
}

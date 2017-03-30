import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
const privates = new WeakMap();

export default class CreditCardCollector extends EventTarget(["datacollected", "buttonsnamechange"]) {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const form = document.createElement("form");
    form.classList.add("credit-card-collector");
    form.onsubmit = () => {
      return false;
    }
    form.addEventListener("change", ({
      target
    }) => {
      this.dispatchEvent(new CustomEvent("datacollected"));
    });
    priv.set("renderer", hyperHTML.bind(form));
  }
  async getCollectedData() {

  }
  render() {
    const renderer = privates.get(this).get("renderer");
    return renderer`
      <section>
        <h3>Enter payment details</h3>
        <div>
          <input type="text" maxlength="19" pattern="[0-9]{13,16}">
        </div>
        <div>
          <input type="text" name="name">
        </div>
        <div>
          <input type="text" name="expiry-month">
          <input type="text" name="expiry-year">
        </div>
        <div>
          <input type="text" name="cvc">
        </div>
        <div>
          <label>
            <input type="checkbox" name="save-cc-details" checked>
            Save the credit card (CVV will not be saved)
          </label> 
        </div>
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

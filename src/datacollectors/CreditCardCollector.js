import hyperHTML from "hyperhtml/hyperhtml.js";
import DataCollector from "./DataCollector";
import AddressFormat from "../formatters/AddressFormat";
import BasicCardResponse from "../BasicCardResponse";
import uuid from "uuid/v4";

const privates = new WeakMap();

const schema = new Set([
  "uuid",
  "cardholderName",
  "cardNumber",
  "cardSecurityCode",
  "expiryMonth",
  "expiryYear",
]);

const buttonLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Preview",
});

function makeInitialData() {
  const data = Array.from(schema).reduce(
    (obj, propName) => {
      obj[propName] = "";
      return obj;
    },
    {}
  );
  data.uuid = uuid();
  return data;
}

export default class CreditCardCollector extends DataCollector {
  constructor(addressCollector) {
    super(schema, ["credit-card-collector"], "cards", makeInitialData());
    const priv = privates.set(this, new Map()).get(this);
    priv.set("addressCollector", addressCollector);
  }

  get buttonLabels() {
    return buttonLabels;
  }

  toBasicCardResponse() {
    const details = this.toObject();
    return new BasicCardResponse(details);
  }

  async save() {
    // only save if the credit card is valid
    if (!this.form.querySelector("[name=cardNumber]").validity.valid) {
      return;
    }
    await super.save();
  }

  render() {
    const priv = privates.get(this);
    const paymentAddress = priv.get("addressCollector").toPaymentAddress();
    const shippingAddress = new AddressFormat().format(paymentAddress, "html");
    const year = new Date().getFullYear();
    const keyUpHandler = ({ target: input }) => {
      let event;
      if (input.validity.valid && input.form.checkValidity()) {
        event = new CustomEvent("datacollected", { detail: this.toObject() });
      } else {
        event = new CustomEvent("invaliddata");
      }
      this.dispatchEvent(event);
    };
    const {
      cardholderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      uuid,
    } = this.data;
    return this.renderer`
      <section class="credit-card-details">
        <h3 class="fullspan">Enter payment details</h3>
        <input 
          type="hidden"
          name="uuid"
          value="${uuid}">
        <input
          autocomplete="cc-number"
          inputmode="numeric"
          class="fullspan"
          maxlength="19"
          name="cardNumber"
          onchange="${validateCCNumber}"
          pattern="[0-9]{13,16}"
          placeholder="Card Number"
          required
          type="text"
          value="${cardNumber}">
        <input
          type="text"
          minlength="1"
          class="fullspan"
          name="cardholderName"
          required
          placeholder="Name on card"
          autocomplete="cc-name"
          value="${cardholderName}">
        <select name="expiryMonth" placehoder="exp.MM" maxlength="2">${makeOptionsRange(1, 12, parseInt(expiryMonth, 10))}</select>
        <select name="expiryYear" placehoder="exp.YY" maxlength="2">${makeOptionsRange(year, year + 10, parseInt(expiryYear, 10))}</select>
        <input
          inputmode="numeric"
          maxlength="4"
          minlength="3"
          name="cardSecurityCode"
          onkeyup="${keyUpHandler}"
          placeholder="CVV"
          size="4"
          type="text">
        <label class="fullspan">
          <input type="checkbox" name="saveDetails" checked>
          Save the credit card (CVV will not be saved)
        </label>
      </section>
      <section class="billing-address-info">
        <h3>Enter billing address</h3>
          <label>
            <input type="checkbox" name="" checked>
            Same as shipping address
          </label>
          <p class="payment-sheet-billing-address">${shippingAddress}</p>
      </section>
    `;
  }
}

function validateCCNumber(ev) {
  const { target: inputElement } = ev;
  if (BasicCardResponse.isValid(inputElement.value)) {
    inputElement.setCustomValidity("");
    return;
  }
  inputElement.setCustomValidity("Invalid credit card number");
}

function makeOptionsRange(start, end, selected = null) {
  const options = [];
  if (start > end) {
    let newEnd = start;
    start = end;
    end = newEnd;
  }
  while (start <= end) {
    const isSelected = selected === start;
    options.push(
      hyperHTML.wire()`
      <option value="${start}" selected="${isSelected}">
        ${start}
      </option>
    `
    );
    start++;
  }
  return options;
}

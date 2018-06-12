import uuid from "uuid/v4";
import DataCollector from "./DataCollector";
const schema = new Set(["payerEmail", "payerName", "payerPhone", "uuid"]);

const buttonLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Proceed",
});

export default class PayerDetailsCollector extends DataCollector {
  constructor() {
    const initialData = {
      payerEmail: "",
      payerName: "",
      payerPhone: "",
      uuid: uuid(),
    };
    super(schema, ["payer-details-collector"], "payers", initialData);
  }

  get buttonLabels() {
    return buttonLabels;
  }

  async save() {
    const isValid = [...this.form.querySelectorAll("input")].every(
      ({ validity: { valid } }) => valid
    );
    if (!isValid) {
      return;
    }
    await super.save();
  }

  render() {
    const { payerEmail, payerName, payerPhone } = this.data;
    const changeHandler = () => {
      
    }
    return this.renderer`
      <section class="payer-details">
        <input
          autocomplete="name"
          inputmode="text"
          class="fullspan"
          name="payerName"
          placeholder="Full name"
          required
          type="text"
          value="${payerName}">
        <input
          autocomplete="email"
          inputmode="email"
          class="fullspan"
          name="payerEmail"
          placeholder="Email address"
          required
          type="email"
          value="${payerEmail}">
        <input
          type="tel"
          minlength="3"
          class="fullspan"
          name="payerPhone"
          required
          placeholder="Phone number"
          autocomplete="phone"
          value="${payerPhone}">
        <label class="fullspan">
          <input type="checkbox" name="saveDetails" checked>
          Save your details
        </label>
      </section>
    `;
  }
}

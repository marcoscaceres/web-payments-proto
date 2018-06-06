import PaymentDetailsBase from "./PaymentDetailsBase";
import PaymentItem from "./PaymentItem";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
const privates = new WeakMap();

export default class PaymentDetailsUpdate extends PaymentDetailsBase {
  /**
   * @param PaymentDetailsUpdate details
   */
  constructor(details) {
    let total;
    if (details.total) {
      const { label } = details.total;
      const { currency, value } = details.total.amount;
      const amount = new PaymentCurrencyAmount(currency, value);
      total = new PaymentItem(label, amount);
    }
    const { error } = details;
    super(details);
    privates.set(this, {
      error,
      total,
    });
  }
  // DOMString error;
  get error() {
    return privates.get(this).error;
  }
  // PaymentItem total;
  get total() {
    return privates.get(this).total;
  }
  static convert(value) {
    return value;
  }
}

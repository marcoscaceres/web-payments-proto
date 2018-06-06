import IDLDictionary from "./IDLDictionary";

const privates = new WeakMap();
/**
 * @see https://www.w3.org/TR/payment-request/#dom-paymentdetailsbase
 **/

export default class PaymentDetailsBase extends IDLDictionary {
  /**
   *
   * @param {PaymentItem[]} displayItems
   * @param {PaymentShippingOption[]} shippingOptions
   * @param {PaymentDetailsModifier[]} modifiers
   */
  constructor(details) {
    super();
    const { displayItems, shippingOptions, modifiers } = details;
    privates.set(this, {
      displayItems,
      shippingOptions,
      modifiers,
    });
  }

  get displayItems() {
    return privates.get(this).displayItems;
  }

  get shippingOptions() {
    return privates.get(this).shippingOptions;
  }

  get modifiers() {
    return privates.get(this).modifiers;
  }
}

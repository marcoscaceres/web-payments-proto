import dialogPolyfill from "dialog-polyfill/dialog-polyfill";
import hyperHTML from "hyperhtml/hyperhtml.js";
import EventTarget from "event-target-shim";
import "dialog-polyfill/dialog-polyfill.css";
import "../css/payment-sheet.css";
import Host from "./PaymentSheet.Host";
import Total from "./PaymentSheet.Total";
import LineItems from "./PaymentSheet.LineItems";
import PaymentMethodChooser from "./PaymentSheet.PaymentMethodChooser";
import ShippingOptions from "./PaymentSheet.ShippingOptions";
const privates = new WeakMap();

const eventListeners = [
  "shippingoptionchange",
  "shippingaddresschange",
  "abort",
];
/**
 * Payment Sheet a HTMLDialogElement that is composed of two section:
 *  Top section:
 *    [x] Heading + image
 *    [ ] Line items
 *    [ ] Shipping selector
 *    [ ] Total
 *
 *  DataSheets
 *    [] Payment Method Selector
 *  
 *  Bottom info
 *    [x] host information
 */

export default class PaymentSheet extends EventTarget(eventListeners) {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const dialog = document.createElement("dialog");
    priv.set("ready", attatchDialog(dialog));
    dialog.id = "payment-sheet";
    priv.set("dialog", dialog);
    priv.set("renderer", hyperHTML.bind(dialog));

    // WIDGETS
    priv.set("host-widget", new Host());
    priv.set("topWidgets", [
      new LineItems(),
      new ShippingOptions(),
      new Total(),
    ]);
    // const methodChooser = new PaymentMethodChooser(this);
    // priv.set("activeWidget", methodChooser)
    // const bottomWidgets = [
    //   methodChooser,
    // ]
    // priv.set("bottomWidgets", bottomWidgets);
  }

  get ready() {
    return privates.get(this).get("ready");
  }

  async abort() {
    const event = new CustomEvent("abort");
    await this.close();
    this.dispatchEvent(event);
  }

  async open(paymentMethods) {
    await this.ready;
    const dialog = privates.get(this).get("dialog");
    dialog.show();
  }

  async close() {
    const dialog = privates.get(this).get("dialog");
    dialog.close();
    dialog.remove();
  }

  render(requestData) {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const topWidgets = priv.get("topWidgets");

    // const bottomWidgets = priv.get("bottomWidgets");
    // const activeWidget = priv.get("activeWidget");
    const host = priv.get("host-widget");
    renderer `<h1><img src="/payment-sheet/images/logo-payment.png" alt="">Firefox Web Payment</h1>
    <section id="payment-sheet-top-section">${topWidgets.map(widget => widget.render(requestData))}</section>
    <section>${host.render(window.location)}<section>`;
  }
}

// <section id="payment-sheet-top">${topWidgets.map(widget => widget.containerElem)}</section>
// <section id="payment-sheet-bottom">${activeWidget.containerElem}</section>

function attatchDialog(dialog) {
  return new Promise((resolve) => {
    const attachAndDone = () => {
      document.body.appendChild(dialog);
      dialogPolyfill.registerDialog(dialog);
      return resolve();
    }
    if (document.readyState === "complete") {
      attachAndDone();
      return;
    }
    window.addEventListener("DOMContentLoaded", attachAndDone);
  });
}

// `
//   <section id="line-items">
//     <table id="">
//       <tr>
//         <td>
//           <button id="view-line-items-button">View all items</button>
//         </td>
//         <td class="items-sum">$190 USD</td>
//       </tr>
//       <tr class="sheet-line-item" hidden="true">
//         <td>Faux leather</td>
//         <td>$90 USD</td>
//       </tr>
//       <tr class="sheet-line-item" hidden="true">
//         <td>Double face coat</td>
//         <td>$100 USD</td>
//       </tr>
//       <tr>
//         <td>Shipping:
//           <select id="shipping-selector">
//             <option value="10">Standard $10</option>
//             <option value="20">Express $20</option>
//             <option value="30">Premium $30</option>
//           </select>
//         </td>
//         <td>
//           <output id="shipping-selector-output">$10 USD</output>
//         </td>
//       </tr>
//       <tr>
//         <td>Tax:</td>
//         <td>$20 USD</td>
//       </tr>
//       <tr>
//         <td colspan="2">Total:
//           <output class="total">$220.00</output> USD</td>
//       </tr>
//     </table>
//   </section>
//   <section>
//     <section id="payment-method-chooser">
//       <section>
//         <h2>Choose your payment method:</h2>
//         <div id="payment-methods-buttons">
//           <input width="195" height="80" role="button" type="image" name="credit card" src="payment-sheet/images/visa.svg" alt="credit card">
//           <input width="195" height="80" role="button" type="image" name="PayPal" src="payment-sheet/images/paypal.svg" alt="PayPal">
//           <input width="195" height="80" role="button" type="image" name="bitcoin" src="payment-sheet/images/bitcoin.svg" alt="BitCoin">
//           <input width="195" height="80" role="button" type="image" name="unionpay" src="payment-sheet/images/unionpay.svg" alt="Union Pay">
//         </div>
//       </section>
//     </section>
//     <!--       <section id="shipping-address">
//       <h2>Shipping address:</h2>
//       <form>
//         <fieldset id="personal-details">
//           <input type="text" placeholder="Name">
//           <input type="text" placeholder="Phone Number">
//         </fieldset>
//         <fieldset id="street-address">
//           <input type="text" placeholder="Address">
//         </fieldset>
//         <fieldset id="county-details">
//           <input type="text" placeholder="City">
//           <input type="text" placeholder="State">
//         </fieldset>
//         <fieldset id="county-details">
//           <select>
//             <option value="USA">United States</option>
//           </select>
//           <input type="text" name="post-code">
//         </fieldset>
//       </form>
//     </section> -->
//   </section>
//   <section id="paysheet-controls">
//     <button id="paycancel" class="neutral">Cancel</button>
//     <button class="active">Continue</button>
//   </section>
//   <section id="origin">
//     <p>Requested by shopping.com</p>
//   </section>
// `

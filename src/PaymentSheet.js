import "dialog-polyfill/dialog-polyfill.css";
import dialogPolyfill from "dialog-polyfill/dialog-polyfill.js";
import hyperHTML from "hyperhtml/hyperhtml.js";

const dialog = document.createElement("dialog");
dialog.innerHTML = `
  <section id="line-items">
    <h1><img src="/payment-sheet/images/logo-payment.png" alt="">Firefox Web Payment</h1>
    <table id="line-items-table">
    </table>
  </section>
  <section>
    <section id="payment-method-chooser">
      <section>
        <h2>Choose your payment method:</h2>
        <div id="payment-methods-buttons">
          <input width="195" height="80" role="button" type="image" name="credit card" src="payment-sheet/images/visa.svg" alt="credit card">
          <input width="195" height="80" role="button" type="image" name="PayPal" src="payment-sheet/images/paypal.svg" alt="PayPal">
          <input width="195" height="80" role="button" type="image" name="bitcoin" src="payment-sheet/images/bitcoin.svg" alt="BitCoin">
          <input width="195" height="80" role="button" type="image" name="unionpay" src="payment-sheet/images/unionpay.svg" alt="Union Pay">
        </div>
      </section>
    </section>

  </section>
  <section id="paysheet-controls">
    <button id="paycancel" class="neutral">Cancel</button>
    <button class="active">Continue</button>
  </section>
  <section id="origin">
    <p>Requested by shopping.com</p>
  </section>
</dialog>
dialog.id = "payment-sheet";
dialogPolyfill.registerDialog(dialog);
const render = hyperHTML.bind(dialog);

class PaymentSheet {
  constructor(){

  }

  async open(){
    document.appendChild(dialog);
    dialog.show();
  }

  async close(){

  }

  on(event, cb){

  }
}


export const paymentSheet = new PaymentSheet();


// `
//   <section id="line-items">
//     <h1><img src="/payment-sheet/images/logo-payment.png" alt="">Firefox Web Payment</h1>
//     <table id="line-items-table">
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
// </dialog>
// `

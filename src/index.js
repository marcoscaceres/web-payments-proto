import hyperHTML from "hyperhtml/hyperhtml.js";
import "./PaymentRequest.js";
import { shippingAddress, billingAddress } from "./PaymentSheet.AddressForm.js";
import { paymentMethodChooser } from "./PaymentSheet.PaymentMethodChooser.js";
import { host } from "./PaymentSheet.Host.js";

window.onload = function(){
  document.body.appendChild(paymentMethodChooser.section);
  document.body.appendChild(host.section);
  window.paymentMethodChooser = paymentMethodChooser
}


// function range(start, finish) {
//   const arr = [];
//   while (start <= finish) {
//     arr.push(start++);
//   }
//   return arr;
// }

// function toSelectOptions(listItems) {
//   const options = Array
//     .from(listItems)
//     .map(item => `<option value="${item}">${item}</option>`)
//   return options;
// }

// function toTableData({ img, price, title, sizes, ref }, { onChange }) {
//   return hyperHTML.wire()
//   `
//     <td>
//       <img src="${img}" alt="">
//     </td>
//     <td>
//       <h3>${title}</h3>
//       <p>Ref. ${ref}</p>
//       <p>Size: <select name="sizes" class="sizeSelector">${toSelectOptions(sizes)}</select></p>
//       <p>Colors: Bright yellow</p>
//     </td>
//     <td>
//       <select name="itemCount" class="itemsSelector" onchange="${onChange}">${toSelectOptions(range(1,10))}</select>
//     </td>
//     <td>$<span class="price">${price}</span></td>
//     <td class="itemSum">$<output>${price}</output></td>
//   `;
// }

// function fillInventoryTable(hyperTBody, inventoryItems, evt) {
//   const TRs = inventoryItems
//     .map(
//       item => hyperHTML.wire()
//       `<tr data-ref="${item.ref}">${toTableData(item, evt)}</tr>`
//     );
//   hyperTBody `${TRs}`;
// }

// window.addEventListener("DOMContentLoaded", async() => {
//   const inventoryData = await fetch("data/inventory.json").then(r => r.json());
//   const inventoryTable = document.querySelector("#inventory-table tbody");
//   const hyperTBody = hyperHTML.bind(inventoryTable);
//   const evt = {
//     onChange() {
//       const { selectElem, render } = totals.find(
//         ({ selectElem }) => this === selectElem
//       );
//       if (!selectElem) {
//         return;
//       }
//       const tr = selectElem.closest("tr");
//       const price = parseInt(tr.querySelector(".price").textContent, 10);
//       const quantity = parseInt(selectElem.item(selectElem.selectedIndex).value, 10);
//       const newTotal = quantity * price;
//       render `${newTotal}`;
//     }
//   }
//   fillInventoryTable(hyperTBody, inventoryData, evt);
//   // watch totals
//   var totals = Array
//     .from(
//       document.querySelectorAll(".itemSum>output")
//     )
//     .map(elem => ({
//       elem,
//       render: hyperHTML.bind(elem),
//       selectElem: elem.closest("tr").querySelector("select.itemsSelector"),
//     }));
// });

// window.addEventListener("DOMContentLoaded", () => {
//   const payCancelBtn = document.querySelector("#paycancel");
//   const shippingSelector = document.querySelector("#shipping-selector");
//   const shippingOutput = document.querySelector("#shipping-selector-output");
//   const viewLineItemsBtn = document.querySelector("#view-line-items-button");
//   const lineItems = document.querySelectorAll(".sheet-line-item");

//   // shippingSelector.addEventListener("change", (ev) => {
//   //   shippingOutput.value = `$${shippingSelector.value} USD`;
//   // });

//   // viewLineItemsBtn.onclick = (ev) => {
//   //   viewLineItemsBtn.closest("tr").classList.toggle("showing");
//   //   lineItems.forEach(
//   //     item => item.hidden = !item.hidden
//   //   );
//   // };
// });

// window.showDialog = () => {
//   dialog.showModal();
//   dialog.classList.add("show");
// }

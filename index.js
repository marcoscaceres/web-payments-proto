"use strict";
import "dialog-polyfill/dialog-polyfill.css";
import dialogPolyfill from "dialog-polyfill/dialog-polyfill.js";

let dialog;

window.addEventListener("DOMContentLoaded", () => {
  dialog = document.querySelector("dialog");
  dialogPolyfill.registerDialog(dialog);
  const payCancelBtn = document.querySelector("#paycancel");
  const shippingSelector = document.querySelector("#shipping-selector");
  const shippingOutput = document.querySelector("#shipping-selector-output");
  const viewLineItemsBtn = document.querySelector("#view-line-items-button");
  const lineItems = document.querySelectorAll(".sheet-line-item");

  paycancel.onclick = () => {
    dialog.close();
  }

  shippingSelector.addEventListener("change", (ev) => {
    shippingOutput.value = `$${shippingSelector.value} USD`;
  });

  viewLineItemsBtn.onclick = (ev) => {
    viewLineItemsBtn.closest("tr").classList.toggle("showing");
    lineItems.forEach(
      item => item.hidden = !item.hidden
    );
  };
});

window.showDialog = () => {
  dialog.showModal();
  dialog.classList.add("show");
}

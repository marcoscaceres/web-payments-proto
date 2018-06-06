import "./PaymentRequest.js";
import InventoryTable from "./InventoryTable";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import PaymentShippingOption from "./PaymentShippingOption";
import OrderSummary from "./OrderSummary";
import ShippingOptions from "./ShippingOptions";
import TaxCalculator from "./TaxCalculator";
import InventorySummary from "./InventorySummary";

window.addEventListener("DOMContentLoaded", async () => {
  const inventory = window.location.pathname.endsWith("headphone.html")
    ? "headphones"
    : "inventory";
  const tableElem = document.getElementById("inventory-table");
  const inventoryTable = new InventoryTable(
    tableElem,
    `data/${inventory}.json`
  );
  await inventoryTable.ready;
  const parsedOptions = await fetch(`data/${inventory}_shipping.json`).then(r =>
    r.json()
  );
  const shipOpts = parsedOptions.map(({ id, label, value, selected }) => {
    const amount = PaymentCurrencyAmount.parseAmount(value);
    return new PaymentShippingOption(id, label, amount, selected);
  });
  const shippingOptions = new ShippingOptions(shipOpts);
  const taxCalculator = new TaxCalculator(
    0.1,
    [shippingOptions, inventoryTable],
    "USD"
  );
  // Order summary collects all the information allowing payment to be made
  const summaryElem = document.getElementById("order-summary");
  const inventorySummary = new InventorySummary(inventoryTable);
  const summaryWidgets = [inventorySummary, shippingOptions, taxCalculator];
  new OrderSummary(summaryElem, summaryWidgets);
});

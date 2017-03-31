import "./PaymentRequest.js";
import InventoryTable from "./InventoryTable";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount";
import PaymentShippingOption from "./PaymentShippingOption";
import OrderSummary from "./OrderSummary"
import ShippingOptions from "./ShippingOptions";
import TaxCalculator from "./TaxCalculator";
import InventorySummary from "./InventorySummary";

if (window.location.pathname.endsWith("headphone.html")) {
  window.addEventListener("DOMContentLoaded", async () => {
    const tableElem = document.getElementById("inventory-table");
    const inventoryTable = new InventoryTable(tableElem, "data/inventory.json");
  });
} else {
  window.addEventListener("DOMContentLoaded", async () => {
    const tableElem = document.getElementById("inventory-table");
    const inventoryTable = new InventoryTable(tableElem, "data/inventory.json");
    await inventoryTable.ready;

    const shipOpts = [
      { id: "std", label: "Standard", value: "USD$10", selected: false },
      { id: "exp", label: "Express", value: "USD$20", selected: true },
      { id: "prm", label: "Premium", value: "USD$30", selected: false },
    ].map(
      (({ id, label, value, selected }) => {
        const amount = PaymentCurrencyAmount.parseAmount(value);
        return new PaymentShippingOption(id, label, amount, selected);
      })
    );
    const shippingOptions = new ShippingOptions(shipOpts);
    const taxCalculator = new TaxCalculator(0.10, [shippingOptions, inventoryTable], "USD");
    // Order summary collects all the information allowing payment to be made
    const summaryElem = document.getElementById("order-summary");
    const inventorySummary = new InventorySummary(inventoryTable);
    const summaryWidgets = [inventorySummary, shippingOptions, taxCalculator];
    const orderSummary = new OrderSummary(summaryElem, summaryWidgets);
  });
}

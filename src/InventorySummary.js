import LineItemRenderer from "./LineItemRenderer";

const privates = new WeakMap();

export default class InventorySummary extends LineItemRenderer {
  constructor(inventoryTable) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    priv.set("inventoryTable", inventoryTable);
    const changeListener = () => this.render(inventoryTable.displayItems);
    inventoryTable.addEventListener("change", changeListener)
    changeListener();
  }

  get displayItems() {
    return privates.get(this).get("inventoryTable").displayItems;
  }
}

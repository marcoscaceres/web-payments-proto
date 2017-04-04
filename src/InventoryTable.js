import hyperHTML from "hyperhtml/hyperhtml.js";
import PaymentItem from "./PaymentItem.js";
import PaymentCurrencyAmount from "./PaymentCurrencyAmount.js";
import EventTarget from "event-target-shim";
const privates = new WeakMap();

export default class InventoryTable extends EventTarget(["change"]) {
  constructor(containerElem, dataURL) {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const table = document.createElement("table");
    containerElem.appendChild(table);
    priv.set("table", table);
    makeTableSkeleton(table);
    const tBody = table.querySelector("tbody");
    priv.set("renderer", hyperHTML.bind(tBody));
    const ready = Promise.resolve(dataURL ? this.fill(dataURL) : undefined);
    priv.set("ready", ready);
    // set up change listener
    tBody.addEventListener("change", event => {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("change"));
    });
  }
  get ready() {
    return privates.get(this).get("ready");
  }
  async fill(dataURL) {
    const inventoryData = await fetch(dataURL).then(r => r.json());
    this.render(inventoryData);
  }
  render(data) {
    const evt = {
      onChange() {
        const { selectElem, renderer } = totals.find(
          ({ selectElem }) => this === selectElem
        );
        if (!selectElem) {
          return;
        }
        const tr = selectElem.closest("tr");
        const price = parseInt(tr.querySelector(".price").textContent, 10);
        const quantity = parseInt(selectElem.item(selectElem.selectedIndex).value, 10);
        const newTotal = quantity * price;
        renderer `${newTotal}`;
      }
    };
    const renderer = privates.get(this).get("renderer");
    fillInventoryTable(renderer, data, evt);
    // watch totals
    var totals = Array
      .from(
        document.querySelectorAll(".itemSum>output")
      )
      .map(elem => ({
        elem,
        renderer: hyperHTML.bind(elem),
        selectElem: elem.closest("tr").querySelector("select.itemsSelector"),
      }));
  }

  get containerElem(){
    return privates.get(this).get("containerElem");
  }

  get displayItems() {
    const table = privates.get(this).get("table");
    const items = Array
      .from(table.querySelectorAll(".lineItem"))
      .map(tr => {
        const currency = "USD";
        const value = tr.querySelector(".itemSum>output").textContent;
        const amount = new PaymentCurrencyAmount(currency, value);
        const label = tr.querySelector(".itemLabel").textContent;
        const howMany = tr.querySelector(".itemsSelector");
        const itemCount = howMany.item(howMany.selectedIndex).value;
        const finalLabel = `${label} x${itemCount}`;
        return new PaymentItem(finalLabel, amount);
      });
    return items;
  }
}

function makeTableSkeleton(table) {
  table.innerHTML = `
  <table class="inventory-table">
    <thead>
      <tr>
        <th colspan="2">Product Details</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
  `;
}

function range(start, finish) {
  const arr = [];
  while (start <= finish) {
    arr.push(start++);
  }
  return arr;
}

function toSelectOptions(listItems) {
  const options = Array
    .from(listItems)
    .map(item => `<option value="${item}">${item}</option>`)
  return options;
}

function toTableData({ img, price, label, sizes, ref, colors }, { onChange }) {
  return hyperHTML.wire()
  `
    <td>
      <img src="${img}" alt="">
    </td>
    <td>
      <h3 class="itemLabel">${label}</h3>
      <p>Ref. ${ref}</p>
      <p class="itemSizes">Size: <select name="sizes" class="sizeSelector">${toSelectOptions(sizes)}</select></p>
      <p>Colors: ${colors}</p>
    </td>
    <td>
      <select name="itemCount" class="itemsSelector" onchange="${onChange}">${toSelectOptions(range(1,10))}</select>
    </td>
    <td>$<span class="price">${price}</span></td>
    <td class="itemSum">$<output>${price}</output></td>
  `;
}


function fillInventoryTable(hyperTBody, inventoryItems, evt) {
  const TRs = inventoryItems
    .map(
      item => hyperHTML.wire()
      `<tr class="lineItem" data-ref="${item.ref}">${toTableData(item, evt)}</tr>`
    );
  hyperTBody `${TRs}`;
}

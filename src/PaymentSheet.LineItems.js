import hyperHTML from "hyperhtml/hyperhtml.js";
const privates = new WeakMap();

export class LineItems {
  constructor(lineItems = [], total) {
    const priv = privates.set(this, new Map()).get(this);
    const section = document.createElement("section");
    section.id = "line-items";
    const table = document.createElement("table");
    table.id = "line-items-table";
    priv.set("section", section);
    priv.set("render", hyperHTML.bind(table));
    this.update(lineItems, total);
  }
  update(lineItems, total) {
    const render = privates.get(this).get("render");

    if (!lineItems.length) {
      render `
        <tr><td colspan="2">No display items</td></tr>
      `;
      return;
    }
    render `
        <td>
          <button id="view-line-items-button">View all items</button>
        </td>
      `;

  }
}

function toTR(lineItem) {

}

function toTD(lineItem) {

}

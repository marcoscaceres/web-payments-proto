//import "../css/payment-sheet.css";
import "dialog-polyfill/dialog-polyfill.css";
import AddressCollector from "./datacollectors/AddressCollector";
import DataSheet from "./PaymentSheet.DataSheet.js";
import dialogPolyfill from "dialog-polyfill/dialog-polyfill";
import EventTarget from "event-target-shim";
import Host from "./PaymentSheet.Host";
import hyperHTML from "hyperhtml/hyperhtml.js";
import LineItems from "./PaymentSheet.LineItems";
import PaymentMethodChooser from "./datacollectors/PaymentMethodChooser";
import ShippingOptions from "./PaymentSheet.ShippingOptions";
import Total from "./PaymentSheet.Total";
import DataSheetManager from "./DataSheetManager";
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
 *    [x] Line items
 *    [x] Shipping selector
 *    [x] Total
 *
 *  DataSheets
 *    [x] Payment Method Selector
 *  
 *  Bottom info
 *    [x] host information
 */

class PaymentSheet extends EventTarget(eventListeners) {
  constructor() {
    super();
    const priv = privates.set(this, new Map()).get(this);
    const donePromise = {};
    const promise = new Promise((resolve, reject) => {
      Object.assign(donePromise, {
        resolve,
        reject
      });
    });
    priv.set("done", Object.assign(donePromise, {
      promise
    }));
    const dialog = document.createElement("dialog");
    priv.set("ready", attatchDialog(dialog));
    dialog.id = "payment-sheet";
    const abortListener = () => {
      this.abort();
    }
    dialog.addEventListener("cancel", abortListener);

    priv.set("dialog", dialog);
    priv.set("renderer", hyperHTML.bind(dialog));
    priv.set("state", "closed");

    // WIDGETS
    priv.set("host-widget", new Host());
    const shippingOptionsPicker = new ShippingOptions();
    shippingOptionsPicker.addEventListener("shippingoptionchange", ev => {
      this.dispatchEvent(ev);
    })
    priv.set("topWidgets", [
      new LineItems(),
      shippingOptionsPicker,
      new Total(),
    ]);

    const sheets = [
      new DataSheet("Choose your payment method:", new PaymentMethodChooser()),
      new DataSheet("Shipping address", new AddressCollector("shipping")),
    ]

    sheets.forEach(sheet => sheet.addEventListener("abort", abortListener));
    const dataSheetManager = new DataSheetManager(sheets);
    priv.set("dataSheetManager", dataSheetManager);
    dataSheetManager.addEventListener("next", () => {
      console.log("showing next...")
      this.render();
    });

    dataSheetManager.addEventListener("done", () => {
      console.log("we are done...")
      this.render();
    });
  }

  get done() {
    return privates.get(this).get("done").promise;
  }

  get ready() {
    return privates.get(this).get("ready");
  }

  async abort() {
    console.log("aborting");
    const priv = privates.get(this);
    priv.get("dataSheetManager").reset();
    const event = new CustomEvent("abort");
    await this.close();
    this.dispatchEvent(event);
  }

  async open(requestData) {
    const priv = privates.get(this);
    await this.ready;
    const dialog = priv.get("dialog");
    priv.set("requestData", requestData);
    this.render();
    dialog.showModal();
    await this.done;
  }

  async requestClose(reason) {
    // We need to investigate how to show the different reasons for closing
    switch (reason) {
      case "fail":
        // do sad animation here, wait for user input then close()
        break;
      case "abort":
        // We should let the user know the page is trying to abort. 
        // this has complications if they are filling out 
        // autofill stuff.
        break;
      case "success":
        // do a success animation here
        break;
      case "unknown": // unknown reason
        break;
      default:
        console.assert(false, "This should never happen: " + reason);
    }
    await this.close();
  }

  async close() {
    const dialog = privates.get(this).get("dialog");
    dialog.close();
  }

  render() {
    const priv = privates.get(this);
    const requestData = priv.get("requestData");
    const renderer = priv.get("renderer");
    const topWidgets = priv.get("topWidgets");
    const host = priv.get("host-widget");
    const dataSheetsManager = priv.get("dataSheetManager");
    const currentSheet = dataSheetsManager.active;
    return renderer `
    <h1>
      <img src="./images/logo-payment.png" alt="">Firefox Web Payment
    </h1>
    <section id="payment-sheet-top-section">${topWidgets.map(widget => widget.render(requestData))}</section>
    <section>${currentSheet ? currentSheet.render() : "" }</section>
    <section id="payment-sheet-bottom" hidden="${dataSheetsManager.done}">${host.render(window.location)}<section>`;
  }
}

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

const paymentSheet = new PaymentSheet();
export default paymentSheet;

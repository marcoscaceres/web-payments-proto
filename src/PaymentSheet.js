//import "../css/payment-sheet.css";
import "dialog-polyfill/dialog-polyfill.css";
import AddressCollector from "./datacollectors/AddressCollector";
import CreditCardCollector from "./datacollectors/CreditCardCollector";
import DataSheet from "./PaymentSheet.DataSheet.js";
import DataSheetManager from "./DataSheetManager";
import db from "./AutofillDB";
import dialogPolyfill from "dialog-polyfill/dialog-polyfill";
import EventTarget from "event-target-shim";
import Host from "./PaymentSheet.Host";
import hyperHTML from "hyperhtml/hyperhtml.js";
import LineItems from "./PaymentSheet.LineItems";
import PaymentMethodChooser from "./datacollectors/PaymentMethodChooser";
import ShippingOptions from "./PaymentSheet.ShippingOptions";
import Total from "./PaymentSheet.Total";
import PaymentConfirmationCollector
  from "./datacollectors/PaymentConfirmationCollector";
import AwaitPaymentResponse from "./PaymentSheet.AwaitPaymentResponse";

const privates = new WeakMap();
const eventListeners = Object.freeze([
  "shippingoptionchange",
  "shippingaddresschange",
  "abort",
]);
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
    initDialog.call(this);

    // WIDGETS
    priv.set("host-widget", new Host());
    const shippingOptionsPicker = new ShippingOptions();
    shippingOptionsPicker.addEventListener("shippingoptionchange", ev => {
      this.dispatchEvent(ev);
    });
    // TODO: convert to proper manager
    priv.set(
      "topWidgets",
      new Map([
        ["lineItems", { widget: new LineItems(), active: true }],
        [
          "shippingOptionsPicker",
          { widget: shippingOptionsPicker, active: true },
        ],
        ["total", { widget: new Total(), active: true }],
        [
          "awaitPaymentResponse",
          { widget: new AwaitPaymentResponse(), active: false },
        ],
      ])
    );
    priv.set("ready", init.call(this));
  }

  get sessionDone() {
    return privates.get(this).get("sessionPromise").promise;
  }

  get ready() {
    return privates.get(this).get("ready");
  }
  /**
   * Abort showing the sheet.
   *  
   * @param {String} reason 
   */
  async abort(reason) {
    console.log("aborting", reason);
    if (db.isOpen()) {
      await db.close();
    }
    const priv = privates.get(this);
    priv.get("dataSheetManager").reset();
    const event = new CustomEvent("abort");
    await this.close();
    this.dispatchEvent(event);
    priv.get("sessionPromise").reject(new DOMException(reason, "AbortError"));
  }

  async open(requestData) {
    const priv = privates.get(this);
    if (priv.get("isShowing")) {
      throw new DOMException("Sheet is already showing", "AbortError");
    }
    priv.set("requestData", requestData);
    priv.set("isShowing", true);
    startPaymentSession(this);
    await this.ready;
    const dataSheetManager = priv.get("dataSheetManager");
    dataSheetManager.update(requestData);
    const dialog = priv.get("dialog");
    this.render(requestData);
    dialog.showModal();
    try {
      return await this.sessionDone; // collected data is returned
    } catch (err) {
      throw err;
    }
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
    const priv = privates.get(this);
    const dialog = priv.get("dialog");
    dialog.close();
    priv.set("isShowing", false);
    priv.get("sessionPromise").resolve();
  }

  async render(requestData = privates.get(this).get("requestData")) {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    const topWidgets = priv.get("topWidgets");
    const host = priv.get("host-widget");
    const dataSheetsManager = priv.get("dataSheetManager");
    const currentSheet = dataSheetsManager.active;
    renderer`
      <h1>
        <img src="./payment-sheet/images/logo-payment.png" alt="">Firefox Web Payment
      </h1>
      <section id="payment-sheet-top-section">${Array.from(topWidgets.values())
      .filter(({ active }) => active)
      .map(({ widget }) => widget.render(requestData))}</section>
      <section id="payment-sheet-data-sheet" hidden="${currentSheet ? false : true}">${currentSheet ? currentSheet.render(requestData) : ""}</section>
      <section id="payment-sheet-bottom">${host.render(window.location)}<section>
    `;
    if (currentSheet) {
      await currentSheet.validate();
    }
  }
}

/**
 * @this PaymentSheet
 */
function initDialog() {
  const priv = privates.get(this);
  const dialog = document.createElement("dialog");
  dialog.id = "payment-sheet";
  dialog.addEventListener("cancel", this.abort.bind(this));
  priv.set("dialog", dialog);
  priv.set("renderer", hyperHTML.bind(dialog));
  priv.set("isShowing", false);
}

function attatchDialog(dialog) {
  return new Promise(resolve => {
    var attachAndDone = () => {
      document.body.appendChild(dialog);
      dialogPolyfill.registerDialog(dialog);
      return resolve();
    };
    if (document.readyState === "complete") {
      attachAndDone();
      return;
    }
    window.addEventListener("DOMContentLoaded", attachAndDone);
  });
}

function startPaymentSession(paymentSheet) {
  const priv = privates.get(paymentSheet);
  const invertedPromise = {};
  invertedPromise.promise = new Promise((resolve, reject) => {
    Object.assign(invertedPromise, {
      resolve,
      reject,
    });
  });
  priv.set("sessionPromise", invertedPromise);
}

async function init() {
  const priv = privates.get(this);
  const paymentChooser = await new PaymentMethodChooser().ready;
  const addressCollector = await new AddressCollector("shipping").ready;
  addressCollector.addEventListener("shippingaddresschange", ev => {
    this.dispatchEvent(ev);
  });
  const creditCardCollector = await new CreditCardCollector(
    addressCollector
  ).ready;
  const paymentConfirmationCollector = await new PaymentConfirmationCollector(
    addressCollector,
    creditCardCollector
  ).ready;

  const sheets = [
    new DataSheet("Choose your payment method:", paymentChooser, {
      userMustChoose: true,
    }),
    new DataSheet("Shipping address:", addressCollector),
    new DataSheet("", creditCardCollector),
    new DataSheet("", paymentConfirmationCollector, { userMustChoose: true }),
  ];
  sheets.forEach(sheet =>
    sheet.addEventListener("abort", this.abort.bind(this)));
  const dataSheetManager = new DataSheetManager(sheets);
  priv.set("dataSheetManager", dataSheetManager);
  dataSheetManager.addEventListener("update", () => {
    console.log("showing new sheet...");
    this.render();
  });

  dataSheetManager.addEventListener("done", ({ detail: collectedData }) => {
    // Show just the waiting spinner...
    const topWidgets = priv.get("topWidgets");
    Array.from(topWidgets.values()).forEach(obj => obj.active = false);
    topWidgets.get("awaitPaymentResponse").active = true;
    this.render();
    priv.get("sessionPromise").resolve(collectedData);
  });

  await Promise.all([
    dataSheetManager.ready,
    attatchDialog(priv.get("dialog")),
  ]);
  return this;
}

const paymentSheet = new PaymentSheet();
export default paymentSheet;

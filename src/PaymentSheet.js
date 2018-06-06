//import "../css/payment-sheet.css";
import { _details, _options } from "./PaymentRequest.js";
import { bind } from "hyperhtml/cjs";
import "dialog-polyfill/dialog-polyfill.css";
import AddressCollector from "./datacollectors/AddressCollector";
import CreditCardCollector from "./datacollectors/CreditCardCollector";
import DataSheet from "./PaymentSheet.DataSheet.js";
import DataSheetManager from "./DataSheetManager";
import dialogPolyfill from "dialog-polyfill/dialog-polyfill";
import Host from "./PaymentSheet.Host";
import LineItems from "./PaymentSheet.LineItems";
import PaymentMethodChooser from "./datacollectors/PaymentMethodChooser";
import ShippingOptions from "./PaymentSheet.ShippingOptions";
import Total from "./PaymentSheet.Total";
import PaymentConfirmationCollector from "./datacollectors/PaymentConfirmationCollector";
import AwaitPaymentResponse from "./PaymentSheet.AwaitPaymentResponse";

const privates = new WeakMap();
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
class PaymentSheet extends EventTarget {
  constructor() {
    super();
    console.log("Creating payment sheet");
    const priv = privates.set(this, new Map()).get(this);
    initDialog.call(this);

    // WIDGETS
    priv.set("host-widget", new Host());
    const shippingOptionsPicker = new ShippingOptions();
    shippingOptionsPicker.addEventListener(
      "shippingoptionchange",
      ({ detail }) => {
        this.dispatchEvent(new CustomEvent("shippingoptionchange", { detail }));
      }
    );
    // TODO: convert to proper manager
    const topWidgets = new Map();
    topWidgets.set("lineItems", { widget: new LineItems(), active: true });
    topWidgets.set("shippingOptionsPicker", {
      widget: shippingOptionsPicker,
      active: true,
    });
    topWidgets.set("total", { widget: new Total(), active: true });
    topWidgets.set("awaitPaymentResponse", {
      widget: new AwaitPaymentResponse(),
      active: false,
    });
    priv.set("topWidgets", topWidgets);
    const ready = async () => {
      await init(this);
      return this;
    };
    priv.set("ready", ready());
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
   * @param {CustomEvent} ev
   */
  async abort(reason) {
    console.log("aborting", reason);
    const priv = privates.get(this);
    await this.close();
  }

  async open(request) {
    const priv = privates.get(this);
    const dialog = priv.get("dialog");
    if (priv.get("isShowing")) {
      throw new DOMException("Sheet is already showing", "AbortError");
    }
    priv.get("dataSheetManager").reset();
    const topWidgets = priv.get("topWidgets");
    for (const { widget } of topWidgets.values()) {
      widget.request = request;
    }
    if (!dialog.isConnected) {
      await attatchDialog(dialog);
    }
    priv.set("request", request);
    priv.set("isShowing", true);
    startPaymentSession(this);
    dialog.showModal();
    await this.update();
    return this.sessionDone; // collected data is returned
  }

  async update() {
    await this.render();
  }

  async requestClose(reason) {
    const priv = privates.get(this);
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
        priv.get("sessionPromise").resolve();
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
    if (!dialog.hasAttribute("open")) {
      dialog.setAttribute("open", "");
    }
    try {
      dialog.close();
    } catch (err) {
      console.warn("Dialog didn't close correctly", err);
    }
    dialog.remove();
    priv.set("isShowing", false);
  }

  disableInputs() {
    const priv = privates.get(this);
    const topWidgets = priv.get("topWidgets");
    for (const { widget } of topWidgets.values()) {
      widget.disable();
    }
  }

  enableInputs() {
    console.log("...ENABLING INPUTS AGAIN...");
    const priv = privates.get(this);
    const topWidgets = priv.get("topWidgets");
    for (const { widget } of topWidgets.values()) {
      widget.enable();
    }
  }

  async render() {
    await this.ready;
    const priv = privates.get(this);
    const request = priv.get("request");
    const { displayItems, total, shippingOptions } = request[_details];
    const options = request[_options];
    const requestData = {
      displayItems,
      options,
      shippingOptions,
      total,
    };
    const dataSheetManager = priv.get("dataSheetManager");
    dataSheetManager.update(requestData);
    const renderer = priv.get("renderer");
    const topWidgets = priv.get("topWidgets");
    const host = priv.get("host-widget");
    const dataSheetsManager = priv.get("dataSheetManager");
    const currentSheet = dataSheetsManager.active;
    renderer`
      <h1>
        <img src="./payment-sheet/images/logo-payment.png" alt=""> Firefox Web Payment
      </h1>
      <section id="payment-sheet-top-section">${[...topWidgets.values()]
        .filter(({ active }) => active)
        .map(({ widget }) => widget.render(requestData))}</section>
      <section id="payment-sheet-data-sheet" hidden="${
        currentSheet ? false : true
      }">${currentSheet ? currentSheet.render(requestData) : ""}</section>
      <section id="payment-sheet-bottom">${host.render(
        window.location
      )}<section>
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
  dialogPolyfill.registerDialog(dialog);
  dialog.id = "payment-sheet";
  dialog.addEventListener("cancel", () => {
    this.abort("User aborted.");
  });
  priv.set("dialog", dialog);
  priv.set("renderer", bind(dialog));
  priv.set("isShowing", false);
}

function attatchDialog(dialog) {
  return new Promise(resolve => {
    var attachAndDone = () => {
      document.body.appendChild(dialog);
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

async function init(request) {
  console.log("Initializing PaymentSheet");
  const priv = privates.get(request);
  const paymentChooser = await new PaymentMethodChooser().ready;
  console.log("paymentChooser READY!");
  const addressCollector = await new AddressCollector("shipping").ready;
  console.log("AddressCollector READY!");
  addressCollector.addEventListener("shippingaddresschange", ({ detail }) => {
    request.dispatchEvent(new CustomEvent("shippingaddresschange", { detail }));
  });
  const creditCardCollector = await new CreditCardCollector(addressCollector)
    .ready;
  console.log("creditCardCollector READY!");
  const paymentConfirmationCollector = await new PaymentConfirmationCollector(
    addressCollector,
    creditCardCollector
  ).ready;
  const addressDataSheet = new DataSheet("Shipping address:", addressCollector);
  const sheets = [
    new DataSheet("Choose your payment method:", paymentChooser, {
      userMustChoose: true,
    }),
    addressDataSheet,
    new DataSheet("", creditCardCollector),
    new DataSheet("", paymentConfirmationCollector, { userMustChoose: true }),
  ];
  addressDataSheet.addEventListener("continue", () => {
    addressCollector.notifyAddressChange();
  });
  sheets.forEach(sheet =>
    sheet.addEventListener("abort", () => {
      request.abort("User aborted.");
    })
  );
  const dataSheetManager = await new DataSheetManager(sheets).ready;
  console.log("dataSheetManager READY!");
  priv.set("dataSheetManager", dataSheetManager);
  dataSheetManager.addEventListener("update", async () => {
    console.log("showing new sheet...");
    await request.render();
  });

  dataSheetManager.addEventListener(
    "done",
    async ({ detail: collectedData }) => {
      // Show just the waiting spinner...
      const topWidgets = priv.get("topWidgets");
      Array.from(topWidgets.values()).forEach(obj => (obj.active = false));
      topWidgets.get("awaitPaymentResponse").active = true;
      await request.render();
      priv.get("sessionPromise").resolve(collectedData);
    }
  );
}

const paymentSheet = new PaymentSheet();
export default paymentSheet;

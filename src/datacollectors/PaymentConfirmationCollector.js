import hyperHTML from "hyperhtml/hyperhtml.js";
import DataCollector from "./DataCollector";
import AddressFormat from "../formatters/AddressFormat";
import BasicCardResponse from "../BasicCardResponse";
import db from "../AutofillDB";

const monthYearFormatter = new Intl.DateTimeFormat(navigator.languages, {
  month: "2-digit",
  year: "2-digit",
});
const privates = new WeakMap();

const schema = new Set([]);

const buttonLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Pay",
});

const defaultRequestData = Object.freeze({
  options: { requestShipping: false },
});

export default class PaymentConfirmationCollector extends DataCollector {
  constructor(addressCollector, creditCardCollector) {
    super(schema, ["payment-confirmation-collector"], "", null, "hold");
    const priv = privates.set(this, new Map()).get(this);
    priv.set("addressCollector", addressCollector);
    priv.set("creditCardCollector", creditCardCollector);
  }

  get buttonLabels() {
    return buttonLabels;
  }

  get collectedData() {
    return;
  }

  render(requestData = defaultRequestData) {
    const {
      options: {
        requestShipping,
      },
    } = requestData;
    const priv = privates.get(this);
    const addressCollector = priv.get("addressCollector");
    const creditCardCollector = priv.get("creditCardCollector");
    const paymentAddress = addressCollector.toPaymentAddress();
    const cardResponse = creditCardCollector.toBasicCardResponse();
    const shippingAddress = new AddressFormat().format(paymentAddress, "text");
    const network = BasicCardResponse.getCardNetwork(cardResponse.cardNumber);
    const logo = "./payment-sheet/images/icons/" + toImageSrc(cardResponse);
    const lastDigits = cardResponse.cardNumber.substr(-4);
    const expiryDate = new Date();
    expiryDate.setFullYear(cardResponse.expiryYear);
    expiryDate.setMonth(cardResponse.expiryMonth);
    const expires = monthYearFormatter.format(expiryDate);
    const addressChangeHandler = makeCollectorSwitcher(
      addressCollector,
      this.dataSheet
    );
    const ccChangeHandler = makeCollectorSwitcher(
      creditCardCollector,
      this.dataSheet
    );
    const keyUpHandler = ({ target: input }) => {
      let event;
      if (input.validity.valid && input.form.checkValidity()) {
        event = new CustomEvent("datacollected", { detail: this.toObject() });
      } else {
        event = new CustomEvent("invaliddata");
      }
      this.dispatchEvent(event);
    };
    const isRealData = requestData !== defaultRequestData;
    if (isRealData && !addressCollector.didNotifyAddressChange) {
      addressCollector.notifyAddressChange();
    }
    const type = cardResponse.cardSecurityCode ? "hidden" : "text";
    return this.renderer`
      <section class="shipping-summary" hidden="${!requestShipping}">
        <h3>Ship To: 
          <button 
            onclick="${addressChangeHandler}" 
            aria-label="Change shipping type">
              change
          </button>
        </h3>
        <p>
          ${shippingAddress}
        </p>
      </section>
      <section class="card-summary">
        <h3>Card Info:
          <button 
            onclick="${ccChangeHandler}" 
            aria-label="Change payment type">
              change
          </button>
        </h3>
        <p>
          <img height="30" src="${logo}" alt="${network}">
          <span class="ccdigits">
            ${lastDigits}
          </span>
          <abbr title="Expires">EXP.</abbr>
          <time>
            ${expires}
          </time>
          <input
            value="${cardResponse.cardSecurityCode}" 
            inputmode="numeric" 
            maxlength="4" 
            minlength="3" 
            name="cardSecurityCode" 
            placeholder="CVV" 
            size="4" 
            type="${cardResponse.cardSecurityCode ? "hidden" : "text"}" 
            onkeyup="${keyUpHandler}" 
            autofocus="${type === "text" ? true : false}" 
            required="${type === "text" ? true : false}" >
        </p>
        <p class="cardholderName">
          ${cardResponse.cardholderName}
        </p>
      </section>
    `;
  }
}

function makeCollectorSwitcher(dataCollector) {
  return ev => {
    ev.preventDefault();
    dataCollector.dataSheet.requestDisplay();
  };
}

function toImageSrc(cardResponse) {
  const fileName = BasicCardResponse.getCardNetwork(cardResponse.cardNumber)
    .toLowerCase()
    .replace(/\s/g, "-");
  if (!fileName) {
    return "unknown.svg";
  }
  return fileName + ".svg";
}

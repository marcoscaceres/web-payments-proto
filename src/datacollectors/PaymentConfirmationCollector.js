import hyperHTML from "hyperhtml/hyperhtml.js";
import DataCollector from "./DataCollector";
import AddressFormat from "../formatters/AddressFormat";
import BasicCardResponse from "../BasicCardResponse";
import db from "../AutofillDB";

const dateFormatter = new Intl.DateTimeFormat(navigator.languages, {month: "2-digit", year: "2-digit" });

const privates = new WeakMap();

const schema = new Set([]);

const buttonLabels = Object.freeze({
  cancelLabel: "Cancel",
  proceedLabel: "Pay",
});

export default class PaymentConfirmationCollector extends DataCollector  {
  constructor(addressCollector, creditCardCollector) {
    super(schema, ["payment-confirmation-collector"]);
    const priv = privates.set(this, new Map()).get(this);
    priv.set("addressCollector", addressCollector);
    priv.set("creditCardCollector", creditCardCollector);
  }

  get buttonLabels() {
    return buttonLabels;
  }

  get collectedData(){
    return;
  }

  render() {
    const priv = privates.get(this);
    const paymentAddress = priv.get("addressCollector").toPaymentAddress();
    const cardResponse = priv.get("creditCardCollector").toBasicCardResponse();
    const shippingAddress = new AddressFormat().format(paymentAddress, "text");
    const network = BasicCardResponse.getCardNetwork(cardResponse.cardNumber);
    const logo = "./payment-sheet/images/icons/" + toImageSrc(cardResponse);
    const lastDigits = cardResponse.cardNumber.substr(-4); 
    const expiryDate = new Date();
    expiryDate.setFullYear(cardResponse.expiryYear);
    expiryDate.setMonth(cardResponse.expiryMonth);
    const expires = dateFormatter.format(expiryDate);
    return this.renderer `
      <h3>Ship To:</h3>
      <p>
        ${shippingAddress}
      </p>
      <h3>Card Info:</h3>
      <p>
        <img height="30" src="${logo}" alt="${network}">
        <span class="ccdigits">
          ${lastDigits}
        </span>
        <span>
        EXP. ${expires} 
        </span>
      </p>
      <p class="cardholderName">
        ${cardResponse.cardholderName}
      </p>
    `;
  }
}

function toImageSrc(cardResponse){
  const fileName = BasicCardResponse
    .getCardNetwork(cardResponse.cardNumber)
    .toLowerCase()
    .replace(/\s/g, "-");
  if(!fileName){
    return "unknown.svg";
  }
  return fileName + ".svg";
}


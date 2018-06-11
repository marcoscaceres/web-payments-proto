import Dexie from "dexie";

const db = new Dexie("Autofill");

const defaultFields = "timeCreated, timeLastUsed, timeLastModified, timesUsed, "


db.version(1).stores({
  addresses:
    defaultFields + "&guid, organization, streetAddress, addressLevel1, addressLevel2, postalCode, country, tel, email, type",
  cards:
    defaultFields + "&uuid, cardNumber, cardholderName, expiryMonth, expiryYear, billingAddressUuid",
});
db.version(2).stores({
  payers: defaultFields + "&uuid, payerName, payerPhone, payerEmail",
});
window.db = db;

export default db;

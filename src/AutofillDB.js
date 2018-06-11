import Dexie from "dexie";

const db = new Dexie("Autofill");

db.version(1).stores({
  addresses:
    "&guid, organization, streetAddress, addressLevel1, addressLevel2, postalCode, country, tel, email, timeCreated, timeLastUsed, timeLastModified, timesUsed, type",
  cards:
    "&uuid, cardNumber, cardholderName, expiryMonth, expiryYear, billingAddressUuid, timeCreated, timeLastUsed, timeLastModified, timesUsed",
});
db.version(2).stores({
  payers: "&uuid, payerName, payerPhone, payerEmail",
});
window.db = db;

export default db;

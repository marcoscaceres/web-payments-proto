import Dexie from "dexie";

const db = new Dexie("Autofill");

db.version(1).stores({
  addresses: "&guid, organization, streetAddress, addressLevel1, addressLevel2, postalCode, country, tel, email, timeCreated, timeLastUsed, timeLastModified, timesUsed, type",
  cards: "&cardNumber, cardholderName, expiryMonth, expiryYear, billingAddressUuid, timeCreated, timeLastUsed, timeLastModified, timesUsed",
});

window.db = db;

export default db;

import Dexie from "dexie";

const db = new Dexie("Autofill");

db
  .version(1)
  .stores({
    addresses: "&guid, organization, streetAddress, addressLevel1, addressLevel2, postalCode, country, tel, email, timeCreated, timeLastUsed, timeLastModified, timesUsed, type",
    cards: "&card-number, name-on-card, expire-month, expire-year, valid-from-month, valid-from-year, billing-address-uuid",
  });

window.db = db;

export default db;

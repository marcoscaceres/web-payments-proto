import Dexie from "dexie";

const db = new Dexie("Autofill");

db
  .version(1)
  .stores({
    addresses: "&guid, organization, streetAddress, addressLevel2, addressLevel1, postalCode, country, tel, email, timeCreated, timeLastUsed, timeLastModified, timesUsed",
    // cards: "&card-number, name-on-card, expiry-month, expire-year, valid-from-month, valid-from-year",
  });

window.db = db;

export default db;

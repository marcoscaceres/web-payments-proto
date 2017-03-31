import Dexie from "dexie";

const db = new Dexie("Autofill");

db
  .version(1)
  .stores({
    addresses: "&guid, organization, street-address, address-level2, address-level1, postal-code, country, tel, email, timeCreated, timeLastUsed, timeLastModified, timesUsed",
    cards: "&card-number, name-on-card, expiry-month, expire-year, valid-from-month, valid-from-year",
  });

export default db;

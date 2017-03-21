import Dexie from 'dexie';

const db = new Dexie('myDb');
db.version(1).stores({
  addresses: `organization, name,street, suburb,state, postalcode, country phone,email`,
  creditCards: `name-on-card, card-number, expiry-month, expire-year`,
});

export default db;

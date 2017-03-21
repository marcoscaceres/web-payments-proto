const privates = new WeakMap();

export default class Localizable {
  constructor(lang = "", dir = "auto") {
    const priv = privates.set(this, new Map()).get(this);
    priv.set("lang", lang);
    priv.set("dir", dir);
  }
  get lang() {
    return privates.get(this).get("lang");
  }
  get dir() {
    return privates.get(this).get("dir");
  }
}

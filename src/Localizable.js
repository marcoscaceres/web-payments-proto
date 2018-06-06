import IDLDictionary from "./IDLDictionary";

const privates = new WeakMap();

export default class Localizable extends IDLDictionary {
  constructor(lang = "", dir = "auto") {
    super();
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
  toObject() {
    return {
      dir: this.dir,
      lang: this.lang,
    };
  }
}

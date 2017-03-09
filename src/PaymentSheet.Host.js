import hyperHTML from "hyperhtml/hyperhtml.js";

const privates = new WeakMap();

class Host {
  constructor(url = window.location.href) {
    const priv = privates.set(this, new Map()).get(this);
    const section = document.createElement("section");
    priv.set("section", section);
    priv.set("render", hyperHTML.bind(section));
    this.update(url);
  }
  get section() {
    return privates.get(this).get("section");
  }
  update(url) {
    const priv = privates.get(this);
    const render = priv.get("render");
    try {
      let host = new URL(url).host;
      console.log("ssooo", host)
      render `
        <p>Requested by <span>${host}</span>
        </p>
      `;
    } catch (err) {
      render `
        <p class="payment-sheet-error">Invalid URL!!!!</p>
      `;
    }
  }
}

export const host = new Host();

import hyperHTML from "hyperhtml/hyperhtml.js";

const privates = new WeakMap();

export default class Host {
  constructor(url = window.location.href) {
    const priv = privates.set(this, new Map()).get(this);
    const containerElem = document.createElement("section");
    containerElem.id = "payment-sheet-host";
    priv.set("renderer", hyperHTML.bind(containerElem));
  }
  render(url) {
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    let result;
    try {
      let host = new URL(url).host;
      return renderer `<p>Requested by <span>${host}</span></p>`;
    } catch (err) {
      return renderer `<p class="payment-sheet-error">Invalid URL!!!!</p>`;
    }
  }
}


import hyperHTML from "hyperhtml/hyperhtml.js";
const privates = new WeakMap();

export default class AwaitPaymentResponse {
  constructor(){
    const priv = privates.set(this, new Map()).get(this);
    const section = document.createElement("section");
    section.classList.add("await-payment-response");
    priv.set("renderer", hyperHTML.bind(section));
  }
  render(){
    const priv = privates.get(this);
    const renderer = priv.get("renderer");
    return renderer`
        <img src="./payment-sheet/images/ring.svg" width="100" height="100">
        <p class="action">Processing…</p>
        <p>Please do not close the browser</p>
    `;
  }
}

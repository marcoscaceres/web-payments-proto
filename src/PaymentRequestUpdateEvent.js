export default class PaymentRequestUpdateEvent extends Event {
  constructor(type){
    super(type);
  }
  async updateWith(detailsPromise){    
    // Let event be this PaymentRequestUpdateEvent instance.
    // Let target be the value of event's target attribute.
    // If target is not a PaymentRequest object, then throw a TypeError.
    // If the dispatch flag is unset, then throw an "InvalidStateError" DOMException.
    // If event.[[\waitForUpdate]] is true, then throw an "InvalidStateError" DOMException.
    // If target.[[\state]] is not "interactive", then throw an "InvalidStateError" DOMException.
    // If target.[[\updating]] is true, then throw an "InvalidStateError" DOMException.
    // Set event's stop propagation flag and stop immediate propagation flag.
    // Set event.[[\waitForUpdate]] to true.
    // Set target.[[\updating]] to true. 
  }
};
const defaultDescription = {
  writable: true,
  enumerable: true,
  configurable: true,
};
export default class IDLDictionary {
  toObject(dict = this) {
    if (dict instanceof IDLDictionary === false) {
      return {};
    }
    const object = Object.getOwnPropertyNames(dict)
      .filter(identifier => identifier !== "constructor")
      .sort()
      .map(key => {
        let value = this[key] === null ? undefined : this[key];
        if (value instanceof IDLDictionary) {
          value = value.toObject();
        }
        return {
          key,
          value,
        };
      })
      .reduce((obj, { key, value }) => {
        Object.defineProperty(
          obj,
          key,
          Object.assign({ value }, defaultDescription)
        );
        return obj;
      }, {});
    return Object.assign(object, this.toObject(Object.getPrototypeOf(dict)));
  }
}

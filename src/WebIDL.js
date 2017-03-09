//emulate native code toString()
function toStringMaker(name) {
  return () => {
    return `function ${name}() { [fake native code] }`;
  };
}

const protoProps = {
  writable: false,
  enumerable: false,
  configurable: false
}

export function exportInterfaceObject(interfaceProto, interfaceObject) {
  const identifier = interfaceObject.name;
  interfaceProto.prototype.toString = function() {
    if (this instanceof interfaceProto) {
      return `[object ${identifier}]`;
    }
    return `[object ${identifier} Prototype]`;
  };
  interfaceObject.prototype = interfaceProto.prototype;
  Object.defineProperty(interfaceObject, 'prototype', protoProps);

  interfaceProto.prototype.constructor = interfaceObject;
  Object.defineProperty(interfaceProto.prototype, 'constructor', {
    enumerable: false
  });

  //replace toString with a "native" looking one
  interfaceProto.toString = interfaceObject.toString = toStringMaker(identifier);

  //Expose on global object
  Object.defineProperty(global || window, identifier, {
    value: interfaceObject
  });
  return interfaceObject;
}

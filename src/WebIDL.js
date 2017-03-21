"use strict";
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
};

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
  Object.defineProperty(window, identifier, {
    value: interfaceObject
  });
  return interfaceObject;
}

const attrDefaults = {
  isReadOnly: false,
  isStatic: false,
  extendedAttrs: [],
}

export function implementAttr(object, name, opts = attrDefaults) {
  const { isReadOnly, isStatic, get, set, extendedAttrs } = Object.assign({}, opts, attrDefaults);
  const property = {
    get,
    set,
    enumerable: true,
    configurable: !!(extendedAttrs.unforgable) || true
  };

  if (typeof object !== 'object' || typeof name !== 'string') {
    throw new TypeError();
  }

  //setter
  if (!isReadOnly) {
    property.set = () => {
      if (arguments.length === 0) {
        throw new TypeError("Expected one argument.");
      }
      return set(arguments[0]);
    };
  }

  //getter
  if (!!isStatic) {
    if (typeof object !== 'function') {
      interfaceObject = Object.getProtoTypeOf(object).prototype;
      if (typeof interfaceObject !== 'function') {
        throw new TypeError();
      }
    }
    object = interfaceObject;
    return;
  }
  Object.defineProperty(object, name, property);
}

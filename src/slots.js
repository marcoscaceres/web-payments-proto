export function makeSlotGetter(internalSlots) {
  return (obj, name) => {
    const slots = internalSlots.get(obj);
    if (!slots) {
      throw new TypeError("Object not found");
    }
    if (name in slots === false) {
      throw new TypeError(`Invalid slot: ${name}`);
    }
    return slots[name];
  };
}

export function makeSlotSetter(internalSlots) {
  return (obj, name, value) => {
    const slots = internalSlots.get(obj);
    if (!slots) {
      throw new TypeError("Object not found");
    }
    if (name in slots === false) {
      throw new TypeError(`Invalid slot: ${name}`);
    }
    slots[name] = value;
  };
}

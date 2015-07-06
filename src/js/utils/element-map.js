// start at one to make the falsy semantics easier
let uuidGenerator = 1;

class ElementMap {
  constructor() {
    this._map = {};
  }
  set(key, value) {
    let uuid = key.dataset.uuid;
    if (!uuid) {
      key.dataset.uuid = uuid = uuidGenerator++;
    }
    this._map[uuid] = value;
  }
  get(key) {
    if (key.dataset && key.dataset.uuid) {
      return this._map[key.dataset.uuid];
    }
    return null;
  }
  remove(key) {
    if (!key.dataset.uuid) {
      throw new Error('tried to fetch a value for an element not seen before');
    }
    delete this._map[key.dataset.uuid];
  }

}

export default ElementMap;

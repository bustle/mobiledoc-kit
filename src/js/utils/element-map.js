import assert from 'mobiledoc-kit/utils/assert';

// start at one to make the falsy semantics easier
let uuidGenerator = 1;

class ElementMap {
  constructor() {
    this._map = {};
  }
  set(key, value) {
    let uuid = key._uuid;
    if (!uuid) {
      key._uuid = uuid = '' + uuidGenerator++;
    }
    this._map[uuid] = value;
  }
  get(key) {
    if (key._uuid) {
      return this._map[key._uuid];
    }
    return null;
  }
  remove(key) {
    assert('tried to fetch a value for an element not seen before', !!key._uuid);
    delete this._map[key._uuid];
  }

}

export default ElementMap;

import assert from './assert'

// start at one to make the falsy semantics easier
let uuidGenerator = 1

interface ElementKey {
  _uuid?: string
}

export default class ElementMap {
  _map: {
    [key: string]: unknown
  } = {}

  set(key: ElementKey, value: unknown) {
    let uuid = key._uuid
    if (!uuid) {
      key._uuid = uuid = '' + uuidGenerator++
    }
    this._map[uuid] = value
  }

  get(key: ElementKey) {
    if (key._uuid) {
      return this._map[key._uuid]
    }
    return null
  }

  remove(key: ElementKey) {
    assertHasUuid(key)
    delete this._map[key._uuid]
  }
}

function assertHasUuid(key: ElementKey): asserts key is { _uuid: string } {
  assert('tried to fetch a value for an element not seen before', !!key._uuid)
}

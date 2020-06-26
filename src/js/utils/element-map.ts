import assert from './assert'

// start at one to make the falsy semantics easier
let uuidGenerator = 1

interface ElementKey {
  _uuid?: string
}

export default class ElementMap<T> {
  _map: {
    [key: string]: T
  } = {}

  set(key: object, value: T) {
    let uuid = (key as ElementKey)._uuid
    if (!uuid) {
      ;(key as ElementKey)._uuid = uuid = '' + uuidGenerator++
    }
    this._map[uuid] = value
  }

  get(key: object) {
    if ((key as ElementKey)._uuid) {
      return this._map[(key as ElementKey)._uuid!]
    }
    return null
  }

  remove(key: object) {
    assertHasUuid(key)
    delete this._map[key._uuid]
  }
}

function assertHasUuid(key: ElementKey): asserts key is { _uuid: string } {
  assert('tried to fetch a value for an element not seen before', !!key._uuid)
}

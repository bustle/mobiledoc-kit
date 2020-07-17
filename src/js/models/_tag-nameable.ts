import { normalizeTagName } from '../utils/dom-utils'
import assert from '../utils/assert'
import Section from './_section'

type Constructor<T = {}> = new (...args: any[]) => T

export interface TagNameable {
  tagName: string
  isValidTagName(normalizedTagName: string): boolean
}

export function tagNameable(Base: Constructor<Section>) {
  abstract class TagNameable extends Base {
    _tagName: string | null = null

    set tagName(val: string) {
      let normalizedTagName = normalizeTagName(val)
      assert(`Cannot set section tagName to ${val}`, this.isValidTagName(normalizedTagName))
      this._tagName = normalizedTagName
    }

    get tagName() {
      return this._tagName as string
    }

    abstract isValidTagName(normalizedTagName: string): boolean
  }

  return TagNameable
}

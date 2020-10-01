import { entries } from '../utils/object-utils'
import { contains } from '../utils/array-utils'
import { assertType } from '../utils/assert'
import Section, { isNested } from './_section'
import { Dict } from '../utils/types'

export const VALID_ATTRIBUTES = ['data-md-text-align']

export interface Attributable {
  attributes: { [key: string]: string }
  hasAttribute: (key: string) => boolean
  setAttribute: (key: string, value: string) => void
  removeAttribute: (key: string) => void
  getAttribute: (key: string) => string
  eachAttribute: (cb: (key: string, value: string) => void) => void
}

type AbstractConstructor<T> = Function & { prototype: T }
type Constructor<T> = new (...args: any[]) => T

/*
 * A "mixin" to add section attribute support
 * to markup and list sections.
 */
export function attributable<T extends unknown>(Base: AbstractConstructor<T>): Constructor<T & Attributable> {
  return class extends (Base as any) {
    attributes: Dict<string> = {}

    hasAttribute(key: string) {
      return key in this.attributes
    }

    setAttribute(key: string, value: string) {
      if (!contains(VALID_ATTRIBUTES, key)) {
        throw new Error(`Invalid attribute "${key}" was passed. Constrain attributes to the spec-compliant whitelist.`)
      }
      this.attributes[key] = value
    }

    removeAttribute(key: string) {
      delete this.attributes[key]
    }

    getAttribute(key: string) {
      return this.attributes[key]
    }

    eachAttribute(cb: (key: string | number, value: string) => void) {
      entries(this.attributes).forEach(([k, v]) => cb(k, v))
    }
  } as Constructor<T & Attributable>
}

export function expectAttributable(section: Section): Section & Attributable {
  assertType<Section & Attributable>('expected section to be attributable', section, 'attributes' in section)
  return section
}

export function getSectionAttributes(section: Section): Dict<string> {
  if (isNested(section)) {
    return section.parent.attributes || {}
  }
  return section.attributes || {}
}

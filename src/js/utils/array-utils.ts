import { Dict } from './types'

interface Detectable<T> {
  detect(cb: (val: T) => boolean): T
}

export interface Indexable<T> {
  [key: number]: T
  length: number
}

export function detect<T>(enumerable: Detectable<T> | Indexable<T>, callback: (val: T) => boolean): T | undefined {
  if ('detect' in enumerable) {
    return enumerable.detect(callback)
  } else {
    for (let i = 0; i < enumerable.length; i++) {
      if (callback(enumerable[i])) {
        return enumerable[i]
      }
    }
  }
}

interface Anyable<T> {
  any(cb: (val: T) => boolean): boolean
}

export function any<T>(enumerable: Anyable<T> | Indexable<T>, callback: (val: T) => boolean): boolean {
  if ('any' in enumerable) {
    return enumerable.any(callback)
  }

  for (let i = 0; i < enumerable.length; i++) {
    if (callback(enumerable[i])) {
      return true
    }
  }

  return false
}

interface Everyable<T> {
  every(cb: (val: T) => boolean): boolean
}

export function every<T>(enumerable: Everyable<T> | Indexable<T>, callback: (val: T) => boolean): boolean {
  if ('every' in enumerable) {
    return enumerable.every(callback)
  }

  for (let i = 0; i < enumerable.length; i++) {
    if (!callback(enumerable[i])) {
      return false
    }
  }

  return true
}

export function toArray<T>(arrayLike: ArrayLike<T>): T[] {
  return Array.prototype.slice.call(arrayLike)
}

export interface ForEachable<T> {
  forEach(cb: (val: T, idx: number) => void): void
}

/**
 * Useful for array-like things that aren't
 * actually arrays, like NodeList
 * @private
 */
export function forEach<T>(enumerable: ForEachable<T> | Indexable<T>, callback: (val: T, idx: number) => void): void {
  if ('forEach' in enumerable) {
    enumerable.forEach(callback)
  } else {
    for (let i = 0; i < enumerable.length; i++) {
      callback(enumerable[i], i)
    }
  }
}

export function filter<T>(enumerable: ForEachable<T>, conditionFn: (val: T) => boolean) {
  const filtered: T[] = []

  forEach(enumerable, i => {
    if (conditionFn(i)) {
      filtered.push(i)
    }
  })

  return filtered
}

/**
 * @return {Integer} the number of items that are the same, starting from the 0th index, in a and b
 * @private
 */
export function commonItemLength(listA: ArrayLike<unknown>, listB: ArrayLike<unknown>) {
  let offset = 0

  while (offset < listA.length && offset < listB.length) {
    if (listA[offset] !== listB[offset]) {
      break
    }
    offset++
  }

  return offset
}

/**
 * @return {Array} the items that are the same, starting from the 0th index, in a and b
 * @private
 */
export function commonItems<T>(listA: T[], listB: T[]): T[] {
  let offset = 0

  while (offset < listA.length && offset < listB.length) {
    if (listA[offset] !== listB[offset]) {
      break
    }
    offset++
  }

  return listA.slice(0, offset)
}

// return new array without falsy items like ruby's `compact`
export function compact<T>(enumerable: ForEachable<T>) {
  return filter(enumerable, i => !!i)
}

export function reduce<T, U>(
  enumerable: ForEachable<T>,
  callback: (prev: U, val: T, index: number) => U,
  initialValue: U
): U {
  let previousValue = initialValue

  forEach(enumerable, (val, index) => {
    previousValue = callback(previousValue, val, index)
  })

  return previousValue
}

/**
 * @param {Array} array of key1,value1,key2,value2,...
 * @return {Object} {key1:value1, key2:value2, ...}
 * @private
 */
export function kvArrayToObject<T>(array: (T | string)[]): { [key: string]: T } {
  const obj: { [key: string]: T } = {}

  for (let i = 0; i < array.length; i += 2) {
    let [key, value] = [array[i], array[i + 1]]
    obj[key as string] = value as T
  }

  return obj
}

export function objectToSortedKVArray<T extends {}>(obj: T): (keyof T | T[keyof T])[] {
  const keys = Object.keys(obj).sort() as (keyof T)[]
  const result: (keyof T | T[keyof T])[] = []

  keys.forEach(k => {
    result.push(k)
    result.push(obj[k])
  })

  return result
}

// check shallow equality of two non-nested arrays
export function isArrayEqual<T>(arr1: ArrayLike<T>, arr2: ArrayLike<T>): boolean {
  let l1 = arr1.length
  let l2 = arr2.length

  if (l1 !== l2) {
    return false
  }

  for (let i = 0; i < l1; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }

  return true
}

// return an object with only the valid keys
export function filterObject<T>(object: Dict<T>, validKeys: string[] = []) {
  let result: Dict<T> = {}

  forEach(
    filter(Object.keys(object), key => validKeys.indexOf(key) !== -1),
    key => (result[key] = (object as any)[key])
  )

  return result
}

export function contains<T>(array: T[], item: T): boolean {
  return array.indexOf(item) !== -1
}

export function values<T extends {}>(object: T): T[keyof T][] {
  return (Object.keys(object) as (keyof T)[]).map(key => object[key])
}

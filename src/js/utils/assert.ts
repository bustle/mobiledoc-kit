import MobiledocError from './mobiledoc-error'

export default function (message: string, conditional: unknown): asserts conditional {
  if (!conditional) {
    throw new MobiledocError(message)
  }
}

export function assertNotNull<T>(message: string, value: T | null): asserts value is T {
  if (value === null) {
    throw new MobiledocError(message)
  }
}

export function expect<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new MobiledocError(message)
  }
  return value
}

export function unwrap<T>(value: T | null | undefined): T {
  return expect(value, 'expected value to not be null or undefined')
}

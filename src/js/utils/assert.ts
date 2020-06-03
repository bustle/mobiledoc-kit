import MobiledocError from './mobiledoc-error'

export default function (message: string, conditional: boolean) {
  if (!conditional) {
    throw new MobiledocError(message)
  }
}

export function assertNotNull<T>(message: string, value: T | null): asserts value is T {
  if (value === null) {
    throw new MobiledocError(message)
  }
}

export function shallowCopyObject<T extends {}>(object: T): T {
  return { ...object }
}

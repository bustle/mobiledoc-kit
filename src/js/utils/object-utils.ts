export function entries<T extends { [key: string]: unknown }, K extends keyof T>(obj: T): [keyof T, T[K]][] {
  const ownProps = Object.keys(obj) as K[]
  let i = ownProps.length
  const resArray = new Array<[keyof T, T[K]]>(i)

  while (i--) {
    resArray[i] = [ownProps[i], obj[ownProps[i]]]
  }

  return resArray
}

export function entries<T extends { [key: string]: unknown }, K extends Extract<keyof T, string>>(obj: T): [K, T[K]][] {
  const ownProps = Object.keys(obj) as K[]
  let i = ownProps.length
  const resArray = new Array<[K, T[K]]>(i)

  while (i--) {
    resArray[i] = [ownProps[i], obj[ownProps[i]]]
  }

  return resArray
}

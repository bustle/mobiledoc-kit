import Section from './_section'

export type Cloneable<T> = T & {
  clone(): Cloneable<T>
}

export function expectCloneable<T extends Section>(section: T): Cloneable<T> {
  if (!('clone' in section)) {
    throw new Error('Expected section to be cloneable')
  }

  return section as Cloneable<T>
}

const CONSTRUCTOR_FN_NAME = 'constructor'

interface WithPrototype<TP> {
  prototype: TP
}

export default function mixin<TP, T extends WithPrototype<TP>, SP, S extends WithPrototype<SP>>(
  target: T,
  source: S | SP
) {
  const targetPrototype = target.prototype
  // Fallback to just `source` to allow mixing in a plain object (pojo)
  source = (source as S).prototype || source

  Object.getOwnPropertyNames(source).forEach(name => {
    if (name !== CONSTRUCTOR_FN_NAME) {
      const descriptor = Object.getOwnPropertyDescriptor(source, name)

      Object.defineProperty(targetPrototype, name, descriptor!)
    }
  })
}

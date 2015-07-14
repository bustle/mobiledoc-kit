const CONSTRUCTOR_FN_NAME = 'constructor';

export default function mixin(target, source) {
  target = target.prototype;
  source = source.prototype;

  Object.getOwnPropertyNames(source).forEach((name) => {
    if (name !== CONSTRUCTOR_FN_NAME) {
      const descriptor = Object.getOwnPropertyDescriptor(source, name);

      Object.defineProperty(target, name, descriptor);
    }
  });
}

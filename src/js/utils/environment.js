export default {
  isBrowser: (typeof window !== undefined),
  isNode: (typeof window === 'undefined' && typeof process !== 'undefined')
};

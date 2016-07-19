export default {
  isMac() {
    return (typeof window !== 'undefined') && window.navigator && /Mac/.test(window.navigator.platform);
  },
  isWin() {
    return (typeof window !== 'undefined') && window.navigator && /Win/.test(window.navigator.platform);
  }
};

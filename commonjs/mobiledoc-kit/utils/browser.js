'use strict';

exports['default'] = {
  isMac: function isMac() {
    return typeof window !== 'undefined' && window.navigator && /Mac/.test(window.navigator.platform);
  },
  isWin: function isWin() {
    return typeof window !== 'undefined' && window.navigator && /Win/.test(window.navigator.platform);
  }
};
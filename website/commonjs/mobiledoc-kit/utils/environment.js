'use strict';

exports['default'] = {
  hasDOM: function hasDOM() {
    return typeof document !== 'undefined';
  }
};
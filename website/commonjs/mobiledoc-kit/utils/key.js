'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.modifierMask = modifierMask;
exports.specialCharacterToCode = specialCharacterToCode;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _keycodes = require('./keycodes');

var _keys = require('./keys');

var _utilsCharacters = require('../utils/characters');

/**
 * @typedef Direction
 * @enum {number}
 * @property {number} FORWARD
 * @property {number} BACKWARD
 */

var _assert = require('./assert');

var DIRECTION = {
  FORWARD: 1,
  BACKWARD: -1
};
exports.DIRECTION = DIRECTION;
var MODIFIERS = {
  META: 1, // also called "command" on OS X
  CTRL: 2,
  SHIFT: 4,
  ALT: 8 // also called "option" on OS X
};

exports.MODIFIERS = MODIFIERS;

function modifierMask(event) {
  var metaKey = event.metaKey;
  var shiftKey = event.shiftKey;
  var ctrlKey = event.ctrlKey;
  var altKey = event.altKey;

  var modVal = function modVal(val, modifier) {
    return val && modifier || 0;
  };
  return modVal(metaKey, MODIFIERS.META) + modVal(shiftKey, MODIFIERS.SHIFT) + modVal(ctrlKey, MODIFIERS.CTRL) + modVal(altKey, MODIFIERS.ALT);
}

var SPECIAL_KEYS = {
  BACKSPACE: _keycodes['default'].BACKSPACE,
  TAB: _keycodes['default'].TAB,
  ENTER: _keycodes['default'].ENTER,
  ESC: _keycodes['default'].ESC,
  SPACE: _keycodes['default'].SPACE,
  PAGEUP: _keycodes['default'].PAGEUP,
  PAGEDOWN: _keycodes['default'].PAGEDOWN,
  END: _keycodes['default'].END,
  HOME: _keycodes['default'].HOME,
  LEFT: _keycodes['default'].LEFT,
  UP: _keycodes['default'].UP,
  RIGHT: _keycodes['default'].RIGHT,
  DOWN: _keycodes['default'].DOWN,
  INS: _keycodes['default'].INS,
  DEL: _keycodes['default'].DELETE
};

function specialCharacterToCode(specialCharacter) {
  return SPECIAL_KEYS[specialCharacter];
}

// heuristic for determining if `event` is a key event
function isKeyEvent(event) {
  return (/^key/.test(event.type)
  );
}

/**
 * An abstraction around a KeyEvent
 * that key listeners in the editor can use
 * to determine what sort of key was pressed
 */
var Key = (function () {
  function Key(event) {
    _classCallCheck(this, Key);

    this.key = event.key;
    this.keyCode = event.keyCode;
    this.charCode = event.charCode;
    this.event = event;
    this.modifierMask = modifierMask(event);
  }

  _createClass(Key, [{
    key: 'toString',
    value: function toString() {
      if (this.isTab()) {
        return _utilsCharacters.TAB;
      }
      return String.fromCharCode(this.charCode);
    }

    // See https://caniuse.com/#feat=keyboardevent-key for browser support.
  }, {
    key: 'isKeySupported',
    value: function isKeySupported() {
      return this.key;
    }
  }, {
    key: 'isKey',
    value: function isKey(identifier) {
      if (this.isKeySupported()) {
        (0, _assert['default'])('Must define Keys.' + identifier + '.', _keys['default'][identifier]);
        return this.key === _keys['default'][identifier];
      } else {
        (0, _assert['default'])('Must define Keycodes.' + identifier + '.', _keycodes['default'][identifier]);
        return this.keyCode === _keycodes['default'][identifier];
      }
    }
  }, {
    key: 'isEscape',
    value: function isEscape() {
      return this.isKey('ESC');
    }
  }, {
    key: 'isDelete',
    value: function isDelete() {
      return this.isKey('BACKSPACE') || this.isForwardDelete();
    }
  }, {
    key: 'isForwardDelete',
    value: function isForwardDelete() {
      return this.isKey('DELETE');
    }
  }, {
    key: 'isArrow',
    value: function isArrow() {
      return this.isHorizontalArrow() || this.isVerticalArrow();
    }
  }, {
    key: 'isHorizontalArrow',
    value: function isHorizontalArrow() {
      return this.isLeftArrow() || this.isRightArrow();
    }
  }, {
    key: 'isHorizontalArrowWithoutModifiersOtherThanShift',
    value: function isHorizontalArrowWithoutModifiersOtherThanShift() {
      return this.isHorizontalArrow() && !(this.ctrlKey || this.metaKey || this.altKey);
    }
  }, {
    key: 'isVerticalArrow',
    value: function isVerticalArrow() {
      return this.isKey('UP') || this.isKey('DOWN');
    }
  }, {
    key: 'isLeftArrow',
    value: function isLeftArrow() {
      return this.isKey('LEFT');
    }
  }, {
    key: 'isRightArrow',
    value: function isRightArrow() {
      return this.isKey('RIGHT');
    }
  }, {
    key: 'isHome',
    value: function isHome() {
      return this.isKey('HOME');
    }
  }, {
    key: 'isEnd',
    value: function isEnd() {
      return this.isKey('END');
    }
  }, {
    key: 'isPageUp',
    value: function isPageUp() {
      return this.isKey('PAGEUP');
    }
  }, {
    key: 'isPageDown',
    value: function isPageDown() {
      return this.isKey('PAGEDOWN');
    }
  }, {
    key: 'isInsert',
    value: function isInsert() {
      return this.isKey('INS');
    }
  }, {
    key: 'isClear',
    value: function isClear() {
      return this.isKey('CLEAR');
    }
  }, {
    key: 'isPause',
    value: function isPause() {
      return this.isKey('PAUSE');
    }
  }, {
    key: 'isSpace',
    value: function isSpace() {
      return this.isKey('SPACE');
    }

    // In Firefox, pressing ctrl-TAB will switch to another open browser tab, but
    // it will also fire a keydown event for the tab+modifier (ctrl). This causes
    // Mobiledoc to erroneously insert a tab character before FF switches to the
    // new browser tab.  Chrome doesn't fire this event so the issue doesn't
    // arise there. Fix this by returning false when the TAB key event includes a
    // modifier.
    // See: https://github.com/bustle/mobiledoc-kit/issues/565
  }, {
    key: 'isTab',
    value: function isTab() {
      return !this.hasAnyModifier() && this.isKey('TAB');
    }
  }, {
    key: 'isEnter',
    value: function isEnter() {
      return this.isKey('ENTER');
    }

    /*
     * If the key is the actual shift key. This is false when the shift key
     * is held down and the source `event` is not the shift key.
     * @see {isShift}
     * @return {bool}
     */
  }, {
    key: 'isShiftKey',
    value: function isShiftKey() {
      return this.isKey('SHIFT');
    }

    /*
     * If the key is the actual alt key (aka "option" on mac). This is false when the alt key
     * is held down and the source `event` is not the alt key.
     * @return {bool}
     */
  }, {
    key: 'isAltKey',
    value: function isAltKey() {
      return this.isKey('ALT');
    }

    /*
     * If the key is the actual ctrl key. This is false when the ctrl key
     * is held down and the source `event` is not the ctrl key.
     * @return {bool}
     */
  }, {
    key: 'isCtrlKey',
    value: function isCtrlKey() {
      return this.isKey('CTRL');
    }
  }, {
    key: 'isIME',
    value: function isIME() {
      // FIXME the IME action seems to get lost when we issue an
      // `editor.deleteSelection` before it (in Chrome)
      return this.keyCode === _keycodes['default'].IME;
    }
  }, {
    key: 'isShift',

    /**
     * If the shift key is depressed.
     * For example, while holding down meta+shift, pressing the "v"
     * key would result in an event whose `Key` had `isShift()` with a truthy value,
     * because the shift key is down when pressing the "v".
     * @see {isShiftKey} which checks if the key is actually the shift key itself.
     * @return {bool}
     */
    value: function isShift() {
      return this.shiftKey;
    }
  }, {
    key: 'hasModifier',
    value: function hasModifier(modifier) {
      return modifier & this.modifierMask;
    }
  }, {
    key: 'hasAnyModifier',
    value: function hasAnyModifier() {
      return !!this.modifierMask;
    }
  }, {
    key: 'isPrintableKey',
    value: function isPrintableKey() {
      return !(this.isArrow() || this.isHome() || this.isEnd() || this.isPageUp() || this.isPageDown() || this.isInsert() || this.isClear() || this.isPause() || this.isEscape());
    }
  }, {
    key: 'isNumberKey',
    value: function isNumberKey() {
      if (this.isKeySupported()) {
        return this.key >= '0' && this.key <= '9';
      } else {
        var code = this.keyCode;
        return code >= _keycodes['default']['0'] && code <= _keycodes['default']['9'] || code >= _keycodes['default'].NUMPAD_0 && code <= _keycodes['default'].NUMPAD_9; // numpad keys
      }
    }
  }, {
    key: 'isLetterKey',
    value: function isLetterKey() {
      if (this.isKeySupported()) {
        var key = this.key;
        return key >= 'a' && key <= 'z' || key >= 'A' && key <= 'Z';
      } else {
        var code = this.keyCode;
        return code >= _keycodes['default'].A && code <= _keycodes['default'].Z || code >= _keycodes['default'].a && code <= _keycodes['default'].z;
      }
    }
  }, {
    key: 'isPunctuation',
    value: function isPunctuation() {
      if (this.isKeySupported()) {
        var key = this.key;
        return key >= ';' && key <= '`' || key >= '[' && key <= '"';
      } else {
        var code = this.keyCode;
        return code >= _keycodes['default'][';'] && code <= _keycodes['default']['`'] || code >= _keycodes['default']['['] && code <= _keycodes['default']['"'];
      }
    }

    /**
     * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Printable_keys_in_standard_position
     *   and http://stackoverflow.com/a/12467610/137784
     */
  }, {
    key: 'isPrintable',
    value: function isPrintable() {
      if (this.ctrlKey || this.metaKey) {
        return false;
      }

      // Firefox calls keypress events for some keys that should not be printable
      if (!this.isPrintableKey()) {
        return false;
      }

      return this.keyCode !== 0 || this.toString().length > 0 || this.isNumberKey() || this.isSpace() || this.isTab() || this.isEnter() || this.isLetterKey() || this.isPunctuation() || this.isIME();
    }
  }, {
    key: 'direction',
    get: function get() {
      switch (true) {
        case this.isDelete():
          return this.isForwardDelete() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
        case this.isHorizontalArrow():
          return this.isRightArrow() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
      }
    }
  }, {
    key: 'ctrlKey',
    get: function get() {
      return MODIFIERS.CTRL & this.modifierMask;
    }
  }, {
    key: 'metaKey',
    get: function get() {
      return MODIFIERS.META & this.modifierMask;
    }
  }, {
    key: 'shiftKey',
    get: function get() {
      return MODIFIERS.SHIFT & this.modifierMask;
    }
  }, {
    key: 'altKey',
    get: function get() {
      return MODIFIERS.ALT & this.modifierMask;
    }
  }], [{
    key: 'fromEvent',
    value: function fromEvent(event) {
      (0, _assert['default'])('Must pass a Key event to Key.fromEvent', event && isKeyEvent(event));
      return new Key(event);
    }
  }]);

  return Key;
})();

exports['default'] = Key;
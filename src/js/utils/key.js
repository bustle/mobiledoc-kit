import Keycodes from './keycodes';
import Keys from './keys';
import { TAB } from 'mobiledoc-kit/utils/characters';

/**
 * @typedef Direction
 * @enum {number}
 * @property {number} FORWARD
 * @property {number} BACKWARD
 */
export const DIRECTION = {
  FORWARD: 1,
  BACKWARD: -1
};
import assert from './assert';

export const MODIFIERS = {
  META: 1, // also called "command" on OS X
  CTRL: 2,
  SHIFT: 4,
  ALT: 8   // also called "option" on OS X
};

export function modifierMask(event) {
  let {
    metaKey, shiftKey, ctrlKey, altKey
  } = event;
  let modVal = (val, modifier) => {
    return (val && modifier) || 0;
  };
  return modVal(metaKey,  MODIFIERS.META) +
         modVal(shiftKey, MODIFIERS.SHIFT) +
         modVal(ctrlKey,  MODIFIERS.CTRL) +
         modVal(altKey,   MODIFIERS.ALT);
}

const SPECIAL_KEYS = {
  BACKSPACE: Keycodes.BACKSPACE,
  TAB:       Keycodes.TAB,
  ENTER:     Keycodes.ENTER,
  ESC:       Keycodes.ESC,
  SPACE:     Keycodes.SPACE,
  PAGEUP:    Keycodes.PAGEUP,
  PAGEDOWN:  Keycodes.PAGEDOWN,
  END:       Keycodes.END,
  HOME:      Keycodes.HOME,
  LEFT:      Keycodes.LEFT,
  UP:        Keycodes.UP,
  RIGHT:     Keycodes.RIGHT,
  DOWN:      Keycodes.DOWN,
  INS:       Keycodes.INS,
  DEL:       Keycodes.DELETE
};

export function specialCharacterToCode(specialCharacter) {
  return SPECIAL_KEYS[specialCharacter];
}

// heuristic for determining if `event` is a key event
function isKeyEvent(event) {
  return /^key/.test(event.type);
}

/**
 * An abstraction around a KeyEvent
 * that key listeners in the editor can use
 * to determine what sort of key was pressed
 */
const Key = class Key {
  constructor(event) {
    this.key = event.key;
    this.keyCode = event.keyCode;
    this.charCode = event.charCode;
    this.event = event;
    this.modifierMask = modifierMask(event);
  }

  static fromEvent(event) {
    assert('Must pass a Key event to Key.fromEvent',
           event && isKeyEvent(event));
    return new Key(event);
  }

  toString() {
    if (this.isTab()) { return TAB; }
    return String.fromCharCode(this.charCode);
  }

  // See https://caniuse.com/#feat=keyboardevent-key for browser support.
  isKeySupported() {
    return this.key;
  }

  isKey(identifier) {
    if (this.isKeySupported()) {
      assert(`Must define Keys.${identifier}.`, Keys[identifier]);
      return this.key === Keys[identifier];
    } else {
      assert(`Must define Keycodes.${identifier}.`, Keycodes[identifier]);
      return this.keyCode === Keycodes[identifier];
    }
  }

  isEscape() {
    return this.isKey('ESC');
  }

  isDelete() {
    return this.isKey('BACKSPACE') || this.isForwardDelete();
  }

  isForwardDelete() {
    return this.isKey('DELETE');
  }

  isArrow() {
    return this.isHorizontalArrow() || this.isVerticalArrow();
  }

  isHorizontalArrow() {
    return this.isLeftArrow() || this.isRightArrow();
  }

  isHorizontalArrowWithoutModifiersOtherThanShift() {
    return this.isHorizontalArrow() &&
      !(this.ctrlKey || this.metaKey || this.altKey);
  }

  isVerticalArrow() {
    return this.isKey('UP') || this.isKey('DOWN');
  }

  isLeftArrow() {
    return this.isKey('LEFT');
  }

  isRightArrow() {
    return this.isKey('RIGHT');
  }

  isHome() {
    return this.isKey('HOME');
  }

  isEnd() {
    return this.isKey('END');
  }

  isPageUp() {
    return this.isKey('PAGEUP');
  }

  isPageDown() {
    return this.isKey('PAGEDOWN');
  }

  isInsert() {
    return this.isKey('INS');
  }

  isClear() {
    return this.isKey('CLEAR');
  }

  isPause() {
    return this.isKey('PAUSE');
  }

  isSpace() {
    return this.isKey('SPACE');
  }

  // In Firefox, pressing ctrl-TAB will switch to another open browser tab, but
  // it will also fire a keydown event for the tab+modifier (ctrl). This causes
  // Mobiledoc to erroneously insert a tab character before FF switches to the
  // new browser tab.  Chrome doesn't fire this event so the issue doesn't
  // arise there. Fix this by returning false when the TAB key event includes a
  // modifier.
  // See: https://github.com/bustle/mobiledoc-kit/issues/565
  isTab() {
    return !this.hasAnyModifier() && this.isKey('TAB');
  }

  isEnter() {
    return this.isKey('ENTER');
  }

  /*
   * If the key is the actual shift key. This is false when the shift key
   * is held down and the source `event` is not the shift key.
   * @see {isShift}
   * @return {bool}
   */
  isShiftKey() {
    return this.isKey('SHIFT');
  }

  /*
   * If the key is the actual alt key (aka "option" on mac). This is false when the alt key
   * is held down and the source `event` is not the alt key.
   * @return {bool}
   */
  isAltKey() {
    return this.isKey('ALT');
  }

  /*
   * If the key is the actual ctrl key. This is false when the ctrl key
   * is held down and the source `event` is not the ctrl key.
   * @return {bool}
   */
  isCtrlKey() {
    return this.isKey('CTRL');
  }

  isIME() {
    // FIXME the IME action seems to get lost when we issue an
    // `editor.deleteSelection` before it (in Chrome)
    return this.keyCode === Keycodes.IME;
  }

  get direction() {
    switch (true) {
      case this.isDelete():
        return this.isForwardDelete() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
      case this.isHorizontalArrow():
        return this.isRightArrow() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
    }
  }

  /**
   * If the shift key is depressed.
   * For example, while holding down meta+shift, pressing the "v"
   * key would result in an event whose `Key` had `isShift()` with a truthy value,
   * because the shift key is down when pressing the "v".
   * @see {isShiftKey} which checks if the key is actually the shift key itself.
   * @return {bool}
   */
  isShift() {
    return this.shiftKey;
  }

  hasModifier(modifier) {
    return modifier & this.modifierMask;
  }

  hasAnyModifier() {
    return !!this.modifierMask;
  }

  get ctrlKey() {
    return MODIFIERS.CTRL & this.modifierMask;
  }

  get metaKey() {
    return MODIFIERS.META & this.modifierMask;
  }

  get shiftKey() {
    return MODIFIERS.SHIFT & this.modifierMask;
  }

  get altKey() {
    return MODIFIERS.ALT & this.modifierMask;
  }

  isPrintableKey() {
    return !(
      this.isArrow() ||
      this.isHome() || this.isEnd() ||
      this.isPageUp() || this.isPageDown() ||
      this.isInsert() || this.isClear() || this.isPause() ||
      this.isEscape()
    );
  }

  isNumberKey() {
    if (this.isKeySupported()) {
      return this.key >= '0' && this.key <= '9';
    } else {
      const code = this.keyCode;
      return (code >= Keycodes['0'] && code <= Keycodes['9']) ||
        (code >= Keycodes.NUMPAD_0 && code <= Keycodes.NUMPAD_9); // numpad keys
    }
  }

  isLetterKey() {
    if (this.isKeySupported()) {
      const key = this.key;
      return (key >= 'a' && key <= 'z') ||
        (key >= 'A' && key <= 'Z');
    } else {
      const code = this.keyCode;
      return (code >= Keycodes.A && code <= Keycodes.Z) ||
        (code >= Keycodes.a && code <= Keycodes.z);
    }
  }

  isPunctuation() {
    if (this.isKeySupported()) {
      const key = this.key;
      return (key >= ';' && key <= '`') ||
        (key >= '[' && key <= '"');
    } else {
      const code = this.keyCode;
      return (code >= Keycodes[';'] && code <= Keycodes['`']) ||
      (code >= Keycodes['['] && code <= Keycodes['"']);
    }
  }

  /**
   * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Printable_keys_in_standard_position
   *   and http://stackoverflow.com/a/12467610/137784
   */
  isPrintable() {
    if (this.ctrlKey || this.metaKey) {
      return false;
    }

    // Firefox calls keypress events for some keys that should not be printable
    if (!this.isPrintableKey()) {
      return false;
    }

    return (
      this.keyCode !== 0 ||
      this.toString().length > 0 ||
      this.isNumberKey() ||
      this.isSpace() ||
      this.isTab()   ||
      this.isEnter() ||
      this.isLetterKey() ||
      this.isPunctuation() ||
      this.isIME()
    );
  }
};

export default Key;

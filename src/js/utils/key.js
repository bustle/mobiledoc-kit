import Keycodes from './keycodes';
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

export const SPECIAL_KEYS = {
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

// heuristic for determining if `event` is a key event
function isKeyEvent(event) {
  return !!event.charCode ||
    !!event.keyCode ||
    !!event.metaKey ||
    !!event.shiftKey ||
    !!event.ctrlKey;
}

/**
 * An abstraction around a KeyEvent
 * that key listeners in the editor can use
 * to determine what sort of key was pressed
 */
const Key = class Key {
  constructor(event) {
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
    return String.fromCharCode(this.charCode);
  }

  isEscape() {
    return this.keyCode === Keycodes.ESC;
  }

  isDelete() {
    return this.keyCode === Keycodes.BACKSPACE ||
           this.keyCode === Keycodes.DELETE;
  }

  isForwardDelete() {
    return this.keyCode === Keycodes.DELETE;
  }

  isArrow() {
    return this.isHorizontalArrow() || this.isVerticalArrow();
  }

  isHorizontalArrow() {
    return this.keyCode === Keycodes.LEFT ||
      this.keyCode === Keycodes.RIGHT;
  }

  isVerticalArrow() {
    return this.keyCode === Keycodes.UP ||
      this.keyCode === Keycodes.DOWN;
  }

  isLeftArrow() {
    return this.keyCode === Keycodes.LEFT;
  }

  isRightArrow() {
    return this.keyCode === Keycodes.RIGHT;
  }

  get direction() {
    switch (true) {
      case this.isDelete():
        return this.isForwardDelete() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
      case this.isHorizontalArrow():
        return this.isRightArrow() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
    }
  }

  isSpace() {
    return this.keyCode === Keycodes.SPACE;
  }

  isTab() {
    return this.keyCode === Keycodes.TAB;
  }

  isEnter() {
    return this.keyCode === Keycodes.ENTER;
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

  /*
   * If the key is the actual shift key. This is false when the shift key
   * is held down and the source `event` is not the shift key.
   * @see {isShift}
   * @return {bool}
   */
  isShiftKey() {
    return this.keyCode === Keycodes.SHIFT;
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

  isChar(string) {
    return this.keyCode === string.toUpperCase().charCodeAt(0);
  }

  /**
   * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#Printable_keys_in_standard_position
   *   and http://stackoverflow.com/a/12467610/137784
   */
  isPrintable() {
    if (this.ctrlKey || this.metaKey) {
      return false;
    }

    if (this.toString().length) {
      return true;
    }

    const {keyCode:code} = this;

    return (
      (code >= Keycodes['0'] && code <= Keycodes['9']) ||         // number keys
      this.isSpace() ||
      this.isTab()   ||
      this.isEnter() ||
      (
        (code >= Keycodes.A && code <= Keycodes.Z) ||               // letter keys
        (code >= Keycodes.a && code <= Keycodes.z)
      ) ||
      (code >= Keycodes.NUMPAD_0 && code <= Keycodes.NUMPAD_9) || // numpad keys
      (code >= Keycodes[';'] && code <= Keycodes['`']) ||         // punctuation
      (code >= Keycodes['['] && code <= Keycodes['"']) ||
      // FIXME the IME action seems to get lost when we issue an `editor.deleteSelection`
      // before it (in Chrome)
      code === Keycodes.IME
    );
  }
};

export default Key;

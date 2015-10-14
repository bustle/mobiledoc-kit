import Keycodes from './keycodes';
export const DIRECTION = {
  FORWARD: 1,
  BACKWARD: -1
};

export const MODIFIERS = {
  META: 1, // also called "command" on OS X
  CTRL: 2,
  SHIFT: 3
};

export const SPECIAL_KEYS = {
  BACKSPACE: 8,
  TAB:       9,
  ENTER:     13,
  ESC:       27,
  SPACE:     32,
  PAGEUP:    33,
  PAGEDOWN:  34,
  END:       35,
  HOME:      36,
  LEFT:      37,
  UP:        38,
  RIGHT:     39,
  DOWN:      40,
  INS:       45,
  DEL:       46
};

/**
 * An abstraction around a KeyEvent
 * that key listeners in the editor can use
 * to determine what sort of key was pressed
 */
const Key = class Key {
  constructor(event) {
    this.keyCode = event.keyCode;
    this.event = event;
  }

  static fromEvent(event) {
    return new Key(event);
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

  get direction() {
    return this.isForwardDelete() ? DIRECTION.FORWARD : DIRECTION.BACKWARD;
  }

  isSpace() {
    return this.keyCode === Keycodes.SPACE;
  }

  isEnter() {
    return this.keyCode === Keycodes.ENTER;
  }

  isShift() {
    return this.shiftKey;
  }

  hasModifier(modifier) {
    switch (modifier) {
      case MODIFIERS.META:
        return this.metaKey;
      case MODIFIERS.CTRL:
        return this.ctrlKey;
      case MODIFIERS.SHIFT:
        return this.shiftKey;
      default:
        throw new Error(`Cannot check for unknown modifier ${modifier}`);
    }
  }

  hasAnyModifier() {
    return this.metaKey || this.ctrlKey || this.shiftKey;
  }

  get ctrlKey() {
    return this.event.ctrlKey;
  }

  get metaKey() {
    return this.event.metaKey;
  }

  get shiftKey() {
    return this.event.shiftKey;
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

    const {keyCode:code} = this;

    return (
      (code >= Keycodes['0'] && code <= Keycodes['9']) ||         // number keys
      this.isSpace() ||
      this.isEnter() ||
      (code >= Keycodes.A && code <= Keycodes.Z) ||               // letter keys
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

'use strict';

exports['default'] = {
  BACKSPACE: 8,
  SPACE: 32,
  ENTER: 13,
  SHIFT: 16,
  ESC: 27,
  DELETE: 46,
  '0': 48,
  '9': 57,
  A: 65,
  Z: 90,
  a: 97,
  z: 122,
  'NUMPAD_0': 186,
  'NUMPAD_9': 111,
  ';': 186,
  '.': 190,
  '`': 192,
  '[': 219,
  '"': 222,

  // Input Method Editor uses multiple keystrokes to display characters.
  // Example on mac: press option-i then i. This fires 2 key events in Chrome
  // with keyCode 229 and displays ˆ and then î.
  // See http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html#fixed-virtual-key-codes
  IME: 229,

  TAB: 9,
  CLEAR: 12,
  PAUSE: 19,
  PAGEUP: 33,
  PAGEDOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  INS: 45,
  META: 91,
  ALT: 18,
  CTRL: 17
};
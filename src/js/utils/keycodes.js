export default {
  BACKSPACE  : 8,
  SPACE: 32,
  ENTER : 13,
  ESC   : 27,
  DELETE   : 46,
  '0': 48,
  '9': 57,
  A: 65,
  Z: 90,
  'NUMPAD_0': 186,
  'NUMPAD_9': 111,
  ';': 186,
  '`': 192,
  '[': 219,
  '"': 222,

  // Input Method Editor uses multiple keystrokes to display characters.
  // Example on mac: press option-i then i. This fires 2 key events in Chrome 
  // with keyCode 229 and displays ˆ and then î.
  // See http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html#fixed-virtual-key-codes
  IME: 229
};

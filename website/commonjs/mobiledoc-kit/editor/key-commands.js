'use strict';

exports.buildKeyCommand = buildKeyCommand;
exports.validateKeyCommand = validateKeyCommand;
exports.findKeyCommands = findKeyCommands;

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var _utilsKey = require('../utils/key');

var _utilsArrayUtils = require('../utils/array-utils');

var _utilsAssert = require('../utils/assert');

var _utilsBrowser = require('../utils/browser');

var _ui = require('./ui');

function selectAll(editor) {
  var post = editor.post;

  editor.selectRange(post.toRange());
}

function gotoStartOfLine(editor) {
  var range = editor.range;
  var section = range.tail.section;

  editor.run(function (postEditor) {
    postEditor.setRange(section.headPosition());
  });
}

function gotoEndOfLine(editor) {
  var range = editor.range;
  var section = range.tail.section;

  editor.run(function (postEditor) {
    postEditor.setRange(section.tailPosition());
  });
}

function deleteToEndOfSection(editor) {
  var range = editor.range;

  if (range.isCollapsed) {
    var _range = range;
    var head = _range.head;
    var section = _range.head.section;

    range = head.toRange(section.tailPosition());
  }
  editor.run(function (postEditor) {
    var nextPosition = postEditor.deleteRange(range);
    postEditor.setRange(nextPosition);
  });
}

var DEFAULT_KEY_COMMANDS = [{
  str: 'META+B',
  run: function run(editor) {
    editor.toggleMarkup('strong');
  }
}, {
  str: 'CTRL+B',
  run: function run(editor) {
    editor.toggleMarkup('strong');
  }
}, {
  str: 'META+I',
  run: function run(editor) {
    editor.toggleMarkup('em');
  }
}, {
  str: 'CTRL+I',
  run: function run(editor) {
    editor.toggleMarkup('em');
  }
}, {
  str: 'META+U',
  run: function run(editor) {
    editor.toggleMarkup('u');
  }
}, {
  str: 'CTRL+U',
  run: function run(editor) {
    editor.toggleMarkup('u');
  }
}, {
  str: 'CTRL+K',
  run: function run(editor) {
    if (_utilsBrowser['default'].isMac()) {
      return deleteToEndOfSection(editor);
    } else if (_utilsBrowser['default'].isWin()) {
      return (0, _ui.toggleLink)(editor);
    }
  }
}, {
  str: 'CTRL+A',
  run: function run(editor) {
    if (_utilsBrowser['default'].isMac()) {
      gotoStartOfLine(editor);
    } else {
      selectAll(editor);
    }
  }
}, {
  str: 'META+A',
  run: function run(editor) {
    if (_utilsBrowser['default'].isMac()) {
      selectAll(editor);
    }
  }
}, {
  str: 'CTRL+E',
  run: function run(editor) {
    if (_utilsBrowser['default'].isMac()) {
      gotoEndOfLine(editor);
    }
  }
}, {
  str: 'META+K',
  run: function run(editor) {
    return (0, _ui.toggleLink)(editor);
  }

}, {
  str: 'META+Z',
  run: function run(editor) {
    editor.run(function (postEditor) {
      postEditor.undoLastChange();
    });
  }
}, {
  str: 'META+SHIFT+Z',
  run: function run(editor) {
    editor.run(function (postEditor) {
      postEditor.redoLastChange();
    });
  }
}, {
  str: 'CTRL+Z',
  run: function run(editor) {
    if (_utilsBrowser['default'].isMac()) {
      return false;
    }
    editor.run(function (postEditor) {
      return postEditor.undoLastChange();
    });
  }
}, {
  str: 'CTRL+SHIFT+Z',
  run: function run(editor) {
    if (_utilsBrowser['default'].isMac()) {
      return false;
    }
    editor.run(function (postEditor) {
      return postEditor.redoLastChange();
    });
  }
}];

exports.DEFAULT_KEY_COMMANDS = DEFAULT_KEY_COMMANDS;
function modifierNamesToMask(modiferNames) {
  var defaultVal = 0;
  return (0, _utilsArrayUtils.reduce)(modiferNames, function (sum, name) {
    var modifier = _utilsKey.MODIFIERS[name.toUpperCase()];
    (0, _utilsAssert['default'])('No modifier named "' + name + '" found', !!modifier);
    return sum + modifier;
  }, defaultVal);
}

function characterToCode(character) {
  var upperCharacter = character.toUpperCase();
  var special = (0, _utilsKey.specialCharacterToCode)(upperCharacter);
  if (special) {
    return special;
  } else {
    (0, _utilsAssert['default'])('Only 1 character can be used in a key command str (got "' + character + '")', character.length === 1);
    return upperCharacter.charCodeAt(0);
  }
}

function buildKeyCommand(keyCommand) {
  var str = keyCommand.str;

  if (!str) {
    return keyCommand;
  }
  (0, _utilsAssert['default'])('[deprecation] Key commands no longer use the `modifier` property', !keyCommand.modifier);

  var _str$split$reverse = str.split('+').reverse();

  var _str$split$reverse2 = _toArray(_str$split$reverse);

  var character = _str$split$reverse2[0];

  var modifierNames = _str$split$reverse2.slice(1);

  keyCommand.modifierMask = modifierNamesToMask(modifierNames);
  keyCommand.code = characterToCode(character);

  return keyCommand;
}

function validateKeyCommand(keyCommand) {
  return !!keyCommand.code && !!keyCommand.run;
}

function findKeyCommands(keyCommands, keyEvent) {
  var key = _utilsKey['default'].fromEvent(keyEvent);

  return (0, _utilsArrayUtils.filter)(keyCommands, function (_ref) {
    var modifierMask = _ref.modifierMask;
    var code = _ref.code;

    return key.keyCode === code && key.modifierMask === modifierMask;
  });
}
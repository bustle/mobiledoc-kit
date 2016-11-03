'use strict';

exports.registerGlobal = registerGlobal;

var _editorEditor = require('./editor/editor');

var _editorUi = require('./editor/ui');

var UI = _editorUi;

var _cardsImage = require('./cards/image');

var _utilsCursorRange = require('./utils/cursor/range');

var _utilsCursorPosition = require('./utils/cursor/position');

var _utilsMobiledocError = require('./utils/mobiledoc-error');

var _version = require('./version');

var Mobiledoc = {
  Editor: _editorEditor['default'],
  UI: UI,
  ImageCard: _cardsImage['default'],
  Range: _utilsCursorRange['default'],
  Position: _utilsCursorPosition['default'],
  Error: _utilsMobiledocError['default'],
  VERSION: _version['default']
};

function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

exports.Editor = _editorEditor['default'];
exports.UI = UI;
exports.Range = _utilsCursorRange['default'];
exports.Position = _utilsCursorPosition['default'];
exports['default'] = Mobiledoc;
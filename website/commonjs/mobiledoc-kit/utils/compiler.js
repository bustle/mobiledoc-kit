'use strict';

exports.visit = visit;
exports.compile = compile;
exports.visitArray = visitArray;

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var _arrayUtils = require('./array-utils');

var _assert = require('./assert');

function visit(visitor, node, opcodes) {
  var method = node.type;
  (0, _assert['default'])('Cannot visit unknown type ' + method, !!visitor[method]);
  visitor[method](node, opcodes);
}

function compile(compiler, opcodes) {
  for (var i = 0, l = opcodes.length; i < l; i++) {
    var _opcodes$i = _toArray(opcodes[i]);

    var method = _opcodes$i[0];

    var params = _opcodes$i.slice(1);

    var _length = params.length;
    if (_length === 0) {
      compiler[method].call(compiler);
    } else if (_length === 1) {
      compiler[method].call(compiler, params[0]);
    } else if (_length === 2) {
      compiler[method].call(compiler, params[0], params[1]);
    } else {
      compiler[method].apply(compiler, params);
    }
  }
}

function visitArray(visitor, nodes, opcodes) {
  if (!nodes || nodes.length === 0) {
    return;
  }
  (0, _arrayUtils.forEach)(nodes, function (node) {
    visit(visitor, node, opcodes);
  });
}
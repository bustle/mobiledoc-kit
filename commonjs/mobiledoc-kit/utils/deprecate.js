/**
 * Usage:
 * Without a conditional, always prints deprecate message:
 *   `deprecate('This is deprecated')`
 *
 * Conditional deprecation, works similarly to `assert`, prints deprecation if
 * conditional is false:
 *   `deprecate('Deprecated only if foo !== bar', foo === bar)`
 */
"use strict";

exports["default"] = deprecate;

function deprecate(message) {
  var conditional = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  if (!conditional) {
    console.log("[mobiledoc-kit] [DEPRECATED]: " + message); // jshint ignore:line
  }
}
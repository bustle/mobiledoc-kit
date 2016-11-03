/*
 * @param {String} string
 * @return {String} a dasherized string. 'modelIndex' -> 'model-index', etc
 */
'use strict';

exports.dasherize = dasherize;
exports.capitalize = capitalize;
exports.startsWith = startsWith;
exports.endsWith = endsWith;

function dasherize(string) {
  return string.replace(/[A-Z]/g, function (match, offset) {
    var lower = match.toLowerCase();

    return offset === 0 ? lower : '-' + lower;
  });
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function startsWith(string, character) {
  return string.charAt(0) === character;
}

function endsWith(string, endString) {
  var index = string.lastIndexOf(endString);
  return index !== -1 && index === string.length - endString.length;
}
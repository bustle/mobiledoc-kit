/* global JSON */
'use strict';

exports.getContentFromPasteEvent = getContentFromPasteEvent;
exports.setClipboardData = setClipboardData;
exports.parsePostFromPaste = parsePostFromPaste;
exports.parsePostFromDrop = parsePostFromDrop;

var _parsersMobiledoc = require('../parsers/mobiledoc');

var _parsersHtml = require('../parsers/html');

var _parsersText = require('../parsers/text');

var MIME_TEXT_PLAIN = 'text/plain';
exports.MIME_TEXT_PLAIN = MIME_TEXT_PLAIN;
var MIME_TEXT_HTML = 'text/html';
exports.MIME_TEXT_HTML = MIME_TEXT_HTML;
var NONSTANDARD_IE_TEXT_TYPE = 'Text';

exports.NONSTANDARD_IE_TEXT_TYPE = NONSTANDARD_IE_TEXT_TYPE;
var MOBILEDOC_REGEX = new RegExp(/data\-mobiledoc='(.*?)'>/);

/**
 * @return {Post}
 * @private
 */
function parsePostFromHTML(html, builder, plugins) {
  var post = undefined;

  if (MOBILEDOC_REGEX.test(html)) {
    var mobiledocString = html.match(MOBILEDOC_REGEX)[1];
    var mobiledoc = JSON.parse(mobiledocString);
    post = _parsersMobiledoc['default'].parse(builder, mobiledoc);
  } else {
    post = new _parsersHtml['default'](builder, { plugins: plugins }).parse(html);
  }

  return post;
}

/**
 * @return {Post}
 * @private
 */
function parsePostFromText(text, builder, plugins) {
  var parser = new _parsersText['default'](builder, { plugins: plugins });
  var post = parser.parse(text);
  return post;
}

/**
 * @return {{html: String, text: String}}
 * @private
 */

function getContentFromPasteEvent(event, window) {
  var html = '',
      text = '';

  var clipboardData = event.clipboardData;

  if (clipboardData && clipboardData.getData) {
    html = clipboardData.getData(MIME_TEXT_HTML);
    text = clipboardData.getData(MIME_TEXT_PLAIN);
  } else if (window.clipboardData && window.clipboardData.getData) {
    // IE
    // The Internet Explorers (including Edge) have a non-standard way of interacting with the
    // Clipboard API (see http://caniuse.com/#feat=clipboard). In short, they expose a global window.clipboardData
    // object instead of the per-event event.clipboardData object on the other browsers.
    html = window.clipboardData.getData(NONSTANDARD_IE_TEXT_TYPE);
  }

  return { html: html, text: text };
}

/**
 * @return {{html: String, text: String}}
 * @private
 */
function getContentFromDropEvent(event, logger) {
  var html = '',
      text = '';

  try {
    html = event.dataTransfer.getData(MIME_TEXT_HTML);
    text = event.dataTransfer.getData(MIME_TEXT_PLAIN);
  } catch (e) {
    // FIXME IE11 does not include any data in the 'text/html' or 'text/plain'
    // mimetypes. It throws an error 'Invalid argument' when attempting to read
    // these properties.
    if (logger) {
      logger.log('Error getting drop data: ', e);
    }
  }

  return { html: html, text: text };
}

/**
 * @param {CopyEvent|CutEvent}
 * @param {Editor}
 * @param {Window}
 * @private
 */

function setClipboardData(event, _ref, window) {
  var mobiledoc = _ref.mobiledoc;
  var html = _ref.html;
  var text = _ref.text;

  if (mobiledoc && html) {
    html = '<div data-mobiledoc=\'' + JSON.stringify(mobiledoc) + '\'>' + html + '</div>';
  }

  var clipboardData = event.clipboardData;
  var nonstandardClipboardData = window.clipboardData;

  if (clipboardData && clipboardData.setData) {
    clipboardData.setData(MIME_TEXT_HTML, html);
    clipboardData.setData(MIME_TEXT_PLAIN, text);
  } else if (nonstandardClipboardData && nonstandardClipboardData.setData) {
    // The Internet Explorers (including Edge) have a non-standard way of interacting with the
    // Clipboard API (see http://caniuse.com/#feat=clipboard). In short, they expose a global window.clipboardData
    // object instead of the per-event event.clipboardData object on the other browsers.
    nonstandardClipboardData.setData(NONSTANDARD_IE_TEXT_TYPE, html);
  }
}

/**
 * @param {PasteEvent}
 * @param {{builder: Builder, _parserPlugins: Array}} options
 * @return {Post}
 * @private
 */

function parsePostFromPaste(pasteEvent, _ref2) {
  var builder = _ref2.builder;
  var plugins = _ref2._parserPlugins;

  var _ref3 = arguments.length <= 2 || arguments[2] === undefined ? { targetFormat: 'html' } : arguments[2];

  var targetFormat = _ref3.targetFormat;

  var _getContentFromPasteEvent = getContentFromPasteEvent(pasteEvent, window);

  var html = _getContentFromPasteEvent.html;
  var text = _getContentFromPasteEvent.text;

  if (targetFormat === 'html' && html && html.length) {
    return parsePostFromHTML(html, builder, plugins);
  } else if (text && text.length) {
    return parsePostFromText(text, builder, plugins);
  }
}

/**
 * @param {DropEvent}
 * @param {Editor} editor
 * @param {Object} [options={}] Can pass a logger
 * @return {Post}
 * @private
 */

function parsePostFromDrop(dropEvent, editor) {
  var _ref4 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var logger = _ref4.logger;
  var builder = editor.builder;
  var plugins = editor._parserPlugins;

  var _getContentFromDropEvent = getContentFromDropEvent(dropEvent, logger);

  var html = _getContentFromDropEvent.html;
  var text = _getContentFromDropEvent.text;

  if (html && html.length) {
    return parsePostFromHTML(html, builder, plugins);
  } else if (text && text.length) {
    return parsePostFromText(text, builder, plugins);
  }
}
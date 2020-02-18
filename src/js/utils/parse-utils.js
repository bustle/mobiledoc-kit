/* global JSON */
import mobiledocParsers from '../parsers/mobiledoc';
import HTMLParser from '../parsers/html';
import TextParser from '../parsers/text';

export const MIME_TEXT_PLAIN = 'text/plain';
export const MIME_TEXT_HTML = 'text/html';
export const NONSTANDARD_IE_TEXT_TYPE = 'Text';

const MOBILEDOC_REGEX = new RegExp(/data\-mobiledoc='(.*?)'>/);

/**
 * @return {Post}
 * @private
 */
function parsePostFromHTML(html, builder, plugins) {
  let post;

  if (MOBILEDOC_REGEX.test(html)) {
    let mobiledocString = html.match(MOBILEDOC_REGEX)[1];
    let mobiledoc = JSON.parse(mobiledocString);
    post = mobiledocParsers.parse(builder, mobiledoc);
  } else {
    post = new HTMLParser(builder, {plugins}).parse(html);
  }

  return post;
}

/**
 * @return {Post}
 * @private
 */
function parsePostFromText(text, builder, plugins) {
  let parser = new TextParser(builder, {plugins});
  let post = parser.parse(text);
  return post;
}

/**
 * @return {{html: String, text: String}}
 * @private
 */
export function getContentFromPasteEvent(event, window) {
  let html = '', text = '';

  let { clipboardData } = event;

  if (clipboardData && clipboardData.getData) {
    html = clipboardData.getData(MIME_TEXT_HTML);
    text = clipboardData.getData(MIME_TEXT_PLAIN);
  } else if (window.clipboardData && window.clipboardData.getData) { // IE
    // The Internet Explorers (including Edge) have a non-standard way of interacting with the
    // Clipboard API (see http://caniuse.com/#feat=clipboard). In short, they expose a global window.clipboardData
    // object instead of the per-event event.clipboardData object on the other browsers.
    html = window.clipboardData.getData(NONSTANDARD_IE_TEXT_TYPE);
  }

  return { html, text };
}

/**
 * @return {{html: String, text: String}}
 * @private
 */
function getContentFromDropEvent(event, logger) {
  let html = '', text = '';

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

  return { html, text };
}

/**
 * @param {CopyEvent|CutEvent}
 * @param {Editor}
 * @param {Window}
 * @private
 */
export function setClipboardData(event, {mobiledoc, html, text}, window) {
  if (mobiledoc && html) {
    html = `<div data-mobiledoc='${JSON.stringify(mobiledoc)}'>${html}</div>`;
  }

  let { clipboardData } = event;
  let { clipboardData: nonstandardClipboardData } = window;

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
export function parsePostFromPaste(pasteEvent, {builder, _parserPlugins: plugins}, {targetFormat}={targetFormat:'html'}) {
  let { html, text } = getContentFromPasteEvent(pasteEvent, window);

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
export function parsePostFromDrop(dropEvent, editor, {logger}={}) {
  let { builder, _parserPlugins: plugins } = editor;
  let { html, text } = getContentFromDropEvent(dropEvent, logger);

  if (html && html.length) {
    return parsePostFromHTML(html, builder, plugins);
  } else if (text && text.length) {
    return parsePostFromText(text, builder, plugins);
  }
}

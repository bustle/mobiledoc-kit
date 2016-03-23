/* global JSON */
import mobiledocParsers from '../parsers/mobiledoc';
import HTMLParser from '../parsers/html';
import TextParser from '../parsers/text';
import HTMLRenderer from 'mobiledoc-html-renderer';
import TextRenderer from 'mobiledoc-text-renderer';
import Logger from 'mobiledoc-kit/utils/logger';

export const MIME_TEXT_PLAIN = 'text/plain';
export const MIME_TEXT_HTML = 'text/html';
export const NONSTANDARD_IE_TEXT_TYPE = 'Text';

const log = Logger.for('parse-utils');
const MOBILEDOC_REGEX = new RegExp(/data\-mobiledoc='(.*?)'>/);

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

function parsePostFromText(text, builder, plugins) {
  let parser = new TextParser(builder, {plugins});
  let post = parser.parse(text);
  return post;
}

// Sets the clipboard data in a cross-browser way.
function setClipboardData(clipboardData, html, plain) {
  if (clipboardData && clipboardData.setData) {
    clipboardData.setData(MIME_TEXT_HTML, html);
    clipboardData.setData(MIME_TEXT_PLAIN, plain);
  } else if (window.clipboardData && window.clipboardData.setData) { // IE
    // The Internet Explorers (including Edge) have a non-standard way of interacting with the
    // Clipboard API (see http://caniuse.com/#feat=clipboard). In short, they expose a global window.clipboardData
    // object instead of the per-event event.clipboardData object on the other browsers.
    window.clipboardData.setData(NONSTANDARD_IE_TEXT_TYPE, html);
  }
}

// Gets the clipboard data in a cross-browser way.
function getClipboardData(clipboardData) {
  let html;
  let text;

  if (clipboardData && clipboardData.getData) {
    html = clipboardData.getData(MIME_TEXT_HTML);

    if (!html || html.length === 0) { // Fallback to 'text/plain'
      text = clipboardData.getData(MIME_TEXT_PLAIN);
    }
  } else if (window.clipboardData && window.clipboardData.getData) { // IE
    // The Internet Explorers (including Edge) have a non-standard way of interacting with the
    // Clipboard API (see http://caniuse.com/#feat=clipboard). In short, they expose a global window.clipboardData
    // object instead of the per-event event.clipboardData object on the other browsers.
    html = window.clipboardData.getData(NONSTANDARD_IE_TEXT_TYPE);
  }

  return { html, text };
}

/**
 * @param {Event} copyEvent
 * @param {Editor}
 * @return null
 */
export function setClipboardCopyData(copyEvent, editor) {
  const { range, post } = editor;

  const mobiledoc = post.cloneRange(range);

  const unknownCardHandler = () => {}; // ignore unknown cards
  const unknownAtomHandler = () => {}; // ignore unknown atoms
  const {result: innerHTML} =
    new HTMLRenderer({unknownCardHandler, unknownAtomHandler}).render(mobiledoc);

  const html =
    `<div data-mobiledoc='${JSON.stringify(mobiledoc)}'>${innerHTML}</div>`;
  const {result: plain} =
    new TextRenderer({unknownCardHandler, unknownAtomHandler}).render(mobiledoc);

  setClipboardData(copyEvent.clipboardData, html, plain);
}

/**
 * @param {Event} pasteEvent
 * @param {PostNodeBuilder} builder
 * @param {Array} plugins parser plugins
 * @return {Post}
 */
export function parsePostFromPaste(pasteEvent, {builder, _parserPlugins: plugins}) {
  let post;

  const { html, text } = getClipboardData(pasteEvent.clipboardData);
  if (html && html.length > 0) {
    post = parsePostFromHTML(html, builder, plugins);
  } else if (text && text.length > 0) {
    post = parsePostFromText(text, builder, plugins);
  }

  return post;
}

export function parsePostFromDrop(dropEvent, {builder, _parserPlugins: plugins}) {
  let post;

  let html, text;
  try {
    html = dropEvent.dataTransfer.getData('text/html');
    text = dropEvent.dataTransfer.getData('text/plain');
  } catch (e) {
    // FIXME IE11 does not include any data in the 'text/html' or 'text/plain'
    // mimetypes. It throws an error 'Invalid argument' when attempting to read
    // these properties.
    log('Error getting drop data: ', e);
    return;
  }

  if (html && html.length > 0) {
    post = parsePostFromHTML(html, builder, plugins);
  } else if (text && text.length > 0) {
    post = parsePostFromText(text, builder, plugins);
  }

  return post;
}

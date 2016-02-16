/* global JSON */
import mobiledocParsers from '../parsers/mobiledoc';
import HTMLParser from '../parsers/html';
import TextParser from '../parsers/text';
import HTMLRenderer from 'mobiledoc-html-renderer';
import TextRenderer from 'mobiledoc-text-renderer';

const MOBILEDOC_REGEX = new RegExp(/data\-mobiledoc='(.*?)'>/);
export const MIME_TEXT_PLAIN = 'text/plain';
export const MIME_TEXT_HTML = 'text/html';

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

/**
 * @param {Event} copyEvent
 * @param {Editor}
 * @return null
 */
export function setClipboardCopyData(copyEvent, editor) {
  let { range, post } = editor;
  let { clipboardData } = copyEvent;

  let mobiledoc = post.cloneRange(range);

  let unknownCardHandler = () => {}; // ignore unknown cards
  let unknownAtomHandler = () => {}; // ignore unknown atoms
  let {result: innerHTML} =
    new HTMLRenderer({unknownCardHandler, unknownAtomHandler}).render(mobiledoc);

  const html =
    `<div data-mobiledoc='${JSON.stringify(mobiledoc)}'>${innerHTML}</div>`;
  const {result: plain} =
    new TextRenderer({unknownCardHandler, unknownAtomHandler}).render(mobiledoc);

  if (clipboardData && clipboardData.setData) {
    clipboardData.setData(MIME_TEXT_PLAIN, plain);
    clipboardData.setData(MIME_TEXT_HTML, html);
  } else if (window.clipboardData && window.clipboardData.setData) { // IE
    window.clipboardData.setData('Text', html);
  }
}

/**
 * @param {Event} pasteEvent
 * @param {PostNodeBuilder} builder
 * @param {Array} plugins parser plugins
 * @return {Post}
 */
export function parsePostFromPaste(pasteEvent, builder, plugins=[]) {
  let post;
  let html;
  let text;

  if (pasteEvent.clipboardData && pasteEvent.clipboardData.getData) {
    html = pasteEvent.clipboardData.getData(MIME_TEXT_HTML);

    if (!html || html.length === 0) { // Fallback to 'text/plain'
      text = pasteEvent.clipboardData.getData(MIME_TEXT_PLAIN);
    }
  } else if (window.clipboardData && window.clipboardData.getData) { // IE
    html = window.clipboardData.getData('Text');
  }

  if (html && html.length > 0) {
    post = parsePostFromHTML(html, builder, plugins);
  } else if (text && text.length > 0) {
    post = parsePostFromText(text, builder, plugins);
  }

  return post;
}

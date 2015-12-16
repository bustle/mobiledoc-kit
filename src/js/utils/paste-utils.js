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
  const { cursor, post } = editor;
  const { clipboardData } = copyEvent;

  const range = cursor.offsets;
  const mobiledoc = post.cloneRange(range);

  let unknownCardHandler = () => {}; // ignore unknown cards
  let {result: innerHTML } =
    new HTMLRenderer({unknownCardHandler}).render(mobiledoc);

  const html =
    `<div data-mobiledoc='${JSON.stringify(mobiledoc)}'>${innerHTML}</div>`;
  const {result: plain} =
    new TextRenderer({unknownCardHandler}).render(mobiledoc);

  clipboardData.setData(MIME_TEXT_PLAIN, plain);
  clipboardData.setData(MIME_TEXT_HTML, html);
}

/**
 * @param {Event} pasteEvent
 * @param {PostNodeBuilder} builder
 * @param {Array} plugins parser plugins
 * @return {Post}
 */
export function parsePostFromPaste(pasteEvent, builder, plugins=[]) {
  let post;
  let html = pasteEvent.clipboardData.getData(MIME_TEXT_HTML);

  if (!html || html.length === 0) { // Fallback to 'text/plain'
    let text = pasteEvent.clipboardData.getData(MIME_TEXT_PLAIN);
    post = parsePostFromText(text, builder, plugins);
  } else {
    post = parsePostFromHTML(html, builder, plugins);
  }

  return post;
}

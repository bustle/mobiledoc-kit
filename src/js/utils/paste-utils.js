/* global JSON */
import mobiledocParsers from '../parsers/mobiledoc';
import HTMLParser from '../parsers/html';
import HTMLRenderer from 'mobiledoc-html-renderer';
import TextRenderer from 'mobiledoc-text-renderer';

export function setClipboardCopyData(copyEvent, editor) {
  const { cursor, post } = editor;
  const { clipboardData } = copyEvent;

  const range = cursor.offsets;
  const mobiledoc = post.cloneRange(range);

  let cards = editor.cards;
  let innerHTML = new HTMLRenderer().render(mobiledoc, cards);

  const html =
    `<div data-mobiledoc='${JSON.stringify(mobiledoc)}'>${innerHTML}</div>`;
  const plain = new TextRenderer().render(mobiledoc, cards);

  clipboardData.setData('text/plain', plain);
  clipboardData.setData('text/html', html);
}

export function parsePostFromPaste(pasteEvent, builder, cardParsers=[]) {
  let mobiledoc, post;
  const mobiledocRegex = new RegExp(/data\-mobiledoc='(.*?)'>/);

  let html = pasteEvent.clipboardData.getData('text/html');

  if (mobiledocRegex.test(html)) {
    let mobiledocString = html.match(mobiledocRegex)[1];
    mobiledoc = JSON.parse(mobiledocString);
    post = mobiledocParsers.parse(builder, mobiledoc);
  } else {
    post = new HTMLParser(builder, {cardParsers}).parse(html);
  }

  return post;
}

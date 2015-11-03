/* global JSON */
import MobiledocParser from '../parsers/mobiledoc';
import HTMLParser from '../parsers/html';
import { createDiv } from '../utils/element-utils';
import { getSelectionContents } from '../utils/selection-utils';

export function setClipboardCopyData(copyEvent, editor) {
  const { cursor, post } = editor;
  const { clipboardData } = copyEvent;

  const range = cursor.offsets;
  const mobiledoc = post.cloneRange(range);
  const fragment = getSelectionContents();
  const div = createDiv();
  div.appendChild(fragment);
  const html =
    `<div data-mobiledoc='${JSON.stringify(mobiledoc)}'>` +
      div.innerHTML +
    `</div>`;
  const plain = div.textContent;

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
    post = new MobiledocParser(builder).parse(mobiledoc);
  } else {
    post = new HTMLParser(builder, {cardParsers}).parse(html);
  }

  return post;
}

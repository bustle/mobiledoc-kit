/* global JSON */
import MobiledocParser from '../parsers/mobiledoc';
import HTMLParser from '../parsers/html';

// FIXME fix this issue:
const issueUrl = 'https://github.com/bustlelabs/content-kit-editor/issues/180';

export function setClipboardCopyData(copyEvent, editor) {
  const { cursor, post } = editor;
  const { clipboardData } = copyEvent;

  const range = cursor.offsets;
  const mobiledoc = post.cloneRange(range);
  const html =
    `<div data-mobiledoc='${JSON.stringify(mobiledoc)}'>` +
      `<a href='${issueUrl}'>Pasting from Content-Kit not yet supported.</a>` +
    `</div>`;
  const plain = `Pasting from Content-Kit not yet supported. (${issueUrl})`;

  clipboardData.setData('text/plain', plain);
  clipboardData.setData('text/html', html);
}

export function parsePostFromPaste(pasteEvent, builder) {
  let mobiledoc, post;
  const mobiledocRegex = new RegExp(/data\-mobiledoc='(.*?)'>/);

  let html = pasteEvent.clipboardData.getData('text/html');

  if (mobiledocRegex.test(html)) {
    let mobiledocString = html.match(mobiledocRegex)[1];
    mobiledoc = JSON.parse(mobiledocString);
    post = new MobiledocParser(builder).parse(mobiledoc);
  } else {
    post = new HTMLParser(builder).parse(html);
  }

  return post;
}

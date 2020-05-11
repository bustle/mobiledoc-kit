/**
 * @module UI
 */

import Position from '../utils/cursor/position';
import Range from '../utils/cursor/range';

let defaultShowPrompt = (message, defaultValue, callback) => callback(window.prompt(message, defaultValue));

/**
 * @callback promptCallback
 * @param {String} url The URL to pass back to the editor for linking
 *        to the selected text.
 */

/**
 * @callback showPrompt
 * @param {String} message The text of the prompt.
 * @param {String} defaultValue The initial URL to display in the prompt.
 * @param {module:UI~promptCallback} callback Once your handler has accepted a URL,
 *        it should pass it to `callback` so that the editor may link the
 *        selected text.
 */

/**
 * Exposes the core behavior for linking and unlinking text, and allows for
 * customization of the URL input handler.
 * @param {Editor} editor An editor instance to operate on. If a range is selected,
 *        either prompt for a URL and add a link or un-link the
 *        currently linked text.
 * @param {module:UI~showPrompt} [showPrompt] An optional custom input handler. Defaults
 *        to using `window.prompt`.
 * @example
 * let myPrompt = (message, defaultURL, promptCallback) => {
 *   let url = window.prompt("Overriding the defaults", "http://placekitten.com");
 *   promptCallback(url);
 * };
 *
 * editor.registerKeyCommand({
 *   str: "META+K",
 *   run(editor) {
 *     toggleLink(editor, myPrompt);
 *   }
 * });
 * @public
 */
export function toggleLink(editor, showPrompt=defaultShowPrompt) {
  if (editor.range.isCollapsed) {
    return;
  }

  let selectedText = editor.cursor.selectedText();
  let defaultUrl = '';
  if (selectedText.indexOf('http') !== -1) { defaultUrl = selectedText; }

  let {range} = editor;
  let hasLink = editor.detectMarkupInRange(range, 'a');

  if (hasLink) {
    editor.toggleMarkup('a');
  } else {
    showPrompt('Enter a URL', defaultUrl, url => {
      if (!url) { return; }

      editor.toggleMarkup('a', {href: url});
    });
  }
}

/**
 * Exposes the core behavior for editing an existing link, and allows for
 * customization of the URL input handler.
 * @param {HTMLAnchorElement} target The anchor (<a>) DOM element whose URL should be edited.
 * @param {Editor} editor An editor instance to operate on. If a range is selected,
 *        either prompt for a URL and add a link or un-link the
 *        currently linked text.
 * @param {module:UI~showPrompt} [showPrompt] An optional custom input handler. Defaults
 *        to using `window.prompt`.
 *
 * @public
 */
export function editLink(target, editor, showPrompt=defaultShowPrompt) {
  showPrompt('Enter a URL', target.href, url => {
    if (!url) { return; }

    const position = Position.fromNode(editor._renderTree, target.firstChild);
    const range = new Range(position, new Position(position.section, position.offset + target.textContent.length));

    editor.run(post => {
      let markup = editor.builder.createMarkup('a', {href: url});

      // This is the only way to "update" a markup with new attributes in the
      // current API.
      post.toggleMarkup(markup, range);
      post.toggleMarkup(markup, range);
    });
  });
}

export default {
  toggleLink,
  editLink
};

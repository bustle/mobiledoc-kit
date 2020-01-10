/**
 * @module UI
 */

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

'use strict';

exports.toggleLink = toggleLink;
var defaultShowPrompt = function defaultShowPrompt(message, defaultValue, callback) {
  return callback(window.prompt(message, defaultValue));
};

function toggleLink(editor) {
  var showPrompt = arguments.length <= 1 || arguments[1] === undefined ? defaultShowPrompt : arguments[1];

  if (editor.range.isCollapsed) {
    return;
  }

  var selectedText = editor.cursor.selectedText();
  var defaultUrl = '';
  if (selectedText.indexOf('http') !== -1) {
    defaultUrl = selectedText;
  }

  var range = editor.range;

  var hasLink = editor.detectMarkupInRange(range, 'a');

  if (hasLink) {
    editor.toggleMarkup('a');
  } else {
    showPrompt('Enter a URL', defaultUrl, function (url) {
      if (!url) {
        return;
      }

      editor.toggleMarkup('a', { href: url });
    });
  }
}
import { injectIntoString } from 'node_modules/content-kit-utils/src/string-utils';
import { sumSparseArray } from 'node_modules/content-kit-utils/src/array-utils';

/**
 * Builds an opening html tag. i.e. '<a href="http://link.com/" rel="author">'
 */
function createOpeningTag(tagName, attributes, selfClosing) {
  var tag = '<' + tagName;
  for (var attr in attributes) {
    if (attributes.hasOwnProperty(attr)) {
      tag += ' ' + attr + '="' + attributes[attr] + '"';
    }
  }
  if (selfClosing) { tag += '/'; }
  tag += '>';
  return tag;
}

/**
 * Builds a closing html tag. i.e. '</p>'
 */
function createCloseTag(tagName) {
  return '</' + tagName + '>';
}

/**
 * @class HTMLElementRenderer
 * @constructor
 */
function HTMLElementRenderer(options) {
  options = options || {};
  this.type = options.type;
  this.markupTypes = options.markupTypes;
}

/**
 * @method render
 * @param model a block model
 * @return String html
 * Renders a block model into a HTML string.
 */
HTMLElementRenderer.prototype.render = function(model) {
  var html = '';
  var type = this.type;
  var tagName = type.tag;
  var selfClosing = type.selfClosing;

  if (tagName) {
    html += createOpeningTag(tagName, model.attributes, selfClosing);
  }
  if (!selfClosing) {
    html += this.renderMarkup(model.value, model.markup);
    if (tagName) {
      html += createCloseTag(tagName);
    }
  }
  return html;
};

/**
 * @method renderMarkup
 * @param text plain text to apply markup to
 * @param markup an array of markup models
 * @return String html
 * Renders a markup model into a HTML string.
 */
HTMLElementRenderer.prototype.renderMarkup = function(text, markups) {
  var parsedTagsIndexes = [];
  var len = markups && markups.length, i;

  for (i = 0; i < len; i++) {
    var markup = markups[i],
        markupMeta = this.markupTypes.findById(markup.type),
        tagName = markupMeta.tag,
        selfClosing = markupMeta.selfClosing,
        start = markup.start,
        end = markup.end,
        openTag = createOpeningTag(tagName, markup.attributes, selfClosing),
        parsedTagLengthAtIndex = parsedTagsIndexes[start] || 0,
        parsedTagLengthBeforeIndex = sumSparseArray(parsedTagsIndexes.slice(0, start + 1));

    text = injectIntoString(text, openTag, start + parsedTagLengthBeforeIndex);
    parsedTagsIndexes[start] = parsedTagLengthAtIndex + openTag.length;

    if (!selfClosing) {
      var closeTag = createCloseTag(tagName);
      parsedTagLengthAtIndex = parsedTagsIndexes[end] || 0;
      parsedTagLengthBeforeIndex = sumSparseArray(parsedTagsIndexes.slice(0, end));
      text = injectIntoString(text, closeTag, end + parsedTagLengthBeforeIndex);
      parsedTagsIndexes[end]  = parsedTagLengthAtIndex + closeTag.length;
    }
  }

  return text;
};

export default HTMLElementRenderer;

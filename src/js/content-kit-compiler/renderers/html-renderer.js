import Type from '../types/type';
import HTMLElementRenderer from './html-element-renderer';
import HTMLEmbedRenderer from './html-embed-renderer';
import { DefaultBlockTypeSet, DefaultMarkupTypeSet } from '../types/default-types';
import { mergeWithOptions } from '../../content-kit-utils/object-utils';

/**
 * @class HTMLRenderer
 * @constructor
 */
function HTMLRenderer(options) {
  var defaults = {
    blockTypes    : DefaultBlockTypeSet,
    markupTypes   : DefaultMarkupTypeSet,
    typeRenderers : {}
  };
  mergeWithOptions(this, defaults, options);
}

/**
 * @method willRenderType
 * @param type {Number|Type}
 * @param renderer the rendering function that returns a string of html
 * Registers custom rendering hooks for a type
 */
HTMLRenderer.prototype.willRenderType = function(type, renderer) {
  if ('number' !== typeof type) {
    type = type.id;
  }
  this.typeRenderers[type] = renderer;
};

/**
 * @method rendererFor
 * @param model
 * @returns renderer
 * Returns an instance of a renderer for supplied model
 */
HTMLRenderer.prototype.rendererFor = function(model) {
  var type = this.blockTypes.findById(model.type);
  if (type === Type.EMBED) {
    return new HTMLEmbedRenderer();
  }
  return new HTMLElementRenderer({ type: type, markupTypes: this.markupTypes });
};

/**
 * @method render
 * @param model
 * @return String html
 */
HTMLRenderer.prototype.render = function(model) {
  var html = '';
  var len = model && model.length;
  var i, item, renderer, renderHook, itemHtml;

  for (i = 0; i < len; i++) {
    item = model[i];
    renderer = this.rendererFor(item);
    renderHook = this.typeRenderers[item.type];
    itemHtml = renderHook ? renderHook.call(renderer, item) : renderer.render(item);
    if (itemHtml) { html += itemHtml; }
  }
  return html;
};

export default HTMLRenderer;

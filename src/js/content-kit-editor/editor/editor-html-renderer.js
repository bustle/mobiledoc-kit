import HTMLRenderer from '../../content-kit-compiler/renderers/html-renderer';
import Type from '../../content-kit-compiler/types/type';
import { inherit } from '../../content-kit-utils/object-utils';

function embedRenderer(model) {
  var embedAttrs = model.attributes;
  var isVideo = embedAttrs.embed_type === 'video';
  return '<div class="ck-embed" contenteditable="false">' +
            '<figure>' +
              (isVideo ? '<div class="ck-video-container">' : '') + this.render(model) + (isVideo ? '</div>' : '') +
              '<figcaption>' + embedAttrs.provider_name + ': ' +
                '<a target="_blank" href="' + embedAttrs.url + '">' + embedAttrs.title + '</a>' +
              '</figcaption>' +
            '</figure>' +
          '</div>';
}

function imageRenderer(model) {
  return '<div class="ck-embed ck-image-embed" contenteditable="false">' +
            '<figure>' + this.render(model) + '</figure>' +
          '</div>';
}

var typeRenderers = {};
typeRenderers[Type.EMBED.id] = embedRenderer;
typeRenderers[Type.IMAGE.id] = imageRenderer;

/**
 * @class EditorHTMLRenderer
 * @constructor
 * Subclass of HTMLRenderer specifically for the Editor
 * Wraps interactive elements to add functionality
 */
function EditorHTMLRenderer() {
  HTMLRenderer.call(this, {
    typeRenderers: typeRenderers
  });
}
inherit(EditorHTMLRenderer, HTMLRenderer);

export default EditorHTMLRenderer;

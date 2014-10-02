import HTMLRenderer from '../../content-kit-compiler/renderers/html-renderer';
import Type from '../../content-kit-compiler/types/type';
import { inherit } from '../../content-kit-utils/object-utils';

var RegExpHttp = /^https?:\/\//i;

function embedRenderer(model) {
  var embedAttrs = model.attributes;
  var isVideo = embedAttrs.embed_type === 'video';
  return '<div class="ck-embed" data-embed=1 contenteditable="false">' +
            '<figure>' +
              (isVideo ? '<div class="ck-video-container">' : '') + this.render(model) + (isVideo ? '</div>' : '') +
              '<figcaption>' +
                '<a target="_blank" href="' + embedAttrs.url + '">' + embedAttrs.title + '</a>' +
              '</figcaption>' +
            '</figure>' +
          '</div>';
}

function imageRenderer(model) {
  var imagePersisted = RegExpHttp.test(model.attributes.src);
  return '<div class="ck-embed ck-image-embed' + (imagePersisted ? '' : ' ck-image-local') + '" data-embed=1 contenteditable="false">' +
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

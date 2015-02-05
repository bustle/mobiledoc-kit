import HTMLRenderer from 'node_modules/content-kit-compiler/src/renderers/html-renderer';
import Type from 'node_modules/content-kit-compiler/src/types/type';
import { inherit } from 'node_modules/content-kit-utils/src/object-utils';
import YouTubeRenderer from './youtube';
import TwitterRenderer from './twitter';
import InstagramRenderer from './instagram';
import LinkImageRenderer from './link-image-renderer';

/**
 * A dictionary of supported embeds types that we'll custom render
 * for the editor, instead of the default oembed html.
 */
var embedRenderers = {
  YOUTUBE    : new YouTubeRenderer(),
  TWITTER    : new TwitterRenderer(),
  INSTAGRAM  : new InstagramRenderer(),
  LINK_IMAGE : new LinkImageRenderer()
};

function embedRenderer(model) {
  var embedAttrs = model.attributes;
  var embedType = embedAttrs.embed_type;
  var isVideo = embedType === 'video';
  var providerName = embedAttrs.provider_name;
  var customRendererId = providerName && providerName.toUpperCase();
  var customRenderer = embedRenderers[customRendererId];
  if (!customRenderer && embedType === 'link' && embedAttrs.thumbnail) {
    customRenderer = embedRenderers['LINK_IMAGE'];
  }
  var renderer = customRenderer ? customRenderer : this;

  return '<div class="ck-embed" data-embed=1 contenteditable="false">' +
            '<figure>' +
              (isVideo ? '<div class="ck-video-container">' : '') + renderer.render(model) + (isVideo ? '</div>' : '') +
              '<figcaption>' +
                '<a target="_blank" href="' + embedAttrs.url + '">' + embedAttrs.title + '</a>' +
              '</figcaption>' +
            '</figure>' +
          '</div>';
}

function imageRenderer(model) {
  return '<div class="ck-embed ck-image-embed" data-embed=1 contenteditable="false">' +
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

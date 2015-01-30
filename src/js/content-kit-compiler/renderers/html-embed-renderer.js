import YouTubeRenderer from './embeds/youtube';
import TwitterRenderer from './embeds/twitter';
import InstagramRenderer from './embeds/instagram';
import LinkImageRenderer from './embeds/link-image-renderer';

/**
 * A dictionary of supported embed services
 */
var services = {
  YOUTUBE : {
    id: 1,
    renderer: new YouTubeRenderer()
  },
  TWITTER : {
    id: 2,
    renderer: new TwitterRenderer()
  },
  INSTAGRAM : {
    id: 3,
    renderer: new InstagramRenderer()
  },
  LINK_IMAGE: {
    id: 4,
    renderer: new LinkImageRenderer()
  }
};

/**
 * @class EmbedRenderer
 * @constructor
 */
function EmbedRenderer() {}

/**
 * @method render
 * @param model
 * @return String html
 */
EmbedRenderer.prototype.render = function(model) {
  var renderer = this.rendererFor(model);
  if (renderer) {
    return renderer.render(model);
  }
  var attrs = model.attributes;
  return attrs && attrs.html || '';
};

/**
 * @method rendererFor
 * @param model
 * @return service renderer
 */
EmbedRenderer.prototype.rendererFor = function(model) {
  var provider = model.attributes.provider_name;
  var providerKey = provider && provider.toUpperCase();
  var service = services[providerKey];
  if (!service && model.attributes.thumbnail) {
    service = services["LINK_IMAGE"];
  }
  return service && service.renderer;
};

export default EmbedRenderer;

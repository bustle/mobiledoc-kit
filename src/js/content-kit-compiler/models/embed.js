import Model from '../models/model';
import Type from '../types/type';

/**
 * @class EmbedModel
 * @constructor
 * @extends Model
 * Massages data from an oEmbed response into an EmbedModel
 */
function EmbedModel(options) {
  if (!options) { return null; }

  Model.call(this, {
    type: Type.EMBED.id,
    type_name: Type.EMBED.name,
    attributes: {}
  });

  var attributes = this.attributes;
  var embedType = options.type;
  var providerName = options.provider_name;
  var embedUrl = options.url;
  var embedTitle = options.title;
  var embedThumbnail = options.thumbnail_url;
  var embedHtml = options.html;

  if (embedType)    { attributes.embed_type = embedType; }
  if (providerName) { attributes.provider_name = providerName; }
  if (embedUrl)     { attributes.url = embedUrl; }
  if (embedTitle)   { attributes.title = embedTitle; }

  if (embedType === 'photo') {
    attributes.thumbnail = options.media_url || embedUrl;
  } else if (embedThumbnail) {
    attributes.thumbnail = embedThumbnail;
  }

  if (embedHtml && embedType === 'rich') {
    attributes.html = embedHtml;
  }
}

export default EmbedModel;

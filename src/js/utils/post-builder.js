import Post from "../models/post";
import MarkupSection from "../models/markup-section";
import ImageSection from "../models/image";
import Marker from "../models/marker";
import Markup from "../models/markup";

var builder = {
  generatePost() {
    return new Post();
  },
  generateMarkupSection(tagName, attributes, isGenerated) {
    let section = new MarkupSection(tagName);
    if (isGenerated) {
      section.isGenerated = !!isGenerated;
    }
    return section;
  },
  generateImageSection(url) {
    let section = new ImageSection();
    if (url) {
      section.src = url;
    }
    return section;
  },
  generateCardSection(name, payload={}) {
    const type = 'card';
    return { name, payload, type };
  },
  generateMarker: function(markers, value) {
    return new Marker(value, markers);
  },
  generateMarkup: function(tagName, attributes) {
    if (attributes) {
      // FIXME: This could also be cached
      return new Markup(tagName, attributes);
    }
    var markerType = this._markerTypeCache[tagName];
    if (!markerType) {
      this._markerTypeCache[tagName] = markerType = new Markup(tagName);
    }
    return markerType;
  }
};

function reset(builder){
  builder._markerTypeCache = {};
}

export function generateBuilder(){
  reset(builder);
  return builder;
}

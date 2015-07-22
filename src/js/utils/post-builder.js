import Post from "../models/post";
import MarkupSection from "../models/markup-section";
import ImageSection from "../models/image";

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
  // open: Array
  // close: Integer
  // value: String
  generateMarker: function(open, close, value) {
    return {
      type: 'marker',
      open: open,
      close: close,
      value: value
    };
  },
  generateMarkerType: function(tagName, attributes) {
    if (attributes) {
      // FIXME: This could also be cached
      return {
        type: 'markerType',
        tagName: tagName,
        attributes: attributes
      };
    }
    var markerType = this._markerTypeCache[tagName];
    if (!markerType) {
      this._markerTypeCache[tagName] = markerType = {
        type: 'markerType',
        tagName: tagName
      };
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

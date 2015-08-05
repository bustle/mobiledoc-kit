import Post from "../models/post";
import MarkupSection from "../models/markup-section";
import ImageSection from "../models/image";
import Marker from "../models/marker";
import Markup from "../models/markup";
import Card from "../models/card";

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
    return new Card(name, payload);
  },
  generateMarker(markups, value) {
    return new Marker(value, markups);
  },
  generateBlankMarker() {
    return new Marker('__BLANK__');
  },
  generateMarkup(tagName, attributes) {
    if (attributes) {
      // FIXME: This could also be cached
      return Markup.create(tagName, attributes);
    }
    var markerType = this._markerTypeCache[tagName];
    if (!markerType) {
      this._markerTypeCache[tagName] = markerType = Markup.create(tagName);
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

import Post from '../models/post';
import MarkupSection from '../models/markup-section';
import ImageSection from '../models/image';
import Marker from '../models/marker';
import Markup from '../models/markup';
import Card from '../models/card';
import { normalizeTagName } from '../utils/dom-utils';

export default class PostNodeBuilder {
  constructor() {
    this.markupCache = {};
  }

  createPost() {
    const post = new Post();
    post.builder = this;
    return post;
  }

  createMarkupSection(tagName, markers=[], isGenerated=false) {
    tagName = normalizeTagName(tagName);
    const section = new MarkupSection(tagName, markers);
    if (isGenerated) {
      section.isGenerated = true;
    }
    section.builder = this;
    return section;
  }

  createImageSection(url) {
    let section = new ImageSection();
    if (url) {
      section.src = url;
    }
    return section;
  }

  createCardSection(name, payload={}) {
    return new Card(name, payload);
  }

  createMarker(value, markups=[]) {
    const marker = new Marker(value, markups);
    marker.builder = this;
    return marker;
  }

  createBlankMarker() {
    const marker = new Marker('');
    marker.builder = this;
    return marker;
  }

  createMarkup(tagName, attributes) {
    tagName = normalizeTagName(tagName);

    let markup;

    if (attributes) {
      // FIXME: This could also be cached
      markup = new Markup(tagName, attributes);
    } else {
      if (this.markupCache[tagName]) {
        markup = this.markupCache[tagName];
      } else {
        markup = new Markup(tagName, attributes);
      }
    }

    markup.builder = this;
    return markup;
  }
}

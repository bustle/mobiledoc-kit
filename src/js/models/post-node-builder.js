import Post from '../models/post';
import MarkupSection from '../models/markup-section';
import ListSection from '../models/list-section';
import ListItem from '../models/list-item';
import ImageSection from '../models/image';
import Marker from '../models/marker';
import Markup from '../models/markup';
import Card from '../models/card';
import { normalizeTagName } from '../utils/dom-utils';
import { DEFAULT_TAG_NAME } from '../models/markup-section';

export default class PostNodeBuilder {
  constructor() {
    this.markupCache = {};
  }

  createPost(sections=[]) {
    const post = new Post();
    post.builder = this;

    sections.forEach(s => post.sections.append(s));

    return post;
  }

  createBlankPost() {
    let blankMarkupSection = this.createBlankMarkupSection('p');
    return this.createPost([ blankMarkupSection ]);
  }

  createMarkupSection(tagName=DEFAULT_TAG_NAME, markers=[], isGenerated=false) {
    tagName = normalizeTagName(tagName);
    const section = new MarkupSection(tagName, markers);
    if (isGenerated) {
      section.isGenerated = true;
    }
    section.builder = this;
    return section;
  }

  createBlankMarkupSection(tagName) {
    tagName = normalizeTagName(tagName);
    const blankMarker = this.createBlankMarker();
    return this.createMarkupSection(tagName, [ blankMarker ]);
  }

  createListSection(tagName, items=[]) {
    tagName = normalizeTagName(tagName);
    const section = new ListSection(tagName, items);
    section.builder = this;
    return section;
  }

  createListItem(markers=[]) {
    const tagName = normalizeTagName('li');
    const item = new ListItem(tagName, markers);
    item.builder = this;
    return item;
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

  // Attributes is an array of [key1, value1, key2, value2, ...]
  createMarkup(tagName, attributes=[]) {
    tagName = normalizeTagName(tagName);

    let markup;

    if (attributes.length) {
      // FIXME: This could also be cached
      markup = new Markup(tagName, attributes);
    } else {
      markup = this.markupCache[tagName];

      if (!markup) {
        markup = new Markup(tagName, attributes);
        this.markupCache[tagName] = markup;
      }
    }

    markup.builder = this;
    return markup;
  }
}

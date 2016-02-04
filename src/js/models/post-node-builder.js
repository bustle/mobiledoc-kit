import Atom from '../models/atom';
import Post from '../models/post';
import MarkupSection from '../models/markup-section';
import ListSection from '../models/list-section';
import ListItem from '../models/list-item';
import ImageSection from '../models/image';
import Marker from '../models/marker';
import Markup from '../models/markup';
import Card from '../models/card';
import { normalizeTagName } from '../utils/dom-utils';
import { objectToSortedKVArray } from '../utils/array-utils';
import {
  LIST_ITEM_TYPE,
  MARKUP_SECTION_TYPE
} from '../models/types';
import {
  DEFAULT_TAG_NAME as DEFAULT_MARKUP_SECTION_TAG_NAME
} from '../models/markup-section';
import {
  DEFAULT_TAG_NAME as DEFAULT_LIST_SECTION_TAG_NAME
} from '../models/list-section';
import assert from '../utils/assert';

function cacheKey(tagName, attributes) {
  return `${normalizeTagName(tagName)}-${objectToSortedKVArray(attributes).join('-')}`;
}

function addMarkupToCache(cache, markup) {
  cache[cacheKey(markup.tagName, markup.attributes)] = markup;
}

function findMarkupInCache(cache, tagName, attributes) {
  const key = cacheKey(tagName, attributes);
  return cache[key];
}

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

  createMarkerableSection(type, tagName, markers=[]) {
    switch (type) {
      case LIST_ITEM_TYPE:
        return this.createListItem(tagName, markers);
      case MARKUP_SECTION_TYPE:
        return this.createMarkupSection(tagName, markers);
      default:
        assert(`Cannot create markerable section of type ${type}`, false);
    }
  }

  createMarkupSection(tagName=DEFAULT_MARKUP_SECTION_TAG_NAME, markers=[], isGenerated=false) {
    tagName = normalizeTagName(tagName);
    const section = new MarkupSection(tagName, markers);
    if (isGenerated) {
      section.isGenerated = true;
    }
    section.builder = this;
    return section;
  }

  createListSection(tagName=DEFAULT_LIST_SECTION_TAG_NAME, items=[]) {
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
    const card = new Card(name, payload);
    card.builder = this;
    return card;
  }

  createMarker(value, markups=[]) {
    const marker = new Marker(value, markups);
    marker.builder = this;
    return marker;
  }

  createAtom(name, text='', payload={}, markups=[]) {
    const atom = new Atom(name, text, payload, markups);
    atom.builder = this;
    return atom;
  }

  /**
   * @param {Object} attributes {key:value}
   */
  createMarkup(tagName, attributes={}) {
    tagName = normalizeTagName(tagName);

    let markup = findMarkupInCache(this.markupCache, tagName, attributes);
    if (!markup) {
      markup = new Markup(tagName, attributes);
      markup.builder = this;
      addMarkupToCache(this.markupCache, markup);
    }

    return markup;
  }
}

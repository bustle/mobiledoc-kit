import Atom, { AtomPayload } from './atom'
import Post from './post'
import MarkupSection from './markup-section'
import ListSection from './list-section'
import ListItem from './list-item'
import ImageSection from './image'
import Marker from './marker'
import Markup from './markup'
import Card, { CardPayload } from './card'

import { LIST_ITEM_TYPE, MARKUP_SECTION_TYPE, Type } from './types'
import { DEFAULT_TAG_NAME as DEFAULT_MARKUP_SECTION_TAG_NAME } from './markup-section'
import { DEFAULT_TAG_NAME as DEFAULT_LIST_SECTION_TAG_NAME } from './list-section'

import { normalizeTagName } from '../utils/dom-utils'
import { objectToSortedKVArray } from '../utils/array-utils'
import assert from '../utils/assert'
import Markuperable from '../utils/markuperable'
import Section from './_section'
import { Cloneable } from './_cloneable'
import { Dict } from '../utils/types'

function cacheKey(tagName: string, attributes: Dict<string>) {
  return `${normalizeTagName(tagName)}-${objectToSortedKVArray(attributes).join('-')}`
}

function addMarkupToCache(cache: Dict<Markup>, markup: Markup) {
  cache[cacheKey(markup.tagName, markup.attributes)] = markup
}

function findMarkupInCache(cache: Dict<Markup>, tagName: string, attributes: Dict<string>) {
  const key = cacheKey(tagName, attributes)
  return cache[key]
}

/**
 * The PostNodeBuilder is used to create new {@link Post} primitives, such
 * as a MarkupSection, a CardSection, a Markup, etc. Every instance of an
 * {@link Editor} has its own builder instance. The builder can be used
 * inside an {@link Editor#run} callback to programmatically create new
 * Post primitives to insert into the document.
 * A PostNodeBuilder should be read from the Editor, *not* instantiated on its own.
 */
export default class PostNodeBuilder {
  markupCache: Dict<Markup> = {}

  /**
   * @return {Post} A new, blank post
   */
  createPost(sections: Cloneable<Section>[] = []): Post {
    const post = new Post()
    post.builder = this

    sections.forEach(s => post.sections.append(s))

    return post
  }

  createMarkerableSection(type: Type.LIST_ITEM, tagName: string, markers: Markuperable[]): ListItem
  createMarkerableSection(type: Type.MARKUP_SECTION, tagName: string, markers: Markuperable[]): MarkupSection
  createMarkerableSection(
    type: Exclude<Type, Type.LIST_ITEM & Type.MARKUP_SECTION>,
    tagName: string,
    markers: Markuperable[]
  ): never
  createMarkerableSection(type: Type, tagName: string, markers: Markuperable[] = []) {
    switch (type) {
      case LIST_ITEM_TYPE:
        return this.createListItem(markers)
      case MARKUP_SECTION_TYPE:
        return this.createMarkupSection(tagName, markers)
      default:
        assert(`Cannot create markerable section of type ${type}`, false)
    }
  }

  createMarkupSection(
    tagName: string = DEFAULT_MARKUP_SECTION_TAG_NAME,
    markers: Markuperable[] = [],
    isGenerated = false,
    attributes = {}
  ): MarkupSection {
    tagName = normalizeTagName(tagName)
    const section = new MarkupSection(tagName, markers, attributes)
    if (isGenerated) {
      section.isGenerated = true
    }
    section.builder = this
    return section
  }

  createListSection(tagName = DEFAULT_LIST_SECTION_TAG_NAME, items: ListItem[] = [], attributes = {}) {
    tagName = normalizeTagName(tagName)
    const section = new ListSection(tagName, items, attributes)
    section.builder = this
    return section
  }

  createListItem(markers: Markuperable[] = []) {
    const tagName = normalizeTagName('li')
    const item = new ListItem(tagName, markers)
    item.builder = this
    return item
  }

  createImageSection(url: string) {
    let section = new ImageSection()
    if (url) {
      section.src = url
    }
    section.builder = this
    return section
  }

  createCardSection(name: string, payload: CardPayload = {}): Card {
    const card = new Card(name, payload)
    card.builder = this
    return card
  }

  createMarker(value?: string, markups: Markup[] = []): Marker {
    const marker = new Marker(value, markups)
    marker.builder = this
    return marker
  }

  createAtom(name: string, value: string = '', payload: AtomPayload = {}, markups: Markup[] = []): Atom {
    const atom = new Atom(name, value, payload, markups)
    atom.builder = this
    return atom
  }

  /**
   * @param {String} tagName
   * @param {Object} attributes Key-value pairs of attributes for the markup
   * @return {Markup}
   */
  createMarkup(tagName: string, attributes: Dict<string> = {}): Markup {
    tagName = normalizeTagName(tagName)

    let markup = findMarkupInCache(this.markupCache, tagName, attributes)
    if (!markup) {
      markup = new Markup(tagName, attributes)
      markup.builder = this
      addMarkupToCache(this.markupCache, markup)
    }

    return markup
  }
}

export type PostNode = Post | Section | Markuperable | Marker

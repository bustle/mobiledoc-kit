import {
  MOBILEDOC_MARKUP_SECTION_TYPE,
  MOBILEDOC_IMAGE_SECTION_TYPE,
  MOBILEDOC_LIST_SECTION_TYPE,
  MOBILEDOC_CARD_SECTION_TYPE,
  MOBILEDOC_MARKUP_MARKER_TYPE,
  MOBILEDOC_ATOM_MARKER_TYPE
} from '../../renderers/mobiledoc/0-3-2';

import { kvArrayToObject, filter } from '../../utils/array-utils';
import assert from '../../utils/assert';
import { entries } from '../../utils/object-utils';

/*
 * Parses from mobiledoc -> post
 */
export default class MobiledocParser {
  constructor(builder) {
    this.builder = builder;
  }

  /**
   * @param {Mobiledoc}
   * @return {Post}
   */
  parse({ sections, markups: markerTypes, cards: cardTypes, atoms: atomTypes }) {
    try {
      const post = this.builder.createPost();

      this.markups = [];
      this.markerTypes = this.parseMarkerTypes(markerTypes);
      this.cardTypes = this.parseCardTypes(cardTypes);
      this.atomTypes = this.parseAtomTypes(atomTypes);
      this.parseSections(sections, post);

      return post;
    } catch (e) {
      assert(`Unable to parse mobiledoc: ${e.message}`, false);
    }
  }

  parseMarkerTypes(markerTypes) {
    return markerTypes.map((markerType) => this.parseMarkerType(markerType));
  }

  parseMarkerType([tagName, attributesArray]) {
    const attributesObject = kvArrayToObject(attributesArray || []);
    return this.builder.createMarkup(tagName, attributesObject);
  }

  parseCardTypes(cardTypes) {
    return cardTypes.map((cardType) => this.parseCardType(cardType));
  }

  parseCardType([cardName, cardPayload]) {
    return [cardName, cardPayload];
  }

  parseAtomTypes(atomTypes) {
    return atomTypes.map((atomType) => this.parseAtomType(atomType));
  }

  parseAtomType([atomName, atomValue, atomPayload]) {
    return [atomName, atomValue, atomPayload];
  }

  parseSections(sections, post) {
    sections.forEach((section) => this.parseSection(section, post));
  }

  parseSection(section, post) {
    let [type] = section;
    switch(type) {
      case MOBILEDOC_MARKUP_SECTION_TYPE:
        this.parseMarkupSection(section, post);
        break;
      case MOBILEDOC_IMAGE_SECTION_TYPE:
        this.parseImageSection(section, post);
        break;
      case MOBILEDOC_CARD_SECTION_TYPE:
        this.parseCardSection(section, post);
        break;
      case MOBILEDOC_LIST_SECTION_TYPE:
        this.parseListSection(section, post);
        break;
      default:
        assert('Unexpected section type ${type}', false);
    }
  }

  getAtomTypeFromIndex(index) {
    const atomType = this.atomTypes[index];
    assert(`No atom definition found at index ${index}`, !!atomType);
    return atomType;
  }

  getCardTypeFromIndex(index) {
    const cardType = this.cardTypes[index];
    assert(`No card definition found at index ${index}`, !!cardType);
    return cardType;
  }

  parseCardSection([, cardIndex], post) {
    const [name, payload] = this.getCardTypeFromIndex(cardIndex);
    const section = this.builder.createCardSection(name, payload);
    post.sections.append(section);
  }

  parseImageSection([, src], post) {
    const section = this.builder.createImageSection(src);
    post.sections.append(section);
  }

  parseMarkupSection([, tagName, markers, attributesArray], post) {
    const section = this.builder.createMarkupSection(tagName);
    post.sections.append(section);
    if (attributesArray) {
      entries(kvArrayToObject(attributesArray)).forEach(([key, value]) => {
        section.setAttribute(key, value);
      });
    }
    this.parseMarkers(markers, section);
    // Strip blank markers after they have been created. This ensures any
    // markup they include has been correctly populated.
    filter(section.markers, m => m.isBlank).forEach(m => {
      section.markers.remove(m);
    });
  }

  parseListSection([, tagName, items, attributesArray], post) {
    const section = this.builder.createListSection(tagName);
    post.sections.append(section);
    if (attributesArray) {
      entries(kvArrayToObject(attributesArray)).forEach(([key, value]) => {
        section.setAttribute(key, value);
      });
    }
    this.parseListItems(items, section);
  }

  parseListItems(items, section) {
    items.forEach(i => this.parseListItem(i, section));
  }

  parseListItem(markers, section) {
    const item = this.builder.createListItem();
    this.parseMarkers(markers, item);
    section.items.append(item);
  }

  parseMarkers(markers, parent) {
    markers.forEach(m => this.parseMarker(m, parent));
  }

  parseMarker([type, markerTypeIndexes, closeCount, value], parent) {
    markerTypeIndexes.forEach(index => {
      this.markups.push(this.markerTypes[index]);
    });

    const marker = this.buildMarkerType(type, value);
    parent.markers.append(marker);

    this.markups = this.markups.slice(0, this.markups.length-closeCount);
  }

  buildMarkerType(type, value) {
    switch (type) {
      case MOBILEDOC_MARKUP_MARKER_TYPE:
        return this.builder.createMarker(value, this.markups.slice());
      case MOBILEDOC_ATOM_MARKER_TYPE: {
        const [atomName, atomValue, atomPayload] = this.getAtomTypeFromIndex(value);
        return this.builder.createAtom(atomName, atomValue, atomPayload, this.markups.slice());
      }
      default:
        assert(`Unexpected marker type ${type}`, false);
    }
  }
}

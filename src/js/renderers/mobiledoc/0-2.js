import {visit, visitArray, compile} from '../../utils/compiler';
import { objectToSortedKVArray } from '../../utils/array-utils';
import {
  POST_TYPE,
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  LIST_ITEM_TYPE,
  MARKER_TYPE,
  MARKUP_TYPE,
  IMAGE_SECTION_TYPE,
  CARD_TYPE
} from '../../models/types';

export const MOBILEDOC_VERSION = '0.2.0';
export const MOBILEDOC_MARKUP_SECTION_TYPE = 1;
export const MOBILEDOC_IMAGE_SECTION_TYPE = 2;
export const MOBILEDOC_LIST_SECTION_TYPE = 3;
export const MOBILEDOC_CARD_SECTION_TYPE = 10;

const visitor = {
  [POST_TYPE](node, opcodes) {
    opcodes.push(['openPost']);
    visitArray(visitor, node.sections, opcodes);
  },
  [MARKUP_SECTION_TYPE](node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    visitArray(visitor, node.markers, opcodes);
  },
  [LIST_SECTION_TYPE](node, opcodes) {
    opcodes.push(['openListSection', node.tagName]);
    visitArray(visitor, node.items, opcodes);
  },
  [LIST_ITEM_TYPE](node, opcodes) {
    opcodes.push(['openListItem']);
    visitArray(visitor, node.markers, opcodes);
  },
  [IMAGE_SECTION_TYPE](node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  },
  [CARD_TYPE](node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  },
  [MARKER_TYPE](node, opcodes) {
    opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
    visitArray(visitor, node.openedMarkups, opcodes);
  },
  [MARKUP_TYPE](node, opcodes) {
    opcodes.push(['openMarkup', node.tagName, objectToSortedKVArray(node.attributes)]);
  }
};

const postOpcodeCompiler = {
  openMarker(closeCount, value) {
    this.markupMarkerIds = [];
    this.markers.push([
      this.markupMarkerIds,
      closeCount,
      value || ''
    ]);
  },
  openMarkupSection(tagName) {
    this.markers = [];
    this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers]);
  },
  openListSection(tagName) {
    this.items = [];
    this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items]);
  },
  openListItem() {
    this.markers = [];
    this.items.push(this.markers);
  },
  openImageSection(url) {
    this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url]);
  },
  openCardSection(name, payload) {
    this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, name, payload]);
  },
  openPost() {
    this.markerTypes = [];
    this.sections = [];
    this.result = {
      version: MOBILEDOC_VERSION,
      sections: [this.markerTypes, this.sections]
    };
  },
  openMarkup(tagName, attributes) {
    const index = this._findOrAddMarkerTypeIndex(tagName, attributes);
    this.markupMarkerIds.push(index);
  },
  _findOrAddMarkerTypeIndex(tagName, attributesArray) {
    if (!this._markerTypeCache) { this._markerTypeCache = {}; }
    const key = `${tagName}-${attributesArray.join('-')}`;

    let index = this._markerTypeCache[key];
    if (index === undefined) {
      let markerType = [tagName];
      if (attributesArray.length) { markerType.push(attributesArray); }
      this.markerTypes.push(markerType);

      index =  this.markerTypes.length - 1;
      this._markerTypeCache[key] = index;
    }

    return index;
  }
};

/**
 * Render from post -> mobiledoc
 */
export default {
  /**
   * @param {Post}
   * @return {Mobiledoc}
   */
  render(post) {
    let opcodes = [];
    visit(visitor, post, opcodes);
    let compiler = Object.create(postOpcodeCompiler);
    compile(compiler, opcodes);
    return compiler.result;
  }
};

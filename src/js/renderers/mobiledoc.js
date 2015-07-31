import {visit, visitArray, compile} from "../utils/compiler";
import { POST_TYPE } from "../models/post";
import { MARKUP_SECTION_TYPE } from "../models/markup-section";
import { IMAGE_SECTION_TYPE } from "../models/image";
import { MARKER_TYPE } from "../models/marker";
import { MARKUP_TYPE } from "../models/markup";
import { CARD_TYPE } from "../models/card";

export const MOBILEDOC_VERSION = '0.1';

let visitor = {
  [POST_TYPE](node, opcodes) {
    opcodes.push(['openPost']);
    visitArray(visitor, node.sections, opcodes);
  },
  [MARKUP_SECTION_TYPE](node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
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
    opcodes.push(['openMarkup', node.tagName, node.attributes]);
  }
};

let postOpcodeCompiler = {
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
    this.sections.push([1, tagName, this.markers]);
  },
  openImageSection(url) {
    this.sections.push([2, url]);
  },
  openCardSection(name, payload) {
    this.sections.push([10, name, payload]);
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
    if (!this._seenMarkerTypes) {
      this._seenMarkerTypes = {};
    }
    let index;
    if (attributes.length) {
      this.markerTypes.push([tagName, attributes]);
      index = this.markerTypes.length - 1;
    } else {
      index = this._seenMarkerTypes[tagName];
      if (index === undefined) {
        this.markerTypes.push([tagName]);
        this._seenMarkerTypes[tagName] = index = this.markerTypes.length-1;
      }
    }
    this.markupMarkerIds.push(index);
  }
};

export default {
  render(post) {
    let opcodes = [];
    visit(visitor, post, opcodes);
    let compiler = Object.create(postOpcodeCompiler);
    compile(compiler, opcodes);
    return compiler.result;
  }
};

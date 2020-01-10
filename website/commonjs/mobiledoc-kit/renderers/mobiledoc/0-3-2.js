'use strict';

var _visitor;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _utilsCompiler = require('../../utils/compiler');

var _utilsArrayUtils = require('../../utils/array-utils');

var _modelsTypes = require('../../models/types');

var MOBILEDOC_VERSION = '0.3.2';
exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
var MOBILEDOC_MARKUP_SECTION_TYPE = 1;
exports.MOBILEDOC_MARKUP_SECTION_TYPE = MOBILEDOC_MARKUP_SECTION_TYPE;
var MOBILEDOC_IMAGE_SECTION_TYPE = 2;
exports.MOBILEDOC_IMAGE_SECTION_TYPE = MOBILEDOC_IMAGE_SECTION_TYPE;
var MOBILEDOC_LIST_SECTION_TYPE = 3;
exports.MOBILEDOC_LIST_SECTION_TYPE = MOBILEDOC_LIST_SECTION_TYPE;
var MOBILEDOC_CARD_SECTION_TYPE = 10;

exports.MOBILEDOC_CARD_SECTION_TYPE = MOBILEDOC_CARD_SECTION_TYPE;
var MOBILEDOC_MARKUP_MARKER_TYPE = 0;
exports.MOBILEDOC_MARKUP_MARKER_TYPE = MOBILEDOC_MARKUP_MARKER_TYPE;
var MOBILEDOC_ATOM_MARKER_TYPE = 1;

exports.MOBILEDOC_ATOM_MARKER_TYPE = MOBILEDOC_ATOM_MARKER_TYPE;
var visitor = (_visitor = {}, _defineProperty(_visitor, _modelsTypes.POST_TYPE, function (node, opcodes) {
  opcodes.push(['openPost']);
  (0, _utilsCompiler.visitArray)(visitor, node.sections, opcodes);
}), _defineProperty(_visitor, _modelsTypes.MARKUP_SECTION_TYPE, function (node, opcodes) {
  opcodes.push(['openMarkupSection', node.tagName, (0, _utilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
  (0, _utilsCompiler.visitArray)(visitor, node.markers, opcodes);
}), _defineProperty(_visitor, _modelsTypes.LIST_SECTION_TYPE, function (node, opcodes) {
  opcodes.push(['openListSection', node.tagName, (0, _utilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
  (0, _utilsCompiler.visitArray)(visitor, node.items, opcodes);
}), _defineProperty(_visitor, _modelsTypes.LIST_ITEM_TYPE, function (node, opcodes) {
  opcodes.push(['openListItem']);
  (0, _utilsCompiler.visitArray)(visitor, node.markers, opcodes);
}), _defineProperty(_visitor, _modelsTypes.IMAGE_SECTION_TYPE, function (node, opcodes) {
  opcodes.push(['openImageSection', node.src]);
}), _defineProperty(_visitor, _modelsTypes.CARD_TYPE, function (node, opcodes) {
  opcodes.push(['openCardSection', node.name, node.payload]);
}), _defineProperty(_visitor, _modelsTypes.MARKER_TYPE, function (node, opcodes) {
  opcodes.push(['openMarker', node.closedMarkups.length, node.value]);
  (0, _utilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
}), _defineProperty(_visitor, _modelsTypes.MARKUP_TYPE, function (node, opcodes) {
  opcodes.push(['openMarkup', node.tagName, (0, _utilsArrayUtils.objectToSortedKVArray)(node.attributes)]);
}), _defineProperty(_visitor, _modelsTypes.ATOM_TYPE, function (node, opcodes) {
  opcodes.push(['openAtom', node.closedMarkups.length, node.name, node.value, node.payload]);
  (0, _utilsCompiler.visitArray)(visitor, node.openedMarkups, opcodes);
}), _visitor);

var postOpcodeCompiler = {
  openMarker: function openMarker(closeCount, value) {
    this.markupMarkerIds = [];
    this.markers.push([MOBILEDOC_MARKUP_MARKER_TYPE, this.markupMarkerIds, closeCount, value || '']);
  },
  openMarkupSection: function openMarkupSection(tagName, attributes) {
    this.markers = [];
    this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers, attributes]);
  },
  openListSection: function openListSection(tagName, attributes) {
    this.items = [];
    this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items, attributes]);
  },
  openListItem: function openListItem() {
    this.markers = [];
    this.items.push(this.markers);
  },
  openImageSection: function openImageSection(url) {
    this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url]);
  },
  openCardSection: function openCardSection(name, payload) {
    var index = this._addCardTypeIndex(name, payload);
    this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, index]);
  },
  openAtom: function openAtom(closeCount, name, value, payload) {
    var index = this._addAtomTypeIndex(name, value, payload);
    this.markupMarkerIds = [];
    this.markers.push([MOBILEDOC_ATOM_MARKER_TYPE, this.markupMarkerIds, closeCount, index]);
  },
  openPost: function openPost() {
    this.atomTypes = [];
    this.cardTypes = [];
    this.markerTypes = [];
    this.sections = [];
    this.result = {
      version: MOBILEDOC_VERSION,
      atoms: this.atomTypes,
      cards: this.cardTypes,
      markups: this.markerTypes,
      sections: this.sections
    };
  },
  openMarkup: function openMarkup(tagName, attributes) {
    var index = this._findOrAddMarkerTypeIndex(tagName, attributes);
    this.markupMarkerIds.push(index);
  },
  _addCardTypeIndex: function _addCardTypeIndex(cardName, payload) {
    var cardType = [cardName, payload];
    this.cardTypes.push(cardType);
    return this.cardTypes.length - 1;
  },
  _addAtomTypeIndex: function _addAtomTypeIndex(atomName, atomValue, payload) {
    var atomType = [atomName, atomValue, payload];
    this.atomTypes.push(atomType);
    return this.atomTypes.length - 1;
  },
  _findOrAddMarkerTypeIndex: function _findOrAddMarkerTypeIndex(tagName, attributesArray) {
    if (!this._markerTypeCache) {
      this._markerTypeCache = {};
    }
    var key = tagName + '-' + attributesArray.join('-');

    var index = this._markerTypeCache[key];
    if (index === undefined) {
      var markerType = [tagName];
      if (attributesArray.length) {
        markerType.push(attributesArray);
      }
      this.markerTypes.push(markerType);

      index = this.markerTypes.length - 1;
      this._markerTypeCache[key] = index;
    }

    return index;
  }
};

/**
 * Render from post -> mobiledoc
 */
exports['default'] = {
  /**
   * @param {Post}
   * @return {Mobiledoc}
   */
  render: function render(post) {
    var opcodes = [];
    (0, _utilsCompiler.visit)(visitor, post, opcodes);
    var compiler = Object.create(postOpcodeCompiler);
    (0, _utilsCompiler.compile)(compiler, opcodes);
    return compiler.result;
  }
};
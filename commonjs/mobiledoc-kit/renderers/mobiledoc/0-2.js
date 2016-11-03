'use strict';

var _visitor;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _utilsCompiler = require('../../utils/compiler');

var _utilsArrayUtils = require('../../utils/array-utils');

var _modelsTypes = require('../../models/types');

var MOBILEDOC_VERSION = '0.2.0';
exports.MOBILEDOC_VERSION = MOBILEDOC_VERSION;
var MOBILEDOC_MARKUP_SECTION_TYPE = 1;
exports.MOBILEDOC_MARKUP_SECTION_TYPE = MOBILEDOC_MARKUP_SECTION_TYPE;
var MOBILEDOC_IMAGE_SECTION_TYPE = 2;
exports.MOBILEDOC_IMAGE_SECTION_TYPE = MOBILEDOC_IMAGE_SECTION_TYPE;
var MOBILEDOC_LIST_SECTION_TYPE = 3;
exports.MOBILEDOC_LIST_SECTION_TYPE = MOBILEDOC_LIST_SECTION_TYPE;
var MOBILEDOC_CARD_SECTION_TYPE = 10;

exports.MOBILEDOC_CARD_SECTION_TYPE = MOBILEDOC_CARD_SECTION_TYPE;
var visitor = (_visitor = {}, _defineProperty(_visitor, _modelsTypes.POST_TYPE, function (node, opcodes) {
  opcodes.push(['openPost']);
  (0, _utilsCompiler.visitArray)(visitor, node.sections, opcodes);
}), _defineProperty(_visitor, _modelsTypes.MARKUP_SECTION_TYPE, function (node, opcodes) {
  opcodes.push(['openMarkupSection', node.tagName]);
  (0, _utilsCompiler.visitArray)(visitor, node.markers, opcodes);
}), _defineProperty(_visitor, _modelsTypes.LIST_SECTION_TYPE, function (node, opcodes) {
  opcodes.push(['openListSection', node.tagName]);
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
}), _visitor);

var postOpcodeCompiler = {
  openMarker: function openMarker(closeCount, value) {
    this.markupMarkerIds = [];
    this.markers.push([this.markupMarkerIds, closeCount, value || '']);
  },
  openMarkupSection: function openMarkupSection(tagName) {
    this.markers = [];
    this.sections.push([MOBILEDOC_MARKUP_SECTION_TYPE, tagName, this.markers]);
  },
  openListSection: function openListSection(tagName) {
    this.items = [];
    this.sections.push([MOBILEDOC_LIST_SECTION_TYPE, tagName, this.items]);
  },
  openListItem: function openListItem() {
    this.markers = [];
    this.items.push(this.markers);
  },
  openImageSection: function openImageSection(url) {
    this.sections.push([MOBILEDOC_IMAGE_SECTION_TYPE, url]);
  },
  openCardSection: function openCardSection(name, payload) {
    this.sections.push([MOBILEDOC_CARD_SECTION_TYPE, name, payload]);
  },
  openPost: function openPost() {
    this.markerTypes = [];
    this.sections = [];
    this.result = {
      version: MOBILEDOC_VERSION,
      sections: [this.markerTypes, this.sections]
    };
  },
  openMarkup: function openMarkup(tagName, attributes) {
    var index = this._findOrAddMarkerTypeIndex(tagName, attributes);
    this.markupMarkerIds.push(index);
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
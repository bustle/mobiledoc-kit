'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _renderersMobiledoc02 = require('../../renderers/mobiledoc/0-2');

var _utilsArrayUtils = require("../../utils/array-utils");

var _utilsAssert = require('../../utils/assert');

/*
 * Parses from mobiledoc -> post
 */

var MobiledocParser = (function () {
  function MobiledocParser(builder) {
    _classCallCheck(this, MobiledocParser);

    this.builder = builder;
  }

  /**
   * @param {Mobiledoc}
   * @return {Post}
   */

  _createClass(MobiledocParser, [{
    key: 'parse',
    value: function parse(_ref) {
      var sectionData = _ref.sections;

      try {
        var markerTypes = sectionData[0];
        var sections = sectionData[1];

        var post = this.builder.createPost();

        this.markups = [];
        this.markerTypes = this.parseMarkerTypes(markerTypes);
        this.parseSections(sections, post);

        return post;
      } catch (e) {
        (0, _utilsAssert['default'])('Unable to parse mobiledoc: ' + e.message, false);
      }
    }
  }, {
    key: 'parseMarkerTypes',
    value: function parseMarkerTypes(markerTypes) {
      var _this = this;

      return markerTypes.map(function (markerType) {
        return _this.parseMarkerType(markerType);
      });
    }
  }, {
    key: 'parseMarkerType',
    value: function parseMarkerType(_ref2) {
      var _ref22 = _slicedToArray(_ref2, 2);

      var tagName = _ref22[0];
      var attributesArray = _ref22[1];

      var attributesObject = (0, _utilsArrayUtils.kvArrayToObject)(attributesArray || []);
      return this.builder.createMarkup(tagName, attributesObject);
    }
  }, {
    key: 'parseSections',
    value: function parseSections(sections, post) {
      var _this2 = this;

      sections.forEach(function (section) {
        return _this2.parseSection(section, post);
      });
    }
  }, {
    key: 'parseSection',
    value: function parseSection(section, post) {
      var _section = _slicedToArray(section, 1);

      var type = _section[0];

      switch (type) {
        case _renderersMobiledoc02.MOBILEDOC_MARKUP_SECTION_TYPE:
          this.parseMarkupSection(section, post);
          break;
        case _renderersMobiledoc02.MOBILEDOC_IMAGE_SECTION_TYPE:
          this.parseImageSection(section, post);
          break;
        case _renderersMobiledoc02.MOBILEDOC_CARD_SECTION_TYPE:
          this.parseCardSection(section, post);
          break;
        case _renderersMobiledoc02.MOBILEDOC_LIST_SECTION_TYPE:
          this.parseListSection(section, post);
          break;
        default:
          (0, _utilsAssert['default'])('Unexpected section type ' + type, false);
      }
    }
  }, {
    key: 'parseCardSection',
    value: function parseCardSection(_ref3, post) {
      var _ref32 = _slicedToArray(_ref3, 3);

      var name = _ref32[1];
      var payload = _ref32[2];

      var section = this.builder.createCardSection(name, payload);
      post.sections.append(section);
    }
  }, {
    key: 'parseImageSection',
    value: function parseImageSection(_ref4, post) {
      var _ref42 = _slicedToArray(_ref4, 2);

      var src = _ref42[1];

      var section = this.builder.createImageSection(src);
      post.sections.append(section);
    }
  }, {
    key: 'parseMarkupSection',
    value: function parseMarkupSection(_ref5, post) {
      var _ref52 = _slicedToArray(_ref5, 3);

      var tagName = _ref52[1];
      var markers = _ref52[2];

      var section = this.builder.createMarkupSection(tagName.toLowerCase() === 'pull-quote' ? 'aside' : tagName);
      post.sections.append(section);
      this.parseMarkers(markers, section);
      // Strip blank markers after they have been created. This ensures any
      // markup they include has been correctly populated.
      (0, _utilsArrayUtils.filter)(section.markers, function (m) {
        return m.isBlank;
      }).forEach(function (m) {
        section.markers.remove(m);
      });
    }
  }, {
    key: 'parseListSection',
    value: function parseListSection(_ref6, post) {
      var _ref62 = _slicedToArray(_ref6, 3);

      var tagName = _ref62[1];
      var items = _ref62[2];

      var section = this.builder.createListSection(tagName);
      post.sections.append(section);
      this.parseListItems(items, section);
    }
  }, {
    key: 'parseListItems',
    value: function parseListItems(items, section) {
      var _this3 = this;

      items.forEach(function (i) {
        return _this3.parseListItem(i, section);
      });
    }
  }, {
    key: 'parseListItem',
    value: function parseListItem(markers, section) {
      var item = this.builder.createListItem();
      this.parseMarkers(markers, item);
      section.items.append(item);
    }
  }, {
    key: 'parseMarkers',
    value: function parseMarkers(markers, parent) {
      var _this4 = this;

      markers.forEach(function (m) {
        return _this4.parseMarker(m, parent);
      });
    }
  }, {
    key: 'parseMarker',
    value: function parseMarker(_ref7, parent) {
      var _this5 = this;

      var _ref72 = _slicedToArray(_ref7, 3);

      var markerTypeIndexes = _ref72[0];
      var closeCount = _ref72[1];
      var value = _ref72[2];

      markerTypeIndexes.forEach(function (index) {
        _this5.markups.push(_this5.markerTypes[index]);
      });
      var marker = this.builder.createMarker(value, this.markups.slice());
      parent.markers.append(marker);
      this.markups = this.markups.slice(0, this.markups.length - closeCount);
    }
  }]);

  return MobiledocParser;
})();

exports['default'] = MobiledocParser;
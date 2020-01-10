'use strict';

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsDomUtils = require('../../utils/dom-utils');

var _utilsAssert = require('../../utils/assert');

var _modelsMarker = require('../../models/marker');

var _utilsSelectionUtils = require('../../utils/selection-utils');

var _utilsKey = require('../../utils/key');

var _range = require('./range');

var FORWARD = _utilsKey.DIRECTION.FORWARD;
var BACKWARD = _utilsKey.DIRECTION.BACKWARD;

// generated via http://xregexp.com/ to cover chars that \w misses
// (new XRegExp('\\p{Alphabetic}|[0-9]|_|:')).toString()
var WORD_CHAR_REGEX = /[A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͅͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևְ-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-ٗٙ-ٟٮ-ۓە-ۜۡ-ۭۨ-ۯۺ-ۼۿܐ-ܿݍ-ޱߊ-ߪߴߵߺࠀ-ࠗࠚ-ࠬࡀ-ࡘࢠ-ࢴࣣ-ࣰࣩ-ऻऽ-ौॎ-ॐॕ-ॣॱ-ঃঅ-ঌএঐও-নপ-রলশ-হঽ-ৄেৈোৌৎৗড়ঢ়য়-ৣৰৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਾ-ੂੇੈੋੌੑਖ਼-ੜਫ਼ੰ-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽ-ૅે-ૉોૌૐૠ-ૣૹଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽ-ୄେୈୋୌୖୗଡ଼ଢ଼ୟ-ୣୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-ௌௐௗఀ-ఃఅ-ఌఎ-ఐఒ-నప-హఽ-ౄె-ైొ-ౌౕౖౘ-ౚౠ-ౣಁ-ಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽ-ೄೆ-ೈೊ-ೌೕೖೞೠ-ೣೱೲഁ-ഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൌൎൗൟ-ൣൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆා-ුූෘ-ෟෲෳก-ฺเ-ๆํກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆໍໜ-ໟༀཀ-ཇཉ-ཬཱ-ཱྀྈ-ྗྙ-ྼက-ံးျ-ဿၐ-ၢၥ-ၨၮ-ႆႎႜႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፟ᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜓᜠ-ᜳᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-ឳា-ៈៗៜᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤞᤠ-ᤫᤰ-ᤸᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨛᨠ-ᩞᩡ-ᩴᪧᬀ-ᬳᬵ-ᭃᭅ-ᭋᮀ-ᮩᮬ-ᮯᮺ-ᯥᯧ-ᯱᰀ-ᰵᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳳᳵᳶᴀ-ᶿᷧ-ᷴḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⒶ-ⓩⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙴ-ꙻꙿ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠧꡀ-ꡳꢀ-ꣃꣲ-ꣷꣻꣽꤊ-ꤪꤰ-ꥒꥠ-ꥼꦀ-ꦲꦴ-ꦿꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨶꩀ-ꩍꩠ-ꩶꩺꩾ-ꪾꫀꫂꫛ-ꫝꫠ-ꫯꫲ-ꫵꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯪ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]|[0-9]|_|:/;

function findParentSectionFromNode(renderTree, node) {
  var renderNode = renderTree.findRenderNodeFromElement(node, function (renderNode) {
    return renderNode.postNode.isSection;
  });

  return renderNode && renderNode.postNode;
}

function findOffsetInMarkerable(markerable, node, offset) {
  var offsetInSection = 0;
  var marker = markerable.markers.head;
  while (marker) {
    var markerNode = marker.renderNode.element;
    if (markerNode === node) {
      return offsetInSection + offset;
    } else if (marker.isAtom) {
      if (marker.renderNode.headTextNode === node) {
        return offsetInSection;
      } else if (marker.renderNode.tailTextNode === node) {
        return offsetInSection + 1;
      }
    }

    offsetInSection += marker.length;
    marker = marker.next;
  }

  return offsetInSection;
}

function findOffsetInSection(section, node, offset) {
  if (section.isMarkerable) {
    return findOffsetInMarkerable(section, node, offset);
  } else {
    (0, _utilsAssert['default'])('findOffsetInSection must be called with markerable or card section', section.isCardSection);

    var wrapperNode = section.renderNode.element;
    var endTextNode = wrapperNode.lastChild;
    if (node === endTextNode) {
      return 1;
    }
    return 0;
  }
}

var Position = undefined,
    BlankPosition = undefined;

Position = (function () {
  /**
   * A position is a logical location (zero-width, or "collapsed") in a post,
   * typically between two characters in a section.
   * Two positions (a head and a tail) make up a {@link Range}.
   * @constructor
   */

  function Position(section) {
    var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
    var isBlank = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    _classCallCheck(this, Position);

    if (!isBlank) {
      (0, _utilsAssert['default'])('Position must have a section that is addressable by the cursor', section && section.isLeafSection);
      (0, _utilsAssert['default'])('Position must have numeric offset', typeof offset === 'number');
    }

    this.section = section;
    this.offset = offset;
    this.isBlank = isBlank;
  }

  /**
   * @param {integer} x x-position in current viewport
   * @param {integer} y y-position in current viewport
   * @param {Editor} editor
   * @return {Position|null}
   */

  _createClass(Position, [{
    key: 'toRange',

    /**
     * Returns a range from this position to the given tail. If no explicit
     * tail is given this returns a collapsed range focused on this position.
     * @param {Position} [tail=this] The ending position
     * @return {Range}
     * @public
     */
    value: function toRange() {
      var tail = arguments.length <= 0 || arguments[0] === undefined ? this : arguments[0];
      var direction = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return new _range['default'](this, tail, direction);
    }
  }, {
    key: 'markerIn',

    /**
     * Returns the marker in `direction` from this position.
     * If the position is in the middle of a marker, the direction is irrelevant.
     * Otherwise, if the position is at a boundary between two markers, returns the
     * marker to the left if `direction` === BACKWARD and the marker to the right
     * if `direction` === FORWARD (assuming left-to-right text direction).
     * @param {Direction}
     * @return {Marker|undefined}
     */
    value: function markerIn(direction) {
      if (!this.isMarkerable) {
        return;
      }

      var marker = this.marker;
      var offsetInMarker = this.offsetInMarker;

      if (!marker) {
        return;
      }

      if (offsetInMarker > 0 && offsetInMarker < marker.length) {
        return marker;
      } else if (offsetInMarker === 0) {
        return direction === BACKWARD ? marker : marker.prev;
      } else if (offsetInMarker === marker.length) {
        return direction === FORWARD ? marker.next : marker;
      }
    }
  }, {
    key: 'isEqual',
    value: function isEqual(position) {
      return this.section === position.section && this.offset === position.offset;
    }

    /**
     * @return {Boolean} If this position is at the head of the post
     */
  }, {
    key: 'isHeadOfPost',
    value: function isHeadOfPost() {
      return this.move(BACKWARD).isEqual(this);
    }

    /**
     * @return {Boolean} If this position is at the tail of the post
     */
  }, {
    key: 'isTailOfPost',
    value: function isTailOfPost() {
      return this.move(FORWARD).isEqual(this);
    }

    /**
     * @return {Boolean} If this position is at the head of its section
     */
  }, {
    key: 'isHead',
    value: function isHead() {
      return this.isEqual(this.section.headPosition());
    }

    /**
     * @return {Boolean} If this position is at the tail of its section
     */
  }, {
    key: 'isTail',
    value: function isTail() {
      return this.isEqual(this.section.tailPosition());
    }

    /**
     * Move the position 1 unit in `direction`.
     *
     * @param {Number} units to move. > 0 moves right, < 0 moves left
     * @return {Position} Return a new position one unit in the given
     * direction. If the position is moving left and at the beginning of the post,
     * the same position will be returned. Same if the position is moving right and
     * at the end of the post.
     */
  }, {
    key: 'move',
    value: function move(units) {
      (0, _utilsAssert['default'])('Must pass integer to Position#move', typeof units === 'number');

      if (units < 0) {
        return this.moveLeft().move(++units);
      } else if (units > 0) {
        return this.moveRight().move(--units);
      } else {
        return this;
      }
    }

    /**
     * @param {Number} direction (FORWARD or BACKWARD)
     * @return {Position} The result of moving 1 "word" unit in `direction`
     */
  }, {
    key: 'moveWord',
    value: function moveWord(direction) {
      var isPostBoundary = direction === BACKWARD ? this.isHeadOfPost() : this.isTailOfPost();
      if (isPostBoundary) {
        return this;
      }

      if (!this.isMarkerable) {
        return this.move(direction);
      }

      var pos = this;

      // Helper fn to check if the pos is at the `dir` boundary of its section
      var isBoundary = function isBoundary(pos, dir) {
        return dir === BACKWARD ? pos.isHead() : pos.isTail();
      };
      // Get the char at this position (looking forward/right)
      var getChar = function getChar(pos) {
        var marker = pos.marker;
        var offsetInMarker = pos.offsetInMarker;

        return marker.charAt(offsetInMarker);
      };
      // Get the char in `dir` at this position
      var peekChar = function peekChar(pos, dir) {
        return dir === BACKWARD ? getChar(pos.move(BACKWARD)) : getChar(pos);
      };
      // Whether there is an atom in `dir` from this position
      var isAtom = function isAtom(pos, dir) {
        // Special case when position is at end, the marker associated with it is
        // the marker to its left. Normally `pos#marker` is the marker to the right of the pos's offset.
        if (dir === BACKWARD && pos.isTail() && pos.marker.isAtom) {
          return true;
        }
        return dir === BACKWARD ? pos.move(BACKWARD).marker.isAtom : pos.marker.isAtom;
      };

      if (isBoundary(pos, direction)) {
        // extend movement into prev/next section
        return pos.move(direction).moveWord(direction);
      }

      var seekWord = function seekWord(pos) {
        return !isBoundary(pos, direction) && !isAtom(pos, direction) && !WORD_CHAR_REGEX.test(peekChar(pos, direction));
      };

      // move(dir) while we are seeking the first word char
      while (seekWord(pos)) {
        pos = pos.move(direction);
      }

      if (isAtom(pos, direction)) {
        return pos.move(direction);
      }

      var seekBoundary = function seekBoundary(pos) {
        return !isBoundary(pos, direction) && !isAtom(pos, direction) && WORD_CHAR_REGEX.test(peekChar(pos, direction));
      };

      // move(dir) while we are seeking the first boundary position
      while (seekBoundary(pos)) {
        pos = pos.move(direction);
      }

      return pos;
    }

    /**
     * The position to the left of this position.
     * If this position is the post's headPosition it returns itself.
     * @return {Position}
     * @private
     */
  }, {
    key: 'moveLeft',
    value: function moveLeft() {
      if (this.isHead()) {
        var prev = this.section.previousLeafSection();
        return prev ? prev.tailPosition() : this;
      } else {
        var offset = this.offset - 1;
        if (this.isMarkerable && this.marker) {
          var code = this.marker.value.charCodeAt(offset);
          if (code >= _modelsMarker.LOW_SURROGATE_RANGE[0] && code <= _modelsMarker.LOW_SURROGATE_RANGE[1]) {
            offset = offset - 1;
          }
        }
        return new Position(this.section, offset);
      }
    }

    /**
     * The position to the right of this position.
     * If this position is the post's tailPosition it returns itself.
     * @return {Position}
     * @private
     */
  }, {
    key: 'moveRight',
    value: function moveRight() {
      if (this.isTail()) {
        var next = this.section.nextLeafSection();
        return next ? next.headPosition() : this;
      } else {
        var offset = this.offset + 1;
        if (this.isMarkerable && this.marker) {
          var code = this.marker.value.charCodeAt(offset - 1);
          if (code >= _modelsMarker.HIGH_SURROGATE_RANGE[0] && code <= _modelsMarker.HIGH_SURROGATE_RANGE[1]) {
            offset = offset + 1;
          }
        }
        return new Position(this.section, offset);
      }
    }
  }, {
    key: 'leafSectionIndex',
    get: function get() {
      var _this = this;

      var post = this.section.post;
      var leafSectionIndex = undefined;
      post.walkAllLeafSections(function (section, index) {
        if (section === _this.section) {
          leafSectionIndex = index;
        }
      });
      return leafSectionIndex;
    }
  }, {
    key: 'isMarkerable',
    get: function get() {
      return this.section && this.section.isMarkerable;
    }

    /**
     * Returns the marker at this position, in the backward direction
     * (i.e., the marker to the left of the cursor if the cursor is on a marker boundary and text is left-to-right)
     * @return {Marker|undefined}
     */
  }, {
    key: 'marker',
    get: function get() {
      return this.isMarkerable && this.markerPosition.marker;
    }
  }, {
    key: 'offsetInMarker',
    get: function get() {
      return this.markerPosition.offset;
    }
  }, {
    key: 'markerPosition',

    /**
     * @private
     */
    get: function get() {
      (0, _utilsAssert['default'])('Cannot get markerPosition without a section', !!this.section);
      (0, _utilsAssert['default'])('cannot get markerPosition of a non-markerable', !!this.section.isMarkerable);
      return this.section.markerPositionAtOffset(this.offset);
    }
  }], [{
    key: 'atPoint',
    value: function atPoint(x, y, editor) {
      var _renderTree = editor._renderTree;
      var rootElement = editor.element;

      var elementFromPoint = document.elementFromPoint(x, y);
      if (!(0, _utilsDomUtils.containsNode)(rootElement, elementFromPoint)) {
        return;
      }

      var _findOffsetInNode = (0, _utilsSelectionUtils.findOffsetInNode)(elementFromPoint, { left: x, top: y });

      var node = _findOffsetInNode.node;
      var offset = _findOffsetInNode.offset;

      return Position.fromNode(_renderTree, node, offset);
    }
  }, {
    key: 'blankPosition',
    value: function blankPosition() {
      return new BlankPosition();
    }
  }, {
    key: 'fromNode',
    value: function fromNode(renderTree, node, offset) {
      if ((0, _utilsDomUtils.isTextNode)(node)) {
        return Position.fromTextNode(renderTree, node, offset);
      } else {
        return Position.fromElementNode(renderTree, node, offset);
      }
    }
  }, {
    key: 'fromTextNode',
    value: function fromTextNode(renderTree, textNode, offsetInNode) {
      var renderNode = renderTree.getElementRenderNode(textNode);
      var section = undefined,
          offsetInSection = undefined;

      if (renderNode) {
        var marker = renderNode.postNode;
        section = marker.section;

        (0, _utilsAssert['default'])('Could not find parent section for mapped text node "' + textNode.textContent + '"', !!section);
        offsetInSection = section.offsetOfMarker(marker, offsetInNode);
      } else {
        // all text nodes should be rendered by markers except:
        //   * text nodes inside cards
        //   * text nodes created by the browser during text input
        // both of these should have rendered parent sections, though
        section = findParentSectionFromNode(renderTree, textNode);
        (0, _utilsAssert['default'])('Could not find parent section for un-mapped text node "' + textNode.textContent + '"', !!section);

        offsetInSection = findOffsetInSection(section, textNode, offsetInNode);
      }

      return new Position(section, offsetInSection);
    }
  }, {
    key: 'fromElementNode',
    value: function fromElementNode(renderTree, elementNode, offset) {
      var position = undefined;

      // The browser may change the reported selection to equal the editor's root
      // element if the user clicks an element that is immediately removed,
      // which can happen when clicking to remove a card.
      if (elementNode === renderTree.rootElement) {
        var post = renderTree.rootNode.postNode;
        position = offset === 0 ? post.headPosition() : post.tailPosition();
      } else {
        var section = findParentSectionFromNode(renderTree, elementNode);
        (0, _utilsAssert['default'])('Could not find parent section from element node', !!section);

        if (section.isCardSection) {
          // Selections in cards are usually made on a text node
          // containing a &zwnj;  on one side or the other of the card but
          // some scenarios (Firefox) will result in selecting the
          // card's wrapper div. If the offset is 2 we've selected
          // the final zwnj and should consider the cursor at the
          // end of the card (offset 1). Otherwise,  the cursor is at
          // the start of the card
          position = offset < 2 ? section.headPosition() : section.tailPosition();
        } else {

          // In Firefox it is possible for the cursor to be on an atom's wrapper
          // element. (In Chrome/Safari, the browser corrects this to be on
          // one of the text nodes surrounding the wrapper).
          // This code corrects for when the browser reports the cursor position
          // to be on the wrapper element itself
          var renderNode = renderTree.getElementRenderNode(elementNode);
          var postNode = renderNode && renderNode.postNode;
          if (postNode && postNode.isAtom) {
            var sectionOffset = section.offsetOfMarker(postNode);
            if (offset > 1) {
              // we are on the tail side of the atom
              sectionOffset += postNode.length;
            }
            position = new Position(section, sectionOffset);
          } else if (offset >= elementNode.childNodes.length) {

            // This is to deal with how Firefox handles triple-click selections.
            // See https://stackoverflow.com/a/21234837/1269194 for an
            // explanation.
            position = section.tailPosition();
          } else {
            // The offset is 0 if the cursor is on a non-atom-wrapper element node
            // (e.g., a <br> tag in a blank markup section)
            position = section.headPosition();
          }
        }
      }

      return position;
    }
  }]);

  return Position;
})();

BlankPosition = (function (_Position) {
  _inherits(BlankPosition, _Position);

  function BlankPosition() {
    _classCallCheck(this, BlankPosition);

    _get(Object.getPrototypeOf(BlankPosition.prototype), 'constructor', this).call(this, null, 0, true);
  }

  _createClass(BlankPosition, [{
    key: 'isEqual',
    value: function isEqual(other) {
      return other && other.isBlank;
    }
  }, {
    key: 'toRange',
    value: function toRange() {
      return _range['default'].blankRange();
    }
  }, {
    key: 'isHeadOfPost',
    value: function isHeadOfPost() {
      return false;
    }
  }, {
    key: 'isTailOfPost',
    value: function isTailOfPost() {
      return false;
    }
  }, {
    key: 'isHead',
    value: function isHead() {
      return false;
    }
  }, {
    key: 'isTail',
    value: function isTail() {
      return false;
    }
  }, {
    key: 'move',
    value: function move() {
      return this;
    }
  }, {
    key: 'moveWord',
    value: function moveWord() {
      return this;
    }
  }, {
    key: 'leafSectionIndex',
    get: function get() {
      (0, _utilsAssert['default'])('must implement get leafSectionIndex', false);
    }
  }, {
    key: 'isMarkerable',
    get: function get() {
      return false;
    }
  }, {
    key: 'marker',
    get: function get() {
      return false;
    }
  }, {
    key: 'markerPosition',
    get: function get() {
      return {};
    }
  }]);

  return BlankPosition;
})(Position);

exports['default'] = Position;
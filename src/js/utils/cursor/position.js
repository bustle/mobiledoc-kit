import { isTextNode } from 'mobiledoc-kit/utils/dom-utils';
import assert from 'mobiledoc-kit/utils/assert';
import {
  HIGH_SURROGATE_RANGE,
  LOW_SURROGATE_RANGE
} from 'mobiledoc-kit/models/marker';
import { containsNode } from 'mobiledoc-kit/utils/dom-utils';
import { findOffsetInNode } from 'mobiledoc-kit/utils/selection-utils';
import { DIRECTION } from 'mobiledoc-kit/utils/key';
import Range from './range';

const { FORWARD, BACKWARD } = DIRECTION;

// generated via http://xregexp.com/ to cover chars that \w misses
// (new XRegExp('\\p{Alphabetic}|[0-9]|_|:')).toString()
const WORD_CHAR_REGEX = /[A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͅͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙա-ևְ-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-ٗٙ-ٟٮ-ۓە-ۜۡ-ۭۨ-ۯۺ-ۼۿܐ-ܿݍ-ޱߊ-ߪߴߵߺࠀ-ࠗࠚ-ࠬࡀ-ࡘࢠ-ࢴࣣ-ࣰࣩ-ऻऽ-ौॎ-ॐॕ-ॣॱ-ঃঅ-ঌএঐও-নপ-রলশ-হঽ-ৄেৈোৌৎৗড়ঢ়য়-ৣৰৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਾ-ੂੇੈੋੌੑਖ਼-ੜਫ਼ੰ-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽ-ૅે-ૉોૌૐૠ-ૣૹଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽ-ୄେୈୋୌୖୗଡ଼ଢ଼ୟ-ୣୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-ௌௐௗఀ-ఃఅ-ఌఎ-ఐఒ-నప-హఽ-ౄె-ైొ-ౌౕౖౘ-ౚౠ-ౣಁ-ಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽ-ೄೆ-ೈೊ-ೌೕೖೞೠ-ೣೱೲഁ-ഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൌൎൗൟ-ൣൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆා-ුූෘ-ෟෲෳก-ฺเ-ๆํກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆໍໜ-ໟༀཀ-ཇཉ-ཬཱ-ཱྀྈ-ྗྙ-ྼက-ံးျ-ဿၐ-ၢၥ-ၨၮ-ႆႎႜႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፟ᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜌᜎ-ᜓᜠ-ᜳᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-ឳា-ៈៗៜᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤞᤠ-ᤫᤰ-ᤸᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨛᨠ-ᩞᩡ-ᩴᪧᬀ-ᬳᬵ-ᭃᭅ-ᭋᮀ-ᮩᮬ-ᮯᮺ-ᯥᯧ-ᯱᰀ-ᰵᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳳᳵᳶᴀ-ᶿᷧ-ᷴḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⒶ-ⓩⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿕ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙴ-ꙻꙿ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞭꞰ-ꞷꟷ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠧꡀ-ꡳꢀ-ꣃꣲ-ꣷꣻꣽꤊ-ꤪꤰ-ꥒꥠ-ꥼꦀ-ꦲꦴ-ꦿꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨶꩀ-ꩍꩠ-ꩶꩺꩾ-ꪾꫀꫂꫛ-ꫝꫠ-ꫯꫲ-ꫵꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭥꭰ-ꯪ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]|[0-9]|_|:/;

function findParentSectionFromNode(renderTree, node) {
  let renderNode =  renderTree.findRenderNodeFromElement(
    node,
    (renderNode) => renderNode.postNode.isSection
  );

  return renderNode && renderNode.postNode;
}

function findOffsetInMarkerable(markerable, node, offset) {
  let offsetInSection = 0;
  let marker = markerable.markers.head;
  while (marker) {
    let markerNode = marker.renderNode.element;
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
    assert('findOffsetInSection must be called with markerable or card section',
           section.isCardSection);

    let wrapperNode = section.renderNode.element;
    let endTextNode = wrapperNode.lastChild;
    if (node === endTextNode) {
      return 1;
    }
    return 0;
  }
}

let Position, BlankPosition;

Position = class Position {
  /**
   * A position is a logical location (zero-width, or "collapsed") in a post,
   * typically between two characters in a section.
   * Two positions (a head and a tail) make up a {@link Range}.
   * @constructor
   */
  constructor(section, offset=0, isBlank=false) {
    if (!isBlank) {
      assert('Position must have a section that is addressable by the cursor',
             (section && section.isLeafSection));
      assert('Position must have numeric offset',
             (typeof offset === 'number'));
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
  static atPoint(x, y, editor) {
    let { _renderTree, element: rootElement } = editor;
    let elementFromPoint = document.elementFromPoint(x, y);
    if (!containsNode(rootElement, elementFromPoint)) {
      return;
    }

    let { node, offset } = findOffsetInNode(elementFromPoint, {left: x, top: y});
    return Position.fromNode(_renderTree, node, offset);
  }

  static blankPosition() {
    return new BlankPosition();
  }

  /**
   * Returns a range from this position to the given tail. If no explicit
   * tail is given this returns a collapsed range focused on this position.
   * @param {Position} [tail=this] The ending position
   * @return {Range}
   * @public
   */
  toRange(tail=this, direction=null) {
    return new Range(this, tail, direction);
  }

  get leafSectionIndex() {
    let post = this.section.post;
    let leafSectionIndex;
    post.walkAllLeafSections((section, index) => {
      if (section === this.section) {
        leafSectionIndex = index;
      }
    });
    return leafSectionIndex;
  }

  get isMarkerable() {
    return this.section && this.section.isMarkerable;
  }

  /**
   * Returns the marker at this position, in the backward direction
   * (i.e., the marker to the left of the cursor if the cursor is on a marker boundary and text is left-to-right)
   * @return {Marker|undefined}
   */
  get marker() {
    return this.isMarkerable && this.markerPosition.marker;
  }

  /**
   * Returns the marker in `direction` from this position.
   * If the position is in the middle of a marker, the direction is irrelevant.
   * Otherwise, if the position is at a boundary between two markers, returns the
   * marker to the left if `direction` === BACKWARD and the marker to the right
   * if `direction` === FORWARD (assuming left-to-right text direction).
   * @param {Direction}
   * @return {Marker|undefined}
   */
  markerIn(direction) {
    if (!this.isMarkerable) { return; }

    let { marker, offsetInMarker } = this;
    if (!marker) { return; }

    if (offsetInMarker > 0 && offsetInMarker < marker.length) {
      return marker;
    } else if (offsetInMarker === 0) {
      return direction === BACKWARD ? marker : marker.prev;
    } else if (offsetInMarker === marker.length) {
      return direction === FORWARD ? marker.next : marker;
    }
  }

  get offsetInMarker() {
    return this.markerPosition.offset;
  }

  isEqual(position) {
    return this.section === position.section &&
           this.offset  === position.offset;
  }

  /**
   * @return {Boolean} If this position is at the head of the post
   */
  isHeadOfPost() {
    return this.move(BACKWARD).isEqual(this);
  }

  /**
   * @return {Boolean} If this position is at the tail of the post
   */
  isTailOfPost() {
    return this.move(FORWARD).isEqual(this);
  }

  /**
   * @return {Boolean} If this position is at the head of its section
   */
  isHead() {
    return this.isEqual(this.section.headPosition());
  }

  /**
   * @return {Boolean} If this position is at the tail of its section
   */
  isTail() {
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
  move(units) {
    assert('Must pass integer to Position#move', typeof units === 'number');

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
  moveWord(direction) {
    let isPostBoundary = direction === BACKWARD ? this.isHeadOfPost() : this.isTailOfPost();
    if (isPostBoundary) {
      return this;
    }

    if (!this.isMarkerable) {
      return this.move(direction);
    }

    let pos = this;

    // Helper fn to check if the pos is at the `dir` boundary of its section
    let isBoundary = (pos, dir) => {
      return dir === BACKWARD ? pos.isHead() : pos.isTail();
    };
    // Get the char at this position (looking forward/right)
    let getChar = (pos) => {
      let { marker, offsetInMarker } = pos;
      return marker.charAt(offsetInMarker);
    };
    // Get the char in `dir` at this position
    let peekChar = (pos, dir) => {
      return dir === BACKWARD ? getChar(pos.move(BACKWARD)) : getChar(pos);
    };
    // Whether there is an atom in `dir` from this position
    let isAtom = (pos, dir) => {
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

    let seekWord = (pos) => {
      return !isBoundary(pos, direction) &&
        !isAtom(pos, direction) &&
        !WORD_CHAR_REGEX.test(peekChar(pos, direction));
    };

    // move(dir) while we are seeking the first word char
    while (seekWord(pos)) {
      pos = pos.move(direction);
    }

    if (isAtom(pos, direction)) {
      return pos.move(direction);
    }

    let seekBoundary = (pos) => {
      return !isBoundary(pos, direction) &&
        !isAtom(pos, direction) &&
        WORD_CHAR_REGEX.test(peekChar(pos, direction));
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
  moveLeft() {
    if (this.isHead()) {
      let prev = this.section.previousLeafSection();
      return prev ? prev.tailPosition() : this;
    } else {
      let offset = this.offset - 1;
      if (this.isMarkerable && this.marker) {
        let code = this.marker.value.charCodeAt(offset);
        if (code >= LOW_SURROGATE_RANGE[0] && code <= LOW_SURROGATE_RANGE[1]) {
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
  moveRight() {
    if (this.isTail()) {
      let next = this.section.nextLeafSection();
      return next ? next.headPosition() : this;
    } else {
      let offset = this.offset + 1;
      if (this.isMarkerable && this.marker) {
        let code = this.marker.value.charCodeAt(offset - 1);
        if (code >= HIGH_SURROGATE_RANGE[0] && code <= HIGH_SURROGATE_RANGE[1]) {
          offset = offset + 1;
        }
      }
      return new Position(this.section, offset);
    }
  }

  static fromNode(renderTree, node, offset) {
    if (isTextNode(node)) {
      return Position.fromTextNode(renderTree, node, offset);
    } else {
      return Position.fromElementNode(renderTree, node, offset);
    }
  }

  static fromTextNode(renderTree, textNode, offsetInNode) {
    const renderNode = renderTree.getElementRenderNode(textNode);
    let section, offsetInSection;

    if (renderNode) {
      const marker = renderNode.postNode;
      section = marker.section;

      assert(`Could not find parent section for mapped text node "${textNode.textContent}"`,
             !!section);
      offsetInSection = section.offsetOfMarker(marker, offsetInNode);
    } else {
      // all text nodes should be rendered by markers except:
      //   * text nodes inside cards
      //   * text nodes created by the browser during text input
      // both of these should have rendered parent sections, though
      section = findParentSectionFromNode(renderTree, textNode);
      assert(`Could not find parent section for un-mapped text node "${textNode.textContent}"`,
             !!section);

      offsetInSection = findOffsetInSection(section, textNode, offsetInNode);
    }

    return new Position(section, offsetInSection);
  }

  static fromElementNode(renderTree, elementNode, offset) {
    let position;

    // The browser may change the reported selection to equal the editor's root
    // element if the user clicks an element that is immediately removed,
    // which can happen when clicking to remove a card.
    if (elementNode === renderTree.rootElement) {
      let post = renderTree.rootNode.postNode;
      position = offset === 0 ? post.headPosition() : post.tailPosition();
    } else {
      let section = findParentSectionFromNode(renderTree, elementNode);
      assert('Could not find parent section from element node', !!section);

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
        let renderNode = renderTree.getElementRenderNode(elementNode);
        let postNode = renderNode && renderNode.postNode;
        if (postNode && postNode.isAtom) {
          let sectionOffset = section.offsetOfMarker(postNode);
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

  /**
   * @private
   */
  get markerPosition() {
    assert('Cannot get markerPosition without a section', !!this.section);
    assert('cannot get markerPosition of a non-markerable', !!this.section.isMarkerable);
    return this.section.markerPositionAtOffset(this.offset);
  }
};

BlankPosition = class BlankPosition extends Position {
  constructor() {
    super(null, 0, true);
  }

  isEqual(other) {
    return other && other.isBlank;
  }

  toRange() { return Range.blankRange(); }
  get leafSectionIndex() { assert('must implement get leafSectionIndex', false); }

  get isMarkerable() { return false; }
  get marker() { return false; }
  isHeadOfPost() { return false; }
  isTailOfPost() { return false; }
  isHead() { return false; }
  isTail() { return false; }
  move() { return this; }
  moveWord() { return this; }

  get markerPosition() { return {}; }
};

export default Position;

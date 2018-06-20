import assert from 'mobiledoc-kit/utils/assert';
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  POST_TYPE,
  CARD_TYPE,
  IMAGE_SECTION_TYPE,
  LIST_ITEM_TYPE,
} from 'mobiledoc-kit/models/types';

const MARKERABLE = 'markerable',
      NESTED_MARKERABLE = 'nested_markerable',
      NON_MARKERABLE = 'non_markerable';

class Visitor {
  constructor(inserter, cursorPosition) {
    let { postEditor, post } = inserter;
    this.postEditor = postEditor;
    this._post = post;
    this.cursorPosition = cursorPosition;
    this.builder = this.postEditor.builder;

    this._hasInsertedFirstLeafSection = false;
  }

  get cursorPosition() {
    return this._cursorPosition;
  }

  set cursorPosition(position) {
    this._cursorPosition = position;
    this.postEditor.setRange(position);
  }

  visit(node) {
    let method = node.type;
    assert(`Cannot visit node of type ${node.type}`, !!this[method]);
    this[method](node);
  }

  _canMergeSection(section) {
    if (this._hasInsertedFirstLeafSection) {
      return false;
    } else {
      return this._isMarkerable && section.isMarkerable;
    }
  }

  get _isMarkerable() {
    return this.cursorSection.isMarkerable;
  }

  get cursorSection() {
    return this.cursorPosition.section;
  }

  get cursorOffset() {
    return this.cursorPosition.offset;
  }

  get _isNested() {
    return this.cursorSection.isNested;
  }

  [POST_TYPE](node) {
    if (this.cursorSection.isBlank && !this._isNested) {
      // replace blank section with entire post
      let newSections = node.sections.map(s => s.clone());
      this._replaceSection(this.cursorSection, newSections);
    } else {
      node.sections.forEach(section => this.visit(section));
    }
  }

  [MARKUP_SECTION_TYPE](node) {
    this[MARKERABLE](node);
  }

  [LIST_SECTION_TYPE](node) {
    let hasNext = !!node.next;
    node.items.forEach(item => this.visit(item));

    if (this._isNested && hasNext) {
      this._breakNestedAtCursor();
    }
  }

  [LIST_ITEM_TYPE](node) {
    this[NESTED_MARKERABLE](node);
  }

  [CARD_TYPE](node) {
    this[NON_MARKERABLE](node);
  }

  [IMAGE_SECTION_TYPE](node) {
    this[NON_MARKERABLE](node);
  }

  [NON_MARKERABLE](section) {
    if (this._isNested) {
      this._breakNestedAtCursor();
    } else if (!this.cursorSection.isBlank) {
      this._breakAtCursor();
    }

    this._insertLeafSection(section);
  }

  [MARKERABLE](section) {
    if (this._canMergeSection(section)) {
      this._mergeSection(section);
    } else if (this._isNested && this._isMarkerable) {
      // If we are attaching a markerable section to a list item,
      // insert a linebreak then merge the section onto the resulting blank list item
      this._breakAtCursor();

      // Advance the cursor to the head of the blank list item
      let nextPosition = this.cursorSection.next.headPosition();
      this.cursorPosition = nextPosition;

      // Merge this section onto the list item
      this._mergeSection(section);
    } else {
      this._breakAtCursor();
      this._insertLeafSection(section);
    }
  }

  [NESTED_MARKERABLE](section) {
    if (this._canMergeSection(section)) {
      this._mergeSection(section);
      return;
    }

    section = this._isNested ? section : this._wrapNestedSection(section);
    this._breakAtCursor();
    this._insertLeafSection(section);
  }

  // break out of a nested cursor position
  _breakNestedAtCursor() {
    assert('Cannot call _breakNestedAtCursor if not nested', this._isNested);

    let parent = this.cursorSection.parent;
    let cursorAtEndOfList = this.cursorPosition.isEqual(parent.tailPosition());

    if (cursorAtEndOfList) {
      let blank = this.builder.createMarkupSection();
      this._insertSectionAfter(blank, parent);
    } else {
      let [, blank,] = this._breakListAtCursor();
      this.cursorPosition = blank.tailPosition();
    }
  }

  _breakListAtCursor() {
    assert('Cannot _splitParentSection if cursor position is not nested',
           this._isNested);

    let list     = this.cursorSection.parent,
        position = this.cursorPosition,
        blank    = this.builder.createMarkupSection();
    let [pre, post] = this.postEditor._splitListAtPosition(list, position);

    let collection = this._post.sections,
        reference  = post;
    this.postEditor.insertSectionBefore(collection, blank, reference);
    return [pre, blank, post];
  }

  _wrapNestedSection(section) {
    let tagName = section.parent.tagName;
    let parent = this.builder.createListSection(tagName);
    parent.items.append(section.clone());
    return parent;
  }

  _mergeSection(section) {
    assert('Can only merge markerable sections',
           this._isMarkerable && section.isMarkerable);
    this._hasInsertedFirstLeafSection = true;

    let markers = section.markers.map(m => m.clone());
    let position = this.postEditor.insertMarkers(this.cursorPosition, markers);

    this.cursorPosition = position;
  }

  // Can be called to add a line break when in a nested section or a parent
  // section.
  _breakAtCursor() {
    if (this.cursorSection.isBlank) {
      return;
    } else if (this._isMarkerable) {
      this._breakMarkerableAtCursor();
    } else {
      this._breakNonMarkerableAtCursor();
    }
  }

  // Inserts a blank section before/after the cursor,
  // depending on cursor position.
  _breakNonMarkerableAtCursor() {
    let collection = this._post.sections,
        blank = this.builder.createMarkupSection(),
        reference = this.cursorPosition.isHead() ? this.cursorSection :
                                                   this.cursorSection.next;
    this.postEditor.insertSectionBefore(collection, blank, reference);
    this.cursorPosition = blank.tailPosition();
  }

  _breakMarkerableAtCursor() {
    let [pre,] =
      this.postEditor.splitSection(this.cursorPosition);

    this.cursorPosition = pre.tailPosition();
  }

  _replaceSection(section, newSections) {
    assert('Cannot replace section that does not have parent.sections',
           section.parent && section.parent.sections);
    assert('Must pass enumerable to _replaceSection', !!newSections.forEach);

    let collection = section.parent.sections;
    let reference = section.next;
    this.postEditor.removeSection(section);
    newSections.forEach(section => {
      this.postEditor.insertSectionBefore(collection, section, reference);
    });
    let lastSection = newSections[newSections.length - 1];

    this.cursorPosition = lastSection.tailPosition();
  }

  _insertSectionBefore(section, reference) {
    let collection = this.cursorSection.parent.sections;
    this.postEditor.insertSectionBefore(collection, section, reference);

    this.cursorPosition = section.tailPosition();
  }

  // Insert a section after the parent section.
  // E.g., add a markup section after a list section
  _insertSectionAfter(section, parent) {
    assert('Cannot _insertSectionAfter nested section', !parent.isNested);
    let reference = parent.next;
    let collection = this._post.sections;
    this.postEditor.insertSectionBefore(collection, section, reference);
    this.cursorPosition = section.tailPosition();
  }

  _insertLeafSection(section) {
    assert('Can only _insertLeafSection when cursor is at end of section',
           this.cursorPosition.isTail());

    this._hasInsertedFirstLeafSection = true;
    section = section.clone();

    if (this.cursorSection.isBlank) {
      assert('Cannot insert leaf non-markerable section when cursor is nested',
             !(section.isMarkerable && this._isNested));
      this._replaceSection(this.cursorSection, [section]);
    } else if (this.cursorSection.next && this.cursorSection.next.isBlank) {
      this._replaceSection(this.cursorSection.next, [section]);
    } else {
      let reference = this.cursorSection.next;
      this._insertSectionBefore(section, reference);
    }
  }
}

export default class Inserter {
  constructor(postEditor, post) {
    this.postEditor = postEditor;
    this.post = post;
  }

  insert(cursorPosition, newPost) {
    let visitor = new Visitor(this, cursorPosition);
    if (!newPost.isBlank) {
      visitor.visit(newPost);
    }
    return visitor.cursorPosition;
  }
}

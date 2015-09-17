import {
  DEFAULT_TAG_NAME as DEFAULT_MARKUP_SECTION_TAG_NAME
} from '../models/markup-section';
import { isMarkerable } from '../models/_section';
import { POST_TYPE, MARKUP_SECTION_TYPE, LIST_ITEM_TYPE } from '../models/types';
import Position from '../utils/cursor/position';
import { isArrayEqual, forEach, filter, compact } from '../utils/array-utils';
import { DIRECTION } from '../utils/key';
import LifecycleCallbacksMixin from '../utils/lifecycle-callbacks';
import mixin from '../utils/mixin';

function isMarkupSection(section) {
  return section.type === MARKUP_SECTION_TYPE;
}

function isListItem(section) {
  return section.type === LIST_ITEM_TYPE;
}

function isBlankAndListItem(section) {
  return isListItem(section) && section.isBlank;
}

const CALLBACK_QUEUES = {
  BEFORE_COMPLETE: 'beforeComplete',
  COMPLETE: 'complete',
  AFTER_COMPLETE: 'afterComplete'
};

class PostEditor {
  constructor(editor) {
    this.editor = editor;
    this.builder = this.editor.builder;

    this._didScheduleRerender = false;
    this._didScheduleUpdate = false;
    this._didComplete = false;
  }

  /**
   * Remove a range from the post
   *
   * Usage:
   *
   *     const range = editor.cursor.offsets;
   *     editor.run((postEditor) => {
   *       postEditor.deleteRange(range);
   *     });
   *
   * @method deleteRange
   * @param {Range} range Cursor Range object with head and tail Positions
   * @public
   */
  deleteRange(range) {
    // types of selection deletion:
    //   * a selection starts at the beginning of a section
    //     -- cursor should end up at the beginning of that section
    //     -- if the section not longer has markers, add a blank one for the cursor to focus on
    //   * a selection is entirely within a section
    //     -- split the markers with the selection, remove those new markers from their section
    //     -- cursor goes at end of the marker before the selection start, or if the
    //     -- selection was at the start of the section, cursor goes at section start
    //   * a selection crosses multiple sections
    //     -- remove all the sections that are between (exclusive) selection start and end
    //     -- join the start and end sections
    //     -- mark the end section for removal
    //     -- cursor goes at end of marker before the selection start

    const {
      head: {section: headSection, offset: headSectionOffset},
      tail: {section: tailSection, offset: tailSectionOffset}
    } = range;
    const { post } = this.editor;

    if (headSection === tailSection) {
      this.cutSection(headSection, headSectionOffset, tailSectionOffset);
    } else {
      let removedSections = post.sectionsContainedBy(range);
      post.walkMarkerableSections(range, section => {
        switch (section) {
          case headSection:
            this.cutSection(section, headSectionOffset, section.text.length);
            break;
          case tailSection:
            section.markersFor(tailSectionOffset, section.text.length).forEach(m => {
              headSection.markers.append(m);
            });
            this._markDirty(headSection); // May have added nodes
            removedSections.push(section);
            break;
          default:
            if (removedSections.indexOf(section) === -1) {
              removedSections.push(section);
            }
          }
      });
      removedSections.forEach(section => this.removeSection(section) );
    }
  }

  cutSection(section, headSectionOffset, tailSectionOffset) {
    if (section.isBlank) { return; }

    let adjustedHead = 0,
        marker = section.markers.head,
        adjustedTail = marker.length;

    // Walk to the first node inside the headSectionOffset, splitting
    // a marker if needed. Leave marker as the first node inside.
    while (marker) {
      if (adjustedTail >= headSectionOffset) {
        let splitOffset = headSectionOffset - adjustedHead;
        let { afterMarker } = this.splitMarker(marker, splitOffset);
        adjustedHead = adjustedHead + splitOffset;
        // FIXME: That these two loops cannot agree on adjustedTail being
        // incremented at the start or end seems prime for refactoring.
        adjustedTail = adjustedHead;
        marker = afterMarker;
        break;
      }
      adjustedHead += marker.length;
      marker = marker.next;
      if (marker) {
        adjustedTail += marker.length;
      }
    }

    // Walk each marker inside, removing it if needed. when the last is
    // reached split it and remove the part inside the tailSectionOffset
    while (marker) {
      adjustedTail += marker.length;
      if (adjustedTail >= tailSectionOffset) {
        let splitOffset = marker.length - (adjustedTail - tailSectionOffset);
        let {
          beforeMarker
        } = this.splitMarker(marker, splitOffset);
        if (beforeMarker) {
          this.removeMarker(beforeMarker);
        }
        break;
      }
      adjustedHead += marker.length;
      let nextMarker = marker.next;
      this.removeMarker(marker);
      marker = nextMarker;
    }
  }

  _coalesceMarkers(section) {
    this._removeEmptyMarkers(section);
    this._joinSimilarMarkers(section);
  }

  _removeEmptyMarkers(section) {
    forEach(
      filter(section.markers, m => m.isEmpty),
      m => this.removeMarker(m)
    );
  }

  // joins markers that have identical markups
  _joinSimilarMarkers(section) {
    let marker = section.markers.head;
    let nextMarker;
    while (marker && marker.next) {
      nextMarker = marker.next;

      if (isArrayEqual(marker.markups, nextMarker.markups)) {
        nextMarker.value = marker.value + nextMarker.value;
        this._markDirty(nextMarker);
        this.removeMarker(marker);
      }

      marker = nextMarker;
    }
  }

  removeMarker(marker) {
    this._scheduleForRemoval(marker);
    if (marker.section) {
      this._markDirty(marker.section);
      marker.section.markers.remove(marker);
    }
  }

  _scheduleForRemoval(postNode) {
    if (postNode.renderNode) {
      postNode.renderNode.scheduleForRemoval();

      this.scheduleRerender();
      this.scheduleDidUpdate();
    }
  }

  _markDirty(postNode) {
    if (postNode.renderNode) {
      postNode.renderNode.markDirty();

      this.scheduleRerender();
      this.scheduleDidUpdate();
    }
    if (postNode.section) {
      this._markDirty(postNode.section);
    }
    if (isMarkerable(postNode)) {
      this.addCallback(
        CALLBACK_QUEUES.BEFORE_COMPLETE, () => this._coalesceMarkers(postNode));
    }
  }

  /**
   * Remove a character from a {marker, offset} position, in either
   * forward or backward (default) direction.
   *
   * Usage:
   *
   *     let marker = editor.post.sections.head.markers.head;
   *     // marker has text of "Howdy!"
   *     editor.run((postEditor) => {
   *       postEditor.deleteFrom({section, offset: 3});
   *     });
   *     // marker has text of "Hody!"
   *
   * `deleteFrom` may remove a character from a different marker or join the
   * marker's section with the previous/next section (depending on the
   * deletion direction) if direction is `BACKWARD` and the offset is 0,
   * or direction is `FORWARD` and the offset is equal to the length of the
   * marker.
   *
   * @method deleteFrom
   * @param {Position} position object with {section, offset} the marker and offset to delete from
   * @param {Number} direction The direction to delete in (default is BACKWARD)
   * @return {Position} for positioning the cursor
   * @public
   */
  deleteFrom(position, direction=DIRECTION.BACKWARD) {
    if (direction === DIRECTION.BACKWARD) {
      return this._deleteBackwardFrom(position);
    } else {
      return this._deleteForwardFrom(position);
    }
  }

  _joinPositionToPreviousSection(position) {
    const {section } = position;
    let nextPosition = position.clone();

    if (!isMarkerable(section)) {
      throw new Error('Cannot join non-markerable section to previous section');
    } else if (isListItem(section)) {
      nextPosition = this._convertListItemToMarkupSection(section);
    } else {
      const prevSection = section.immediatelyPreviousMarkerableSection();

      if (prevSection) {
        const { beforeMarker } = prevSection.join(section);
        this._markDirty(prevSection);
        this.removeSection(section);

        nextPosition.section = prevSection;
        nextPosition.offset = beforeMarker ?
          prevSection.offsetOfMarker(beforeMarker, beforeMarker.length) : 0;
      }
    }

    return nextPosition;
  }

  /**
   * delete 1 character in the FORWARD direction from the given position
   * @method _deleteForwardFrom
   * @param {Position} position
   * @private
   */
  _deleteForwardFrom(position) {
    const { section, offset } = position;
    if (section.isBlank) {
      // remove this section, focus on start of next markerable section
      const nextPosition = position.clone();
      const next = section.immediatelyNextMarkerableSection();
      if (next) {
        this.removeSection(section);
        nextPosition.section = next;
        nextPosition.offset = 0;
      }
      return nextPosition;
    } else if (offset === section.length) {
      // join next markerable section to this one
      return this._joinPositionToNextSection(position);
    } else {
      return this._deleteForwardFromMarkerPosition(position.markerPosition);
    }
  }

  _joinPositionToNextSection(position) {
    const { section } = position;
    let nextPosition = position.clone();

    if (!isMarkerable(section)) {
      throw new Error('Cannot join non-markerable section to next section');
    } else {
      const next = section.immediatelyNextMarkerableSection();
      if (next) {
        section.join(next);
        this._markDirty(section);
        this.removeSection(next);
      }
    }

    return nextPosition;
  }

  _deleteForwardFromMarkerPosition(markerPosition) {
    const {marker, offset} = markerPosition;
    const {section} = marker;
    let nextPosition = new Position(section, section.offsetOfMarker(marker, offset));

    if (offset === marker.length) {
      const nextMarker = marker.next;

      if (nextMarker) {
        const nextMarkerPosition = {marker: nextMarker, offset: 0};
        return this._deleteForwardFromMarkerPosition(nextMarkerPosition);
      } else {
        const nextSection = marker.section.next;
        if (nextSection && isMarkupSection(nextSection)) {
          const currentSection = marker.section;

          currentSection.join(nextSection);
          this._markDirty(currentSection);

          this.removeSection(nextSection);
        }
      }
    } else {
      marker.deleteValueAtOffset(offset);
      this._markDirty(marker);
    }

    return nextPosition;
  }

  _convertListItemToMarkupSection(listItem) {
    const listSection = listItem.parent;

    const newSections = listItem.splitIntoSections();
    const newMarkupSection = newSections[1];

    this._replaceSection(listSection, compact(newSections));

    return new Position(newMarkupSection, 0);
  }

  /**
   * delete 1 character in the BACKWARD direction from the given position
   * @method _deleteBackwardFrom
   * @param {Position} position
   * @return {Position} The position the cursor should be put after this deletion
   * @private
   */
  _deleteBackwardFrom(position) {
    const { offset:sectionOffset } = position;

    if (sectionOffset === 0) {
      return this._joinPositionToPreviousSection(position);
    }

    let nextPosition = position.clone();
    const { marker, offset:markerOffset } = position.markerPosition;

    const offsetToDeleteAt = markerOffset - 1;

    marker.deleteValueAtOffset(offsetToDeleteAt);
    nextPosition.offset -= 1;
    this._markDirty(marker);

    return nextPosition;
  }

  /**
   * Split markers at two positions, once at the head, and if necessary once
   * at the tail. This method is designed to accept a range
   * (e.g. `editor.cursor.offsets`) as an argument.
   *
   * Usage:
   *
   *     let markerRange = this.cursor.offsets;
   *     editor.run((postEditor) => {
   *       postEditor.splitMarkers(markerRange);
   *     });
   *
   * The return value will be marker object completely inside the offsets
   * provided. Markers on the outside of the split may also have been modified.
   *
   * @method splitMarkers
   * @param {Range} markerRange
   * @return {Array} of markers that are inside the split
   * @private
   */
  splitMarkers(range) {
    const { post } = this.editor;
    const { head, tail } = range;

    this.splitSectionMarkerAtOffset(head.section, head.offset);
    this.splitSectionMarkerAtOffset(tail.section, tail.offset);

    return post.markersContainedByRange(range);
  }

  splitSectionMarkerAtOffset(section, offset) {
    const edit = section.splitMarkerAtOffset(offset);
    edit.removed.forEach(m => this.removeMarker(m));
  }

  splitMarker(marker, offset) {
    let beforeMarker, afterMarker;

    if (offset === 0) {
      beforeMarker = marker.prev;
      afterMarker = marker;
    } else if (offset === marker.length) {
      beforeMarker = marker;
      afterMarker = marker.next;
    } else {
      let { builder } = this.editor,
          { section } = marker;
      beforeMarker = builder.createMarker(marker.value.substring(0, offset), marker.markups);
      afterMarker = builder.createMarker(marker.value.substring(offset, marker.length), marker.markups);
      section.markers.splice(marker, 1, [beforeMarker, afterMarker]);

      this.removeMarker(marker);
      this._markDirty(section);
    }

    return { beforeMarker, afterMarker };
  }

  /**
   * Split a section at one position. This method is designed to accept
   * `editor.cursor.offsets` as an argument, but will only split at the
   * head of the cursor position.
   *
   * Usage:
   *
   *     let marker = editor.post.sections.head.marker.head;
   *     editor.run((postEditor) => {
   *       postEditor.splitSection({
   *         headSection: section,
   *         headSectionOffset: 3
   *       });
   *     });
   *     // Will result in the marker and its old section being removed from
   *     // the post and rendered DOM, and in the creation of two new sections
   *     // replacing the old one.
   *
   * The return value will be the two new sections. One or both of these
   * sections can be blank (contain only a blank marker), for example if the
   * headMarkerOffset is 0.
   *
   * @method splitSection
   * @param {Position} position
   * @return {Array} new sections, one for the first half and one for the second
   * @public
   */
  splitSection(position) {
    const section = position.section;
    const [beforeSection, afterSection] = section.splitAtPosition(position);
    this._coalesceMarkers(beforeSection);
    this._coalesceMarkers(afterSection);

    const newSections = [beforeSection, afterSection];
    let replacementSections = [beforeSection, afterSection];

    if (isBlankAndListItem(beforeSection) && isBlankAndListItem(section)) {
      const isLastItemInList = section === section.parent.sections.tail;

      if (isLastItemInList) {
        // when hitting enter in a final empty list item, do not insert a new
        // empty item
        replacementSections.shift();
      }
    }

    this._replaceSection(section, replacementSections);

    // FIXME we must return 2 sections because other code expects this to always return 2
    return newSections;
  }

  /**
   * @method replaceSection
   * @param {Section} section
   * @param {Section} newSection
   * @return null
   * @public
   */
  replaceSection(section, newSection) {
    if (!section) {
      // The section may be undefined if the user used the embed intent
      // ("+" icon) to insert a new "ul" section in a blank post
      this.insertSectionBefore(this.editor.post.sections, newSection);
    } else {
      this._replaceSection(section, [newSection]);
    }
  }

  moveSectionBefore(collection, renderedSection, beforeSection) {
    const newSection = renderedSection.clone();
    this.removeSection(renderedSection);
    this.insertSectionBefore(collection, newSection, beforeSection);
  }

  /**
   * @method moveSectionUp
   * @param {Section} section A section that is already in DOM
   * @public
   */
  moveSectionUp(renderedSection) {
    const isFirst = !renderedSection.prev;
    if (isFirst) { return; }

    const collection = renderedSection.parent.sections;
    const beforeSection = renderedSection.prev;
    this.moveSectionBefore(collection, renderedSection, beforeSection);
  }

  /**
   * @method moveSectionDown
   * @param {Section} section A section that is already in DOM
   * @public
   */
  moveSectionDown(renderedSection) {
    const isLast = !renderedSection.next;
    if (isLast) { return; }

    const beforeSection = renderedSection.next.next;
    const collection = renderedSection.parent.sections;
    this.moveSectionBefore(collection, renderedSection, beforeSection);
  }

  _replaceSection(section, newSections) {
    let nextSection = section.next;
    let collection = section.parent.sections;

    let nextNewSection = newSections[0];
    if (isMarkupSection(nextNewSection) && isListItem(section)) {
      // put the new section after the ListSection (section.parent) instead of after the ListItem
      collection = section.parent.parent.sections;
      nextSection = section.parent.next;
    }

    newSections.forEach(s => this.insertSectionBefore(collection, s, nextSection));
    this.removeSection(section);
  }

  /**
   * Given a markerRange (for example `editor.cursor.offsets`) mark all markers
   * inside it as a given markup. The markup must be provided as a post
   * abstract node.
   *
   * Usage:
   *
   *     const range = editor.cursor.offsets;
   *     const strongMarkup = editor.builder.createMarkup('strong');
   *     editor.run((postEditor) => {
   *       postEditor.addMarkupToRange(range, strongMarkup);
   *     });
   *     // Will result some markers possibly being split, and the markup
   *     // being applied to all markers between the split.
   *
   * The return value will be all markers between the split, the same return
   * value as `splitMarkers`.
   *
   * @method addMarkupToRange
   * @param {Range} range
   * @param {Markup} markup A markup post abstract node
   * @public
   */
  addMarkupToRange(range, markup) {
    if (range.isCollapsed) {
      return;
    }
    this.splitMarkers(range).forEach(marker => {
      marker.addMarkup(markup);
      this._markDirty(marker);
    });
  }

  /**
   * Given a markerRange (for example `editor.cursor.offsets`) remove the given
   * markup from all contained markers. The markup must be provided as a post
   * abstract node.
   *
   * Usage:
   *
   *     const range = editor.cursor.offsets;
   *     const markup = markerRange.headMarker.markups[0];
   *     editor.run(postEditor => {
   *       postEditor.removeMarkupFromRange(range, markup);
   *     });
   *     // Will result in some markers possibly being split, and the markup
   *     // being removed from all markers between the split.
   *
   * The return value will be all markers between the split, the same return
   * value as `splitMarkers`.
   *
   * @method removeMarkupFromRange
   * @param {Range} range Object with offsets
   * @param {Markup} markup A markup post abstract node
   * @private
   */
  removeMarkupFromRange(range, markupOrMarkupCallback) {
    if (range.isCollapsed) {
      return;
    }
    this.splitMarkers(range).forEach(marker => {
      marker.removeMarkup(markupOrMarkupCallback);
      this._markDirty(marker);
    });
  }

  /**
   * @method insertMarkers
   * @param {Position} position to insert at
   * @param {Array} markers to insert
   * @return {Position} position at end of inserted markers
   * @private
   */
  insertMarkers(position, markers=[]) {
    let { section, offset } = position;
    this.splitSectionMarkerAtOffset(section, offset);
    let {marker:prevMarker} = section.markerPositionAtOffset(offset);
    let currentMarker = offset === 0 ? prevMarker : prevMarker.next;
    
    markers.forEach(marker => {
      marker = marker.clone();
      section.markers.insertBefore(marker, currentMarker);
      offset += marker.length;
      this._markDirty(marker);
    });

    return new Position(section, offset);
  }

  /**
   * Toggle the given markup on the current selection. If anything in the current
   * selection has the markup, the markup will be removed from it. If nothing in the selection
   * has the markup, the markup will be added to everything in the selection.
   *
   * Usage:
   *
   * // Remove any 'strong' markup if it exists in the selection, otherwise
   * // make it all 'strong'
   * editor.run(postEditor => postEditor.toggleMarkup('strong'));
   *
   * // add/remove a link to 'bustle.com' to the selection
   * editor.run(postEditor => {
   *   const linkMarkup = postEditor.builder.createMarkup('a', ['href', 'http://bustle.com']);
   *   postEditor.toggleMarkup(linkMarkup);
   * });
   *
   * @method toggleMarkup
   * @param {Markup|String} markupOrString Either a markup object created using
   * the builder (useful when adding a markup with attributes, like an 'a' markup),
   * or, if a string, the tag name of the markup (e.g. 'strong', 'em') to toggle.
   */
  toggleMarkup(markupOrMarkupString) {
    const range = this.editor.cursor.offsets;
    if (range.isCollapsed) {
      return;
    }
    const markup = typeof markupOrMarkupString === 'string' ?
                     this.builder.createMarkup(markupOrMarkupString) :
                     markupOrMarkupString;

    const hasMarkup = this.editor.detectMarkupInRange(range, markup.tagName);
    // FIXME: This implies only a single markup in a range. This may not be
    // true for links (which are not the same object instance like multiple
    // strong tags would be).
    if (hasMarkup) {
      this.removeMarkupFromRange(range, hasMarkup);
    } else {
      this.addMarkupToRange(range, markup);
    }
    this.scheduleAfterRender(() => this.editor.selectRange(range));
  }

  changeSectionTagName(section, newTagName) {
    section.markers.forEach(m => {
      m.clearMarkups();
      this._markDirty(m);
    });
    section.setTagName(newTagName);
    this._markDirty(section);
  }

  resetSectionTagName(section) {
    this.changeSectionTagName(section, DEFAULT_MARKUP_SECTION_TAG_NAME);
  }

  /**
   * Insert a given section before another one, updating the post abstract
   * and the rendered UI.
   *
   * Usage:
   *
   *     let markerRange = editor.cursor.offsets;
   *     let sectionWithCursor = markerRange.headMarker.section;
   *     let section = editor.builder.createCardSection('my-image');
   *     let collection = sectionWithCursor.parent.sections;
   *     editor.run((postEditor) => {
   *       postEditor.insertSectionBefore(collection, section, sectionWithCursor);
   *     });
   *
   * @method insertSectionBefore
   * @param {LinkedList} collection The list of sections to insert into
   * @param {Object} section The new section
   * @param {Object} beforeSection Optional The section "before" is relative to,
   * if falsy the new section will be appended to the collection
   * @public
   */
  insertSectionBefore(collection, section, beforeSection) {
    collection.insertBefore(section, beforeSection);
    this._markDirty(section.parent);
  }

  /**
   * Insert the given section after the current active section, or, if no
   * section is active, at the end of the document.
   * @method insertSection
   * @param {Section} section
   * @public
   */
  insertSection(section) {
    const activeSection = this.editor.activeSection;
    const nextSection = activeSection && activeSection.next;

    const collection = this.editor.post.sections;
    this.insertSectionBefore(collection, section, nextSection);
  }

  /**
   * Insert the given section at the end of the document.
   * @method insertSectionAtEnd
   * @param {Section} section
   * @public
   */
  insertSectionAtEnd(section) {
    this.insertSectionBefore(this.editor.post.sections, section, null);
  }

  /**
   * @method insertPost
   * @param {Position} position
   * @param {Post} post
   * @return {Position} position at end of inserted content
   * @private
   */
  insertPost(position, newPost) {
    const post = this.editor.post;
    const shouldSplitSection = newPost.sections.length > 1;

    if (!shouldSplitSection) {
      const markers = newPost.sections.head.markers;
      return this.insertMarkers(position, markers);
    }

    let [preSplit, postSplit] = this.splitSection(position);
    const headSection = newPost.sections.head;
    let lastInsertedSection = headSection;

    newPost.sections.forEach(section => {
      if (section === headSection) {
        this._mergeSectionAtEnd(section, preSplit);
      } else {
        section = section.clone();
        lastInsertedSection = section;
        this.insertSectionBefore(post.sections, section, postSplit);
      }
    });

    if (postSplit.isBlank) {
      this.removeSection(postSplit);
    }

    return new Position(lastInsertedSection, lastInsertedSection.length);
  }

  _mergeSectionAtEnd(sectionToMerge, existingSection) {
    const markers = sectionToMerge.markers;
    const position = new Position(existingSection, existingSection.length);
    return this.insertMarkers(position, markers);
  }

  /**
   * Remove a given section from the post abstract and the rendered UI.
   *
   * Usage:
   *
   *     const range = editor.cursor.offsets;
   *     const sectionWithCursor = range.head.section;
   *     editor.run((postEditor) => {
   *       postEditor.removeSection(sectionWithCursor);
   *     });
   *
   * @method removeSection
   * @param {Object} section The section to remove
   * @public
   */
  removeSection(section) {
    const parent = section.parent;
    const parentIsRemoved = parent.renderNode.isRemoved;

    if (parentIsRemoved) {
      // This can happen if we remove a list section and later
      // try to remove one of the section's list items;
      return;
    }

    this._scheduleForRemoval(section);
    parent.sections.remove(section);

    if (parent.isBlank && parent.type !== POST_TYPE) {
      // If we removed the last child from a parent (e.g. the last li in a ul),
      // also remove the parent
      this.removeSection(parent);
    }
  }

  /**
   * A method for adding work the deferred queue
   *
   * @method schedule
   * @param {Function} callback to run during completion
   * @public
   */
  schedule(callback) {
    if (this._didComplete) {
      throw new Error('Work can only be scheduled before a post edit has completed');
    }
    this.addCallback(CALLBACK_QUEUES.COMPLETE, callback);
  }

  /**
   * Add a rerender job to the queue
   *
   * @method scheduleRerender
   * @public
   */
  scheduleRerender() {
    if (this._didScheduleRerender) { return; }

    this.schedule(() => this.editor.rerender());
    this._didScheduleRerender = true;
  }

  /**
   * Add a didUpdate job to the queue
   *
   * @method scheduleDidRender
   * @public
   */
  scheduleDidUpdate() {
    if (this._didScheduleUpdate) { return; }

    this.schedule(() => this.editor.didUpdate());
    this._didScheduleUpdate = true;
  }

  scheduleAfterRender(callback) {
    this.addCallback(CALLBACK_QUEUES.AFTER_COMPLETE, callback);
  }

  /**
   * Flush any work on the queue. `editor.run` already does this, calling this
   * method directly should not be needed outside `editor.run`.
   *
   * @method complete
   * @private
   */
  complete() {
    if (this._didComplete) {
      throw new Error('Post editing can only be completed once');
    }

    this.runCallbacks(CALLBACK_QUEUES.BEFORE_COMPLETE);
    this._didComplete = true;
    this.runCallbacks(CALLBACK_QUEUES.COMPLETE);
    this.runCallbacks(CALLBACK_QUEUES.AFTER_COMPLETE);
  }
}

mixin(PostEditor, LifecycleCallbacksMixin);

export default PostEditor;

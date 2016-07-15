import Position from '../utils/cursor/position';
import { forEach, reduce, filter, values, commonItems } from '../utils/array-utils';
import { DIRECTION } from '../utils/key';
import LifecycleCallbacks from '../models/lifecycle-callbacks';
import assert from '../utils/assert';
import { normalizeTagName } from '../utils/dom-utils';
import Range from '../utils/cursor/range';
import PostInserter from './post/post-inserter';

function isListSectionTagName(tagName) {
  return tagName === 'ul' || tagName === 'ol';
}

const CALLBACK_QUEUES = {
  BEFORE_COMPLETE: 'beforeComplete',
  COMPLETE: 'complete',
  AFTER_COMPLETE: 'afterComplete'
};

/**
 * The PostEditor is used to modify a post. It should not be instantiated directly.
 * Instead, a new instance of a PostEditor is created by the editor and passed
 * as the argument to the callback in {@link Editor#run}.
 *
 * Usage:
 * ```
 * editor.run((postEditor) => {
 *   // postEditor is an instance of PostEditor that can operate on the
 *   // editor's post
 * });
 * ```
 */
class PostEditor {
  /**
   * @private
   */
  constructor(editor) {
    this.editor = editor;
    this.builder = this.editor.builder;
    this._callbacks = new LifecycleCallbacks(values(CALLBACK_QUEUES));

    this._didComplete = false;

    this._renderRange = () => this.editor.selectRange(this._range);
    this._postDidChange = () => this.editor._postDidChange();
    this._rerender = () => this.editor.rerender();
  }

  addCallback(...args) {
    this._callbacks.addCallback(...args);
  }

  addCallbackOnce(...args) {
    this._callbacks.addCallbackOnce(...args);
  }

  runCallbacks(...args) {
    this._callbacks.runCallbacks(...args);
  }

  begin() {
    // cache the editor's range
    this._range = this.editor.range;
  }

  setRange(range) {
    // TODO validate that the range is valid
    // (does not contain marked-for-removal head or tail sections?)
    this._range = range;
    this.scheduleAfterRender(this._renderRange, true);
  }

  /**
   * Delete a range from the post
   *
   * Usage:
   * ```
   *     let { range } = editor;
   *     editor.run((postEditor) => {
   *       postEditor.deleteRange(range);
   *     });
   * ```
   * @param {Range} range Cursor Range object with head and tail Positions
   * @return {Position} The position where the cursor would go after deletion
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

    let {
      head: {section: headSection, offset: headSectionOffset},
      tail: {section: tailSection, offset: tailSectionOffset}
    } = range;
    const { post } = this.editor;

    let nextPosition;

    if (headSection === tailSection) {
      nextPosition = this.cutSection(headSection, headSectionOffset, tailSectionOffset);
    } else {
      let removedSections = post.sectionsContainedBy(range);
      let appendSection = headSection;

      post.walkLeafSections(range, section => {
        switch (section) {
          case headSection:
            if (section.isCardSection) {
              appendSection = this.builder.createMarkupSection();

              if (headSectionOffset === 0) {
                removedSections.push(section);
                nextPosition = appendSection.headPosition();
              } else {
                nextPosition = section.tailPosition();
              }
            } else {
              nextPosition = this.cutSection(section, headSectionOffset, section.length);
            }
            break;
          case tailSection:
            if (section.isCardSection) {
              if (tailSectionOffset === 1) {
                removedSections.push(section);
              }
            } else {
              section.markersFor(tailSectionOffset, section.text.length).forEach(m => {
                appendSection.markers.append(m);
              });
              this._markDirty(headSection); // May have added nodes
              removedSections.push(section);
            }
            break;
          default:
            if (removedSections.indexOf(section) === -1) {
              removedSections.push(section);
            }
          }
      });
      if (headSection !== appendSection) {
        this.insertSectionBefore(post.sections, appendSection, headSection.next);
      }
      removedSections.forEach(section => this.removeSection(section) );
    }

    return nextPosition;
  }

  /**
   * @return {Position}
   * @private
   */
  cutSection(section, headSectionOffset, tailSectionOffset) {
    if (section.isBlank || headSectionOffset === tailSectionOffset) {
      return new Position(section, headSectionOffset);
    }
    if (section.isCardSection) {
      let newSection = this.builder.createMarkupSection();
      this.replaceSection(section, newSection);
      return newSection.headPosition();
    }

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

    return new Position(section, headSectionOffset);
  }

  _coalesceMarkers(section) {
    if (section.isMarkerable) {
      this._removeBlankMarkers(section);
      this._joinSimilarMarkers(section);
    }
  }

  _removeBlankMarkers(section) {
    forEach(
      filter(section.markers, m => m.isBlank),
      m => this.removeMarker(m)
    );
  }

  // joins markers that have identical markups
  _joinSimilarMarkers(section) {
    let marker = section.markers.head;
    let nextMarker;
    while (marker && marker.next) {
      nextMarker = marker.next;

      if (marker.canJoin(nextMarker)) {
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
    let removedAdjacentToList = (postNode.prev && postNode.prev.isListSection) ||
                                (postNode.next && postNode.next.isListSection);
    if (removedAdjacentToList) {
      this.addCallback(
        CALLBACK_QUEUES.BEFORE_COMPLETE,
        () => this._joinContiguousListSections()
      );
    }
  }

  _joinContiguousListSections() {
    let { post } = this.editor;
    let range = this._range;
    let prev;
    let groups = [];
    let currentGroup;

    // FIXME do we need to force a re-render of the range if changed sections
    // are contained within the range?
    let updatedHead = null;
    forEach(post.sections, section => {
      if (prev &&
          prev.isListSection &&
          section.isListSection &&
          prev.tagName === section.tagName) {

        currentGroup = currentGroup || [prev];
        currentGroup.push(section);
      } else {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = null;
      }
      prev = section;
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    forEach(groups, group => {
      let list = group[0];
      forEach(group, listSection => {
        if (listSection !== list) {
          let currentHead = range.head;
          let prevPosition;
          // FIXME is there a currentHead if there is no range?
          // is the current head a list item in the section
          if (currentHead.section.isListItem &&
              currentHead.section.parent === listSection) {
            prevPosition = list.tailPosition();
          }
          this._joinListSections(list, listSection);
          if (prevPosition) {
            updatedHead = prevPosition.moveRight();
          }
        }
      });
    });

    if (updatedHead) {
      this.setRange(new Range(updatedHead, updatedHead, range.direction));
    }
  }

  _joinListSections(baseList, nextList) {
    baseList.join(nextList);
    this._markDirty(baseList);
    this.removeSection(nextList);
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
    if (postNode.isMarkerable) {
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

    assert('Cannot join non-markerable section to previous section',
           section.isMarkerable);

    if (section.isListItem) {
      let markupSection = this._changeSectionFromListItem(section, 'p');
      nextPosition = markupSection.headPosition();
    } else {
      const prevSection = section.previousLeafSection();

      if (prevSection) {
        if (prevSection.isCardSection) {
          if (section.isBlank) {
            this.removeSection(section);
          }
          nextPosition = prevSection.tailPosition();
        } else {
          const { beforeMarker } = prevSection.join(section);
          this._markDirty(prevSection);
          this.removeSection(section);

          nextPosition.section = prevSection;
          nextPosition.offset = beforeMarker ?
            prevSection.offsetOfMarker(beforeMarker, beforeMarker.length) : 0;
        }
      }
    }

    return nextPosition;
  }

  /**
   * delete 1 character in the FORWARD direction from the given position
   * @param {Position} position
   * @private
   */
  _deleteForwardFrom(position) {
    const { section } = position;

    if (section.isBlank) {
      // remove this section, focus on start of next markerable section
      const next = section.immediatelyNextMarkerableSection();
      if (next) {
        this.removeSection(section);
        position = next.headPosition();
      }
      return position;
    } else if (position.isTail()) {
      if (section.isCardSection)  {
        if (section.next && section.next.isBlank) {
          this.removeSection(section.next);
        }
        return position;
      } else {
        // join next markerable section to this one
        return this._joinPositionToNextSection(position);
      }
    } else {
      if (section.isCardSection && position.isHead()) {
        let newSection = this.builder.createMarkupSection();
        this.replaceSection(section, newSection);
        return newSection.headPosition();
      } else {
        return this._deleteForwardFromMarkerPosition(position.markerPosition);
      }
    }
  }

  _joinPositionToNextSection(position) {
    const { section } = position;

    assert('Cannot join non-markerable section to next section',
           section.isMarkerable);

    const next = section.immediatelyNextMarkerableSection();
    if (next) {
      section.join(next);
      this._markDirty(section);
      this.removeSection(next);
    }

    return position;
  }

  /**
   * delete 1 character forward from the markerPosition
   *
   * @param {Object} markerPosition
   * @param {Marker} markerPosition.marker
   * @param {number} markerPosition.offset
   * @return {Position} The position the cursor should be put after this deletion
   * @private
   */
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
        if (nextSection && nextSection.isMarkupSection) {
          const currentSection = marker.section;

          currentSection.join(nextSection);
          this._markDirty(currentSection);

          this.removeSection(nextSection);
        }
      }
    } else if (marker.isAtom) { // atoms are deleted "atomically"
      this.removeMarker(marker);
    } else {
      marker.deleteValueAtOffset(offset);
      this._markDirty(marker);
    }

    return nextPosition;
  }

  /**
   * delete 1 character in the BACKWARD direction from the given position
   * @param {Position} position
   * @return {Position} The position the cursor should be put after this deletion
   * @private
   */
  _deleteBackwardFrom(position) {
    const { section } = position;

    if (position.isHead()) {
      if (section.isCardSection) {
        if (section.prev && section.prev.isBlank) {
          this.removeSection(section.prev);
        }
        return position;
      } else {
        return this._joinPositionToPreviousSection(position);
      }
    }

    // if position is end of a card, replace the card with a blank markup section
    if (section.isCardSection) {
      let newSection = this.builder.createMarkupSection();
      this.replaceSection(section, newSection);
      return newSection.headPosition();
    }

    let nextPosition = position.moveLeft();

    const { marker, offset:markerOffset } = position.markerPosition;
    const offsetToDeleteAt = markerOffset - 1;

    if (marker.isAtom) {
      this.removeMarker(marker);
    } else {
      marker.deleteValueAtOffset(offsetToDeleteAt);
      this._markDirty(marker);
    }

    return nextPosition;
  }

  /**
   * Split markers at two positions, once at the head, and if necessary once
   * at the tail. This method is designed to accept a range
   * (e.g. `editor.range`) as an argument.
   *
   * Usage:
   * ```
   *     let markerRange = this.cursor.offsets;
   *     editor.run((postEditor) => {
   *       postEditor.splitMarkers(markerRange);
   *     });
   * ```
   * The return value will be marker object completely inside the offsets
   * provided. Markers on the outside of the split may also have been modified.
   *
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
   * Split the section at the position.
   *
   * Usage:
   * ```
   *     let position = editor.cursor.offsets.head;
   *     editor.run((postEditor) => {
   *       postEditor.splitSection(position);
   *     });
   *     // Will result in the creation of two new sections
   *     // replacing the old one at the cursor position
   * ```
   * The return value will be the two new sections. One or both of these
   * sections can be blank (contain only a blank marker), for example if the
   * headMarkerOffset is 0.
   *
   * @param {Position} position
   * @return {Array} new sections, one for the first half and one for the second
   * @public
   */
  splitSection(position) {
    const { section } = position;

    if (section.isCardSection) {
      return this._splitCardSection(section, position);
    } else if (section.isListItem) {
      let isLastAndBlank = section.isBlank && !section.next;
      if (isLastAndBlank) {
        // if is last, replace the item with a blank markup section
        let parent = section.parent;
        let collection = this.editor.post.sections;
        let blank = this.builder.createMarkupSection();
        this.removeSection(section);
        this.insertSectionBefore(collection, blank, parent.next);

        return [null, blank];
      } else {
        let [pre, post] = this._splitListItem(section, position);
        return [pre, post];
      }
    } else {
      let splitSections = section.splitAtPosition(position);
      splitSections.forEach(s => this._coalesceMarkers(s));
      this._replaceSection(section, splitSections);

      return splitSections;
    }
  }

  /**
   * @param {Section} cardSection
   * @param {Position} position to split at
   * @return {Section[]} 2-item array of pre and post-split sections
   * @private
   */
  _splitCardSection(cardSection, position) {
    let { offset } = position;
    assert('Cards section must be split at offset 0 or 1',
           offset === 0 || offset === 1);

    let newSection = this.builder.createMarkupSection();
    let nextSection;
    let surroundingSections;

    if (offset === 0) {
      nextSection = cardSection;
      surroundingSections = [newSection, cardSection];
    } else {
      nextSection = cardSection.next;
      surroundingSections = [cardSection, newSection];
    }

    let collection = this.editor.post.sections;
    this.insertSectionBefore(collection, newSection, nextSection);

    return surroundingSections;
  }

  /**
   * @param {Section} section
   * @param {Section} newSection
   * @return null
   * @public
   */
  replaceSection(section, newSection) {
    if (!section) {
      // FIXME should a falsy section be a valid argument?
      this.insertSectionBefore(this.editor.post.sections, newSection, null);
    } else {
      this._replaceSection(section, [newSection]);
    }
  }

  moveSectionBefore(collection, renderedSection, beforeSection) {
    const newSection = renderedSection.clone();
    this.removeSection(renderedSection);
    this.insertSectionBefore(collection, newSection, beforeSection);
    return newSection;
  }

  /**
   * @param {Section} section A section that is already in DOM
   * @public
   */
  moveSectionUp(renderedSection) {
    const isFirst = !renderedSection.prev;
    if (isFirst) {
      return renderedSection;
    }

    const collection = renderedSection.parent.sections;
    const beforeSection = renderedSection.prev;
    return this.moveSectionBefore(collection, renderedSection, beforeSection);
  }

  /**
   * @param {Section} section A section that is already in DOM
   * @public
   */
  moveSectionDown(renderedSection) {
    const isLast = !renderedSection.next;
    if (isLast) {
      return renderedSection;
    }

    const beforeSection = renderedSection.next.next;
    const collection = renderedSection.parent.sections;
    return this.moveSectionBefore(collection, renderedSection, beforeSection);
  }

  /**
   * Insert an array of markers at the given position. If the position is in
   * a non-markerable section (like a card section), this method throws an error.
   *
   * @param {Position} position
   * @param {Marker[]} markers
   * @return {Position} The position that represents the end of the inserted markers.
   * @public
   */
  insertMarkers(position, markers) {
    let { section, offset } = position;
    assert('Cannot insert markers at non-markerable position',
           section.isMarkerable);

    let edit = section.splitMarkerAtOffset(offset);
    edit.removed.forEach(marker => this._scheduleForRemoval(marker));

    let prevMarker = section.markerBeforeOffset(offset);
    markers.forEach(marker => {
      section.markers.insertAfter(marker, prevMarker);
      offset += marker.length;
      prevMarker = marker;
    });

    this._coalesceMarkers(section);
    this._markDirty(section);

    let nextPosition = new Position(position.section, offset);
    this.setRange(new Range(nextPosition));
    return nextPosition;
  }

  /**
   * Inserts text with the given markups, ignoring the existing markups at
   * the position, if any.
   *
   * @param {Position} position
   * @param {String} text
   * @param {Markup[]} markups
   * @return {Position} position at the end of the inserted text
   */
  insertTextWithMarkup(position, text, markups=[]) {
    let { section } = position;
    if (!section.isMarkerable) { return; }
    let marker = this.builder.createMarker(text, markups);
    return this.insertMarkers(position, [marker]);
  }

  /**
   * Insert the text at the given position
   * Inherits the markups already at that position, if any.
   *
   * @param {Position} position
   * @param {String} text
   * @return {Position} position at the end of the inserted text.
   */
  insertText(position, text) {
    let { section } = position;
    if (!section.isMarkerable) { return; }
    let markups = position.marker && position.marker.markups;
    markups = markups || [];
    return this.insertTextWithMarkup(position, text, markups);
  }

  _replaceSection(section, newSections) {
    let nextSection = section.next;
    let collection = section.parent.sections;

    let nextNewSection = newSections[0];
    if (nextNewSection.isMarkupSection && section.isListItem) {
      // put the new section after the ListSection (section.parent)
      // instead of after the ListItem
      collection = section.parent.parent.sections;
      nextSection = section.parent.next;
    }

    newSections.forEach(s => this.insertSectionBefore(collection, s, nextSection));
    this.removeSection(section);
  }

  /**
   * Given a markerRange (for example `editor.range`) mark all markers
   * inside it as a given markup. The markup must be provided as a post
   * abstract node.
   *
   * Usage:
   *
   *     let range = editor.range;
   *     let strongMarkup = editor.builder.createMarkup('strong');
   *     editor.run((postEditor) => {
   *       postEditor.addMarkupToRange(range, strongMarkup);
   *     });
   *     // Will result some markers possibly being split, and the markup
   *     // being applied to all markers between the split.
   *
   * @param {Range} range
   * @param {Markup} markup A markup post abstract node
   * @public
   */
  addMarkupToRange(range, markup) {
    if (range.isCollapsed) {
      return;
    }

    let markers = this.splitMarkers(range);
    if (markers.length) {
      // We insert the new markup at a consistent index across the range.
      // If we just push on the end of the list, it can end up in different positions
      // of the markup stack. This results in unnecessary closing and re-opening of
      // the markup each time it changes position.
      // If we just push it at the beginning of the list, this causes unnecessary closing
      // and re-opening of surrounding tags.
      // So, we look for any tags open across the whole range, and push into the stack
      // at the end of those.
      // Prompted by https://github.com/bustlelabs/mobiledoc-kit/issues/360

      let markupsOpenAcrossRange = reduce(markers, function (soFar, marker) {
        return commonItems(soFar, marker.markups);
      }, markers[0].markups);
      let indexToInsert = markupsOpenAcrossRange.length;

      markers.forEach(marker => {
        marker.addMarkupAtIndex(markup, indexToInsert);
        this._markDirty(marker);
      });
    }
  }

  /**
   * Given a markerRange (for example `editor.range`) remove the given
   * markup from all contained markers.
   *
   * Usage:
   * ```
   *     let { range } = editor;
   *     let markup = markerRange.headMarker.markups[0];
   *     editor.run(postEditor => {
   *       postEditor.removeMarkupFromRange(range, markup);
   *     });
   *     // Will result in some markers possibly being split, and the markup
   *     // being removed from all markers between the split.
   * ```
   * @param {Range} range Object with offsets
   * @param {Markup|Function} markupOrCallback A markup post abstract node or
   * a function that returns true when passed a markup that should be removed
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
   * Toggle the given markup on the current selection. If anything in the current
   * selection has the markup, the markup will be removed from it. If nothing in the selection
   * has the markup, the markup will be added to everything in the selection.
   *
   * Usage:
   * ```
   * // Remove any 'strong' markup if it exists in the selection, otherwise
   * // make it all 'strong'
   * editor.run(postEditor => postEditor.toggleMarkup('strong'));
   *
   * // add/remove a link to 'bustle.com' to the selection
   * editor.run(postEditor => {
   *   const linkMarkup = postEditor.builder.createMarkup('a', {href: 'http://bustle.com'});
   *   postEditor.toggleMarkup(linkMarkup);
   * });
   * ```
   * @param {Markup|String} markupOrString Either a markup object created using
   * the builder (useful when adding a markup with attributes, like an 'a' markup),
   * or, if a string, the tag name of the markup (e.g. 'strong', 'em') to toggle.
   * @param {Range} range in which to toggle, defaults to current editor range
   * @public
   */
  toggleMarkup(markupOrMarkupString, range=this._range) {
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

    this.setRange(range);
  }

  /**
   * Toggles the tagName of the active section or sections.
   * If every section has the tag name, they will all be reset to default sections.
   * Otherwise, every section will be changed to the requested type
   *
   * @param {String} sectionTagName A valid markup section or
   *        list section tag name (e.g. 'blockquote', 'h2', 'ul')
   * @param {Range} range The range over which to toggle.
   *        Defaults to the current editor's offsets
   * @public
   */
  toggleSection(sectionTagName, range=this._range) {
    sectionTagName = normalizeTagName(sectionTagName);
    let { post } = this.editor;
    let nextRange = range;

    let everySectionHasTagName = true;
    post.walkMarkerableSections(range, section => {
      if (!this._isSameSectionType(section, sectionTagName)) {
        everySectionHasTagName = false;
      }
    });

    let tagName = everySectionHasTagName ? 'p' : sectionTagName;
    let firstChanged;
    post.walkMarkerableSections(range, section => {
      let changedSection = this.changeSectionTagName(section, tagName);
      firstChanged = firstChanged || changedSection;
    });

    if (firstChanged) {
      nextRange = new Range(firstChanged.headPosition());
    }
    this.setRange(nextRange);
  }

  _isSameSectionType(section, sectionTagName) {
    return section.isListItem ?
      section.parent.tagName === sectionTagName :
      section.tagName        === sectionTagName;
  }

  /**
   * @param {Markerable} section
   * @private
   */
  changeSectionTagName(section, newTagName) {
    assert('Cannot pass non-markerable section to `changeSectionTagName`',
           section.isMarkerable);

    if (isListSectionTagName(newTagName)) {
      return this._changeSectionToListItem(section, newTagName);
    } else if (section.isListItem) {
      return this._changeSectionFromListItem(section, newTagName);
    } else {
      section.tagName = newTagName;
      this._markDirty(section);
      return section;
    }
  }

  /**
   * Splits the item at the position given.
   * If thse position is at the start or end of the item, the pre- or post-item
   * will contain a single empty ("") marker.
   * @return {Array} the pre-item and post-item on either side of the split
   * @private
   */
  _splitListItem(item, position) {
    let { section, offset } = position;
    assert('Cannot split list item at position that does not include item',
           item === section);

    item.splitMarkerAtOffset(offset);
    let prevMarker = item.markerBeforeOffset(offset);
    let preItem  = this.builder.createListItem(),
        postItem = this.builder.createListItem();

    let currentItem = preItem;
    item.markers.forEach(marker => {
      currentItem.markers.append(marker.clone());
      if (marker === prevMarker) {
        currentItem = postItem;
      }
    });
    this._replaceSection(item, [preItem, postItem]);
    return [preItem, postItem];
  }

  /**
   * Splits the list at the position given.
   * @return {Array} pre-split list and post-split list, either of which could
   * be blank (0-item list) if the position is at the start or end of the list.
   *
   * Note: Contiguous list sections will be joined in the before_complete queue
   * of the postEditor.
   *
   * @private
   */
  _splitListAtPosition(list, position) {
    assert('Cannot split list at position not in list',
           position.section.parent === list);

    let positionIsMiddle = !position.isHead() && !position.isTail();
    if (positionIsMiddle) {
      let item = position.section;
      let [pre, post] = // jshint ignore:line
        this._splitListItem(item, position);
      position = pre.tailPosition();
    }

    let positionIsStart = position.isEqual(list.headPosition()),
        positionIsEnd   = position.isEqual(list.tailPosition());

    if (positionIsStart || positionIsEnd) {
      let blank = this.builder.createListSection(list.tagName);
      let reference = position.isEqual(list.headPosition()) ? list :
                                                              list.next;
      let collection = this.editor.post.sections;
      this.insertSectionBefore(collection, blank, reference);

      let lists = positionIsStart ? [blank, list] : [list, blank];
      return lists;
    } else {
      let preList  = this.builder.createListSection(list.tagName),
          postList = this.builder.createListSection(list.tagName);
      let preItem = position.section;
      let currentList = preList;
      list.items.forEach(item => {
        currentList.items.append(item.clone());
        if (item === preItem) {
          currentList = postList;
        }
      });

      this._replaceSection(list, [preList, postList]);
      return [preList, postList];
    }
  }

  /**
   * @return Array of [prev, mid, next] lists. `prev` and `next` can
   *         be blank, depending on the position of `item`. `mid` will always
   *         be a 1-item list containing `item`. `prev` and `next` will be
   *         removed in the before_complete queue if they are blank
   *         (and still attached).
   *
   * @private
   */
  _splitListAtItem(list, item) {
    let next = list;
    let prev = this.builder.createListSection(next.tagName);
    let mid = this.builder.createListSection(next.tagName);

    let addToPrev = true;
    // must turn the LinkedList into an array so that we can remove items
    // as we iterate through it
    let items = next.items.toArray();
    items.forEach(i => {
      let listToAppend;
      if (i === item) {
        addToPrev    = false;
        listToAppend = mid;
      } else if (addToPrev) {
        listToAppend = prev;
      } else {
        return; // break after iterating prev and mid parts of the list
      }
      listToAppend.join(i);
      this.removeSection(i);
    });
    let found = !addToPrev;
    assert('Cannot split list at item that is not present in the list', found);

    let collection = this.editor.post.sections;
    this.insertSectionBefore(collection, mid, next);
    this.insertSectionBefore(collection, prev, mid);

    // Remove possibly blank prev/next lists
    this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, () => {
      [prev, next].forEach(_list => {
        let isAttached = !!_list.parent;
        if (_list.isBlank && isAttached) {
          this.removeSection(_list);
        }
      });
    });

    return [prev, mid, next];
  }

  _changeSectionFromListItem(section, newTagName) {
    assert('Must pass list item to `_changeSectionFromListItem`',
           section.isListItem);

    let listSection = section.parent;
    let markupSection = this.builder.createMarkupSection(newTagName);
    markupSection.join(section);

    let [prev, mid, next] = this._splitListAtItem(listSection, section); // jshint ignore:line
    this.replaceSection(mid, markupSection);
    return markupSection;
  }

  _changeSectionToListItem(section, newTagName) {
    let isAlreadyCorrectListItem = section.isListItem &&
      section.parent.tagName === newTagName;

    if (isAlreadyCorrectListItem) {
      return section;
    }

    let listSection = this.builder.createListSection(newTagName);
    listSection.join(section);

    let sectionToReplace;
    if (section.isListItem) {
      let [prev, mid, next] = this._splitListAtItem(section.parent, section); // jshint ignore:line
      sectionToReplace = mid;
    } else {
      sectionToReplace = section;
    }
    this.replaceSection(sectionToReplace, listSection);
    return listSection;
  }

  /**
   * Insert a given section before another one, updating the post abstract
   * and the rendered UI.
   *
   * Usage:
   * ```
   *     let markerRange = editor.range;
   *     let sectionWithCursor = markerRange.headMarker.section;
   *     let section = editor.builder.createCardSection('my-image');
   *     let collection = sectionWithCursor.parent.sections;
   *     editor.run((postEditor) => {
   *       postEditor.insertSectionBefore(collection, section, sectionWithCursor);
   *     });
   * ```
   * @param {LinkedList} collection The list of sections to insert into
   * @param {Object} section The new section
   * @param {Object} beforeSection Optional The section "before" is relative to,
   *        if falsy the new section will be appended to the collection
   * @public
   */
  insertSectionBefore(collection, section, beforeSection) {
    collection.insertBefore(section, beforeSection);
    this._markDirty(section.parent);
  }

  /**
   * Insert the given section after the current active section, or, if no
   * section is active, at the end of the document.
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
   * @param {Section} section
   * @public
   */
  insertSectionAtEnd(section) {
    this.insertSectionBefore(this.editor.post.sections, section, null);
  }

  /**
   * Insert the `post` at the given position in the editor's post.
   * @param {Position} position
   * @param {Post} post
   * @private
   */
  insertPost(position, newPost) {
    let post = this.editor.post;
    let inserter = new PostInserter(this, post);
    let nextPosition = inserter.insert(position, newPost);
    return nextPosition;
  }

  /**
   * Remove a given section from the post abstract and the rendered UI.
   *
   * Usage:
   * ```
   *     let { range } = editor;
   *     let sectionWithCursor = range.head.section;
   *     editor.run((postEditor) => {
   *       postEditor.removeSection(sectionWithCursor);
   *     });
   * ```
   * @param {Object} section The section to remove
   * @public
   */
  removeSection(section) {
    let parent          = section.parent;
    this._scheduleForRemoval(section);
    parent.sections.remove(section);

    if (parent.isListSection) {
      this._scheduleListRemovalIfEmpty(parent);
    }
  }

  removeAllSections() {
    this.editor.post.sections.toArray().forEach(section => {
      this.removeSection(section);
    });
  }

  migrateSectionsFromPost(post) {
    post.sections.toArray().forEach(section => {
      post.sections.remove(section);
      this.insertSectionBefore(this.editor.post.sections, section, null);
    });
  }

  _scheduleListRemovalIfEmpty(listSection) {
    this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, () => {
      // if the list is attached and blank after we do other rendering stuff,
      // remove it
      let isAttached = !!listSection.parent;
      if (isAttached && listSection.isBlank) {
        this.removeSection(listSection);
      }
    });
  }

  /**
   * A method for adding work the deferred queue
   *
   * @param {Function} callback to run during completion
   * @param {Boolean} [once=false] Whether to only schedule the callback once.
   * @public
   */
  schedule(callback, once=false) {
    assert('Work can only be scheduled before a post edit has completed',
           !this._didComplete);
    if (once) {
      this.addCallbackOnce(CALLBACK_QUEUES.COMPLETE, callback);
    } else {
      this.addCallback(CALLBACK_QUEUES.COMPLETE, callback);
    }
  }

  /**
   * A method for adding work the deferred queue. The callback will only
   * be added to the queue once, even if `scheduleOnce` is called multiple times.
   * The function cannot be an anonymous function.
   *
   * @param {Function} callback to run during completion
   * @public
   */
  scheduleOnce(callback) {
    this.schedule(callback, true);
  }

  /**
   * Add a rerender job to the queue
   *
   * @public
   */
  scheduleRerender() {
    this.scheduleOnce(this._rerender);
  }

  /**
   * Schedule a notification that the post has been changed.
   * The notification will result in the editor firing its `postDidChange`
   * hook after the postEditor completes its work (at the end of {@link Editor#run}).
   *
   * @public
   */
  scheduleDidUpdate() {
    this.scheduleOnce(this._postDidChange);
  }

  scheduleAfterRender(callback, once=false) {
    if (once) {
      this.addCallbackOnce(CALLBACK_QUEUES.AFTER_COMPLETE, callback);
    } else {
      this.addCallback(CALLBACK_QUEUES.AFTER_COMPLETE, callback);
    }
  }

  /**
   * Flush any work on the queue. {@link Editor#run} calls this method; it
   * should not be called directly.
   *
   * @private
   */
  complete() {
    assert('Post editing can only be completed once', !this._didComplete);

    this.runCallbacks(CALLBACK_QUEUES.BEFORE_COMPLETE);
    this._didComplete = true;
    this.runCallbacks(CALLBACK_QUEUES.COMPLETE);
    this.runCallbacks(CALLBACK_QUEUES.AFTER_COMPLETE);
  }

  undoLastChange() {
    this.editor._editHistory.stepBackward(this);
  }

  redoLastChange() {
    this.editor._editHistory.stepForward(this);
  }

  cancelSnapshot() {
    this._shouldCancelSnapshot = true;
  }
}

export default PostEditor;

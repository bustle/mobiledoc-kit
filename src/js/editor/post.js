import { MARKUP_SECTION_TYPE } from '../models/markup-section';
import { LIST_ITEM_TYPE } from '../models/list-item';
import {
  filter,
  compact
} from '../utils/array-utils';

import { DIRECTION } from '../utils/key';

function isMarkupSection(section) {
  return section.type === MARKUP_SECTION_TYPE;
}

function isListItem(section) {
  return section.type === LIST_ITEM_TYPE;
}

function isBlankAndListItem(section) {
  return isListItem(section) && section.isBlank;
}

class PostEditor {
  constructor(editor) {
    this.editor = editor;
    this.builder = this.editor.builder;
    this._completionWorkQueue = [];
    this._didRerender = false;
    this._didUpdate = false;
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
      let removedSections = [];
      post.walkMarkerableSections(range, section => {
        switch (section) {
          case headSection:
            this.cutSection(section, headSectionOffset, section.text.length);
            break;
          case tailSection:
            tailSection.markersFor(tailSectionOffset, section.text.length).forEach(m => {
              headSection.markers.append(m);
            });
            headSection.renderNode.markDirty(); // May have added nodes
            removedSections.push(tailSection);
            break;
          default:
            removedSections.push(section);
          }
      });
      removedSections.forEach(section => this.removeSection(section) );
    }

    this._coalesceMarkers(headSection);

    this.scheduleRerender();
    this.scheduleDidUpdate();
  }

  cutSection(section, headSectionOffset, tailSectionOffset) {
    if (section.markers.isEmpty) {
      return;
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
  }

  removeMarkerRange(headMarker, tailMarker) {
    let marker = headMarker;
    while (marker) {
      let nextMarker = marker.next;
      this.removeMarker(marker);
      if (marker === tailMarker) {
        break;
      }
      marker = nextMarker;
    }
  }

  _coalesceMarkers(section) {
    filter(section.markers, m => m.isEmpty).forEach(marker => {
      this.removeMarker(marker);
    });
  }

  removeMarker(marker) {
    let didChange = false;
    if (marker.renderNode) {
      marker.renderNode.scheduleForRemoval();
      didChange = true;
    }
    if (marker.section) {
      marker.section.markers.remove(marker);
      didChange = true;
    }

    if (didChange) {
      this.scheduleRerender();
      this.scheduleDidUpdate();
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
   * @param {Object} position object with {section, offset} the marker and offset to delete from
   * @param {Number} direction The direction to delete in (default is BACKWARD)
   * @return {Object} {currentSection, currentOffset} for positioning the cursor
   * @public
   */
  deleteFrom({section, offset}, direction=DIRECTION.BACKWARD) {
    if (section.markers.length) {
      // {{marker, offset}}
      let result = section.markerPositionAtOffset(offset);
      if (direction === DIRECTION.BACKWARD) {
        return this._deleteBackwardFrom(result);
      } else {
        return this._deleteForwardFrom(result);
      }
    } else {
      if (direction === DIRECTION.BACKWARD) {
        if (isMarkupSection(section) && section.prev) {
          let prevSection = section.prev;
          prevSection.join(section);
          prevSection.renderNode.markDirty();
          this.removeSection(section);
          this.scheduleRerender();
          this.scheduleDidUpdate();
          return { currentSection: prevSection, currentOffset: prevSection.text.length };
        } else if (isListItem(section)) {
          this.scheduleRerender();
          this.scheduleDidUpdate();

          const results = this._convertListItemToMarkupSection(section);
          return {currentSection: results.section, currentOffset: results.offset};
        }
      } else if (section.prev || section.next) {
        let nextSection = section.next || section.post.tail;
        this.removeSection(section);
        return { currentSection: nextSection, currentOffset: 0 };
      }
    }
  }

  /**
   * delete 1 character in the FORWARD direction from the given position
   * @method _deleteForwardFrom
   * @private
   */
  _deleteForwardFrom({marker, offset}) {
    const nextCursorSection = marker.section,
          nextCursorOffset = nextCursorSection.offsetOfMarker(marker, offset);

    if (offset === marker.length) {
      const nextMarker = marker.next;

      if (nextMarker) {
        this._deleteForwardFrom({marker: nextMarker, offset: 0});
      } else {
        const nextSection = marker.section.next;
        if (nextSection && isMarkupSection(nextSection)) {
          const currentSection = marker.section;

          currentSection.join(nextSection);
          currentSection.renderNode.markDirty();

          this.removeSection(nextSection);
        }
      }
    } else {
      marker.deleteValueAtOffset(offset);
      marker.renderNode.markDirty();
      this._coalesceMarkers(marker.section);
    }

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return {
      currentSection: nextCursorSection,
      currentOffset: nextCursorOffset
    };
  }

  _convertListItemToMarkupSection(listItem) {
    const listSection = listItem.parent;

    const newSections = listItem.splitIntoSections();
    const newMarkupSection = newSections[1];

    this._replaceSection(listSection, compact(newSections));

    const newCursorPosition = {
      section: newMarkupSection,
      offset: 0
    };
    return newCursorPosition;
  }

  /**
   * delete 1 character in the BACKWARD direction from the given position
   * @method _deleteBackwardFrom
   * @private
   */
  _deleteBackwardFrom({marker, offset}) {
    let nextCursorSection = marker.section,
        nextCursorOffset = nextCursorSection.offsetOfMarker(marker, offset);

    if (offset === 0) {
      const prevMarker = marker.prev;

      if (prevMarker) {
        return this._deleteBackwardFrom({marker: prevMarker, offset: prevMarker.length});
      } else {
        const section = marker.section;

        if (isListItem(section)) {
          const newCursorPos = this._convertListItemToMarkupSection(section);
          nextCursorSection = newCursorPos.section;
          nextCursorOffset = newCursorPos.offset;
        } else {
          const prevSection = section.prev;
          if (prevSection && isMarkupSection(prevSection)) {
            nextCursorSection = prevSection;
            nextCursorOffset = prevSection.text.length;

            let {
              beforeMarker
            } = prevSection.join(marker.section);
            prevSection.renderNode.markDirty();
            this.removeSection(marker.section);

            nextCursorSection = prevSection;

            if (beforeMarker) {
              nextCursorOffset = prevSection.offsetOfMarker(beforeMarker, beforeMarker.length);
            } else {
              nextCursorOffset = 0;
            }
          }
        }
      }

    } else if (offset <= marker.length) {
      const offsetToDeleteAt = offset - 1;
      marker.deleteValueAtOffset(offsetToDeleteAt);
      nextCursorOffset--;
      marker.renderNode.markDirty();
      this._coalesceMarkers(marker.section);
    }

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return {
      currentSection: nextCursorSection,
      currentOffset: nextCursorOffset
    };
  }

  /**
   * Split markers at two positions, once at the head, and if necessary once
   * at the tail. This method is designed to accept `editor.cursor.offsets`
   * as an argument.
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
   * @param {Object} markerRange Object with offsets, {headMarker, headMarkerOffset, tailMarker, tailMarkerOffset}
   * @return {Array} of markers that are inside the split
   * @public
   */
  splitMarkers({headMarker, headMarkerOffset, tailMarker, tailMarkerOffset}) {
    const { post } = this.editor;
    let selectedMarkers = [];

    let headSection = headMarker.section;
    let tailSection = tailMarker.section;

    // These render will be removed by the split functions. Mark them
    // for removal before doing that. FIXME this seems prime for
    // refactoring onto the postEditor as a split function
    headMarker.renderNode.scheduleForRemoval();
    tailMarker.renderNode.scheduleForRemoval();
    headMarker.section.renderNode.markDirty();
    tailMarker.section.renderNode.markDirty();

    if (headMarker === tailMarker) {
      let markers = headSection.splitMarker(headMarker, headMarkerOffset, tailMarkerOffset);
      selectedMarkers = post.markersInRange({
        headMarker: markers[0],
        tailMarker: markers[markers.length-1],
        headMarkerOffset,
        tailMarkerOffset
      });
    } else {
      let newHeadMarkers = headSection.splitMarker(headMarker, headMarkerOffset);
      let selectedHeadMarkers = post.markersInRange({
        headMarker: newHeadMarkers[0],
        tailMarker: newHeadMarkers[newHeadMarkers.length-1],
        headMarkerOffset
      });

      let newTailMarkers = tailSection.splitMarker(tailMarker, 0, tailMarkerOffset);
      let selectedTailMarkers = post.markersInRange({
        headMarker: newTailMarkers[0],
        tailMarker: newTailMarkers[newTailMarkers.length-1],
        headMarkerOffset: 0,
        tailMarkerOffset
      });

      let newHeadMarker = selectedHeadMarkers[0],
          newTailMarker = selectedTailMarkers[selectedTailMarkers.length - 1];

      let newMarkers = [];
      if (newHeadMarker) {
        newMarkers.push(newHeadMarker);
      }
      if (newTailMarker) {
        newMarkers.push(newTailMarker);
      }

      if (newMarkers.length) {
        this.editor.post.markersFrom(newMarkers[0], newMarkers[newMarkers.length-1], m => {
          selectedMarkers.push(m);
        });
      }
    }

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return selectedMarkers;
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
      if (marker.renderNode) {
        marker.renderNode.scheduleForRemoval();
      }
      if (section.renderNode) {
        section.renderNode.markDirty();
      }
    }
    this.scheduleRerender();
    this.scheduleDidUpdate();
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

    this.scheduleRerender();
    this.scheduleDidUpdate();

    // FIXME we must return 2 sections because other code expects this to always return 2
    return newSections;
  }

  /**
   * @public
   * FIXME: add tests for this
   */
  replaceSection(section, newSection) {
    return this._replaceSection(section, [newSection]);
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
   *     let markerRange = editor.cursor.offsets;
   *     let strongMarkup = editor.builder.createMarkup('strong');
   *     editor.run((postEditor) => {
   *       postEditor.applyMarkupToMarkers(markerRange, strongMarkup);
   *     });
   *     // Will result some markers possibly being split, and the markup
   *     // being applied to all markers between the split.
   *
   * The return value will be all markers between the split, the same return
   * value as `splitMarkers`.
   *
   * @method applyMarkupToMarkers
   * @param {Object} markerRange Object with offsets
   * @param {Object} markup A markup post abstract node
   * @return {Array} of markers that are inside the split
   * @public
   */
  applyMarkupToMarkers(markerRange, markup) {
    const markers = this.splitMarkers(markerRange);
    markers.forEach(marker => {
      marker.addMarkup(markup);
      marker.section.renderNode.markDirty();
    });

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return markers;
  }

  /**
   * Given a markerRange (for example `editor.cursor.offsets`) remove the given
   * markup from all contained markers. The markup must be provided as a post
   * abstract node.
   *
   * Usage:
   *
   *     let markerRange = editor.cursor.offsets;
   *     let markup = markerRange.headMarker.markups[0];
   *     editor.run((postEditor) => {
   *       postEditor.removeMarkupFromMarkers(markerRange, markup);
   *     });
   *     // Will result some markers possibly being split, and the markup
   *     // being removed from all markers between the split.
   *
   * The return value will be all markers between the split, the same return
   * value as `splitMarkers`.
   *
   * @method removeMarkupFromMarkers
   * @param {Object} markerRange Object with offsets
   * @param {Object} markup A markup post abstract node
   * @return {Array} of markers that are inside the split
   * @public
   */
  removeMarkupFromMarkers(markerRange, markupOrMarkupCallback) {
    const markers = this.splitMarkers(markerRange);
    markers.forEach(marker => {
      marker.removeMarkup(markupOrMarkupCallback);
      marker.section.renderNode.markDirty();
    });

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return markers;
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
   * @param {Object} beforeSection The section "before" is relative to
   * @public
   */
  insertSectionBefore(collection, section, beforeSection) {
    collection.insertBefore(section, beforeSection);
    section.parent.renderNode.markDirty();

    this.scheduleRerender();
    this.scheduleDidUpdate();
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
    section.renderNode.scheduleForRemoval();

    const parent = section.parent;
    parent.sections.remove(section);

    if (parent.isBlank) {
      this.removeSection(parent);
    }

    this.scheduleRerender();
    this.scheduleDidUpdate();
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
    this._completionWorkQueue.push(callback);
  }

  /**
   * Add a rerender job to the queue
   *
   * @method scheduleRerender
   * @public
   */
  scheduleRerender() {
    this.schedule(() => {
      if (!this._didRerender) {
        this._didRerender = true;
        this.editor.rerender();
      }
    });
  }

  /**
   * Add a didUpdate job to the queue
   *
   * @method scheduleDidRender
   * @public
   */
  scheduleDidUpdate() {
    this.schedule(() => {
      if (!this._didUpdate) {
        this._didUpdate = true;
        this.editor.didUpdate();
      }
    });
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
    this._didComplete = true;
    this._completionWorkQueue.forEach(callback => {
      callback();
    });
  }
}

export default PostEditor;

import { MARKUP_SECTION_TYPE } from '../models/markup-section';
import {
  filter
} from '../utils/array-utils';

import { DIRECTION } from '../utils/key';

function isMarkupSection(section) {
  return section.type === MARKUP_SECTION_TYPE;
}

class PostEditor {
  constructor(editor) {
    this.editor = editor;
    this._completionWorkQueue = [];
    this._didRerender = false;
    this._didUpdate = false;
    this._didComplete = false;
  }

  /**
   * Remove a range of markers from the post.
   *
   * Usage:
   *
   *     let marker = editor.post.sections.head.markers.head;
   *     editor.run((postEditor) => {
   *       postEditor.deleteRange({
   *         headMarker: marker,
   *         headOffset: 2,
   *         tailMarker: marker,
   *         tailOffset: 4,
   *       });
   *     });
   *
   * `deleteRange` accepts the value of `this.cursor.offsets` for deletion.
   *
   * @method deleteRange
   * @param {Object} markerRange Object with offsets, {headMarker, headOffset, tailMarker, tailOffset}
   * @return {Object} {currentMarker, currentOffset} for cursor
   * @public
   */
  deleteRange(markerRange) {
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

    // markerRange should be akin to this.cursor.offset
    const {headSection, headSectionOffset, tailSection, tailSectionOffset} = markerRange;
    const {post} = this.editor;

    if (headSection === tailSection) {
      this.cutSection(headSection, headSectionOffset, tailSectionOffset);
    } else {
      let removedSections = [];
      post.sections.walk(headSection, tailSection, section => {
        switch (section) {
          case headSection:
            this.cutSection(section, headSectionOffset, section.text.length);
            break;
          case tailSection:
            tailSection.markersFor(tailSectionOffset, section.text.length).forEach(m => {
              headSection.markers.append(m);
            });
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
    const {marker:headMarker, offset:headOffset} = section.markerPositionAtOffset(headSectionOffset);
    const {marker:tailMarker, offset:tailOffset} = section.markerPositionAtOffset(tailSectionOffset);
    const markers = this.splitMarkers({headMarker, headOffset, tailMarker, tailOffset});
    section.markers.removeBy(m => {
      return markers.indexOf(m) !== -1;
    });
  }

  _coalesceMarkers(section) {
    let {builder} = this.editor;
    filter(section.markers, m => m.isEmpty).forEach(m => {
      this.removeMarker(m);
    });
    if (section.markers.isEmpty) {
      section.markers.append(builder.createBlankMarker());
      section.renderNode.markDirty();
    }
  }

  removeMarker(marker) {
    if (marker.renderNode) {
      marker.renderNode.scheduleForRemoval();
    }
    marker.section.markers.remove(marker);

    this.scheduleRerender();
    this.scheduleDidUpdate();
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
   *       postEditor.deleteFrom({marker, offset: 3});
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
   * @param {Object} position object with {marker, offset} the marker and offset to delete from
   * @param {Number} direction The direction to delete in (default is BACKWARD)
   * @return {Object} {currentMarker, currentOffset} for positioning the cursor
   * @public
   */
  deleteFrom({marker, offset}, direction=DIRECTION.BACKWARD) {
    if (direction === DIRECTION.BACKWARD) {
      return this._deleteBackwardFrom({marker, offset});
    } else {
      return this._deleteForwardFrom({marker, offset});
    }
  }

  /**
   * delete 1 character in the FORWARD direction from the given position
   * @method _deleteForwardFrom
   * @private
   */
  _deleteForwardFrom({marker, offset}) {
    const nextCursorMarker = marker,
          nextCursorOffset = offset;

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
          nextSection.renderNode.scheduleForRemoval();
        }
      }
    } else {
      marker.deleteValueAtOffset(offset);
      marker.renderNode.markDirty();
    }

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return {
      currentMarker: nextCursorMarker,
      currentOffset: nextCursorOffset
    };
  }

  /**
   * delete 1 character in the BACKWARD direction from the given position
   * @method _deleteBackwardFrom
   * @private
   */
  _deleteBackwardFrom({marker, offset}) {
    let nextCursorMarker = marker,
        nextCursorOffset = offset;

    if (offset === 0) {
      const prevMarker = marker.prev;

      if (prevMarker) {
        return this._deleteBackwardFrom({marker: prevMarker, offset: prevMarker.length});
      } else {
        const prevSection = marker.section.prev;

        if (prevSection) {
          if (isMarkupSection(prevSection)) {
            nextCursorMarker = prevSection.markers.tail;
            nextCursorOffset = nextCursorMarker.length;

            let { beforeMarker, afterMarker } = prevSection.join(marker.section);
            prevSection.renderNode.markDirty();
            marker.section.renderNode.scheduleForRemoval();

            if (beforeMarker) {
              nextCursorMarker = beforeMarker;
              nextCursorOffset = beforeMarker.length;
            } else {
              nextCursorMarker = afterMarker;
              nextCursorOffset = 0;
            }
          }
          // ELSE: FIXME: card section -- what should deleting into it do?
        }
      }

    } else if (offset <= marker.length) {
      const offsetToDeleteAt = offset - 1;

      marker.deleteValueAtOffset(offsetToDeleteAt);

      if (marker.isEmpty && marker.prev) {
        marker.renderNode.scheduleForRemoval();
        nextCursorMarker = marker.prev;
        nextCursorOffset = nextCursorMarker.length;
      } else if (marker.isEmpty && marker.next) {
        marker.renderNode.scheduleForRemoval();
        nextCursorMarker = marker.next;
        nextCursorOffset = 0;
      } else {
        marker.renderNode.markDirty();
        nextCursorOffset = offsetToDeleteAt;
      }
    }

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return {
      currentMarker: nextCursorMarker,
      currentOffset: nextCursorOffset
    };
  }

  /**
   * Split makers at two positions, once at the head, and if necessary once
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
   * @param {Object} markerRange Object with offsets, {headMarker, headOffset, tailMarker, tailOffset}
   * @return {Array} of markers that are inside the split
   * @public
   */
  splitMarkers({headMarker, headOffset, tailMarker, tailOffset}) {
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
      let markers = headSection.splitMarker(headMarker, headOffset, tailOffset);
      selectedMarkers = post.markersInRange({
        headMarker: markers[0],
        tailMarker: markers[markers.length-1],
        headOffset,
        tailOffset
      });
    } else {
      let newHeadMarkers = headSection.splitMarker(headMarker, headOffset);
      let selectedHeadMarkers = post.markersInRange({
        headMarker: newHeadMarkers[0],
        tailMarker: newHeadMarkers[newHeadMarkers.length-1],
        headOffset
      });

      let newTailMarkers = tailSection.splitMarker(tailMarker, 0, tailOffset);
      let selectedTailMarkers = post.markersInRange({
        headMarker: newTailMarkers[0],
        tailMarker: newTailMarkers[newTailMarkers.length-1],
        headOffset: 0,
        tailOffset
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
   *         headMarker: marker,
   *         headOffset: 3
   *       });
   *     });
   *     // Will result in the marker and its old section being removed from
   *     // the post and rendered DOM, and in the creation of two new sections
   *     // replacing the old one.
   *
   * The return value will be the two new sections. One or both of these
   * sections can be blank (contain only a blank marker), for example if the
   * headOffset is 0.
   *
   * @method splitMarkers
   * @param {Object} markerRange Object with offsets, {headMarker, headOffset, tailMarker, tailOffset}
   * @return {Array} of new sections, one for the first half and one for the second
   * @public
   */
  splitSection({headSection: section, headSectionOffset}) {
    let {
      marker: headMarker,
      offset: headOffset
    } = section.markerPositionAtOffset(headSectionOffset);

    const [beforeSection, afterSection] = section.splitAtMarker(headMarker, headOffset);

    this._replaceSection(section, [beforeSection, afterSection]);

    this.scheduleRerender();
    this.scheduleDidUpdate();

    return [beforeSection, afterSection];
  }

  _replaceSection(section, newSections) {
    let nextSection = section.next;
    newSections.forEach(s => this.insertSectionBefore(s, nextSection));
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
   * @param {Object} markerRange Object with offsets, {headMarker, headOffset, tailMarker, tailOffset}
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
   * @param {Object} markerRange Object with offsets, {headMarker, headOffset, tailMarker, tailOffset}
   * @param {Object} markup A markup post abstract node
   * @return {Array} of markers that are inside the split
   * @public
   */
  removeMarkupFromMarkers(markerRange, markup) {
    const markers = this.splitMarkers(markerRange);
    markers.forEach(marker => {
      marker.removeMarkup(markup);
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
   *     editor.run((postEditor) => {
   *       postEditor.insertSectionBefore(section, sectionWithCursor);
   *     });
   *
   * @method insertSectionBefore
   * @param {Object} section The new section
   * @param {Object} beforeSection The section "before" is relative to
   * @public
   */
  insertSectionBefore(section, beforeSection) {
    this.editor.post.sections.insertBefore(section, beforeSection);
    this.editor.post.renderNode.markDirty();

    this.scheduleRerender();
    this.scheduleDidUpdate();
  }

  /**
   * Remove a given section from the post abstract and the rendered UI.
   *
   * Usage:
   *
   *     let markerRange = editor.cursor.offsets;
   *     let sectionWithCursor = markerRange.headMarker.section;
   *     editor.run((postEditor) => {
   *       postEditor.removeSection(sectionWithCursor);
   *     });
   *
   * @method insertSectionBefore
   * @param {Object} section The section to remove
   * @public
   */
  removeSection(section) {
    section.renderNode.scheduleForRemoval();
    section.post.sections.remove(section);

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

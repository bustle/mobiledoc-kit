import { MARKUP_SECTION_TYPE } from '../models/markup-section';
class PostEditor {
  constructor(editor) {
    this.editor = editor;
    this._completionWorkQueue = [];
    this._didRerender = false;
    this._didUpdate = false;
    this._didComplete = false;
  }

  // types of selection deletion:
  //   * a selection starts at the beginning of a section
  //     -- cursor should end up at the beginning of that section
  //     -- if the section not longer has markers, add a blank one for the cursor to focus on
  //   * a selection is entirely within a section
  //     -- split the markers with the selection, remove those new markers from their section
  //     -- cursor goes at end of the marker before the selection start, or if the
  //     -- selection was at the start of the section, cursor goes at section start
  //   * a selection crosses multiple sections
  //     -- remove all the sections that are between (exclusive ) selection start and end
  //     -- join the start and end sections
  //     -- mark the end section for removal
  //     -- cursor goes at end of marker before the selection start
  deleteRange(rangeMarkers) {
    // rangeMarkers should be akin to this.cursor.offset
    const markers = this.splitMarkers(rangeMarkers);

    const {
      changedSections,
      removedSections,
      currentMarker,
      currentOffset
    } = this.editor.post.cutMarkers(markers);

    changedSections.forEach(section => section.renderNode.markDirty());
    removedSections.forEach(section => section.renderNode.scheduleForRemoval());

    this.didUpdate();
    this.rerender();
    this.schedule(() => {
      // FIXME the cursor API should accept markers, not elements. Or there
      // should be a proxy method on editor
      let currentTextNode = currentMarker.renderNode.element;
      this.editor.cursor.moveToNode(currentTextNode, currentOffset);
    });
  }

  // need to handle these cases:
  // when cursor is:
  //   * A in the middle of a marker -- just delete the character
  //   * B offset is 0 and there is a previous marker
  //     * delete last char of previous marker
  //   * C offset is 0 and there is no previous marker
  //     * join this section with previous section
  deleteCharAt(marker, offset) {
    const currentMarker = marker;
    let nextCursorMarker = currentMarker;
    let nextCursorOffset = offset;
    let renderNode = marker.renderNode;

    // A: in the middle of a marker
    if (offset >= 0) {
      currentMarker.deleteValueAtOffset(offset);
      if (currentMarker.length === 0 && currentMarker.section.markers.length > 1) {
        if (marker.renderNode) {
          marker.renderNode.scheduleForRemoval();
        }

        let isFirstRenderNode = renderNode === renderNode.parent.childNodes.head;
        if (isFirstRenderNode) {
          // move cursor to start of next node
          nextCursorMarker = renderNode.next.postNode;
          nextCursorOffset = 0;
        } else {
          // move cursor to end of prev node
          nextCursorMarker = renderNode.prev.postNode;
          nextCursorOffset = renderNode.prev.postNode.length;
        }
      } else {
        renderNode.markDirty();
      }
    } else {
      let currentSection = currentMarker.section;
      let previousMarker = currentMarker.prev;
      if (previousMarker) { // (B)
        let markerLength = previousMarker.length;
        previousMarker.deleteValueAtOffset(markerLength - 1);
      } else { // (C)
        // possible previous sections:
        //   * none -- do nothing
        //   * markup section -- join to it
        //   * non-markup section (card) -- select it? delete it?
        let previousSection = currentSection.prev;
        if (previousSection) {
          let isMarkupSection = previousSection.type === MARKUP_SECTION_TYPE;

          if (isMarkupSection) {
            let lastPreviousMarker = previousSection.markers.tail;
            previousSection.join(currentSection);
            previousSection.renderNode.markDirty();
            currentSection.renderNode.scheduleForRemoval();

            nextCursorMarker = lastPreviousMarker.next;
            nextCursorOffset = 0;
          /*
          } else {
            // card section: ??
          */
          }
        } else { // no previous section -- do nothing
          nextCursorMarker = currentMarker;
          nextCursorOffset = 0;
        }
      }
    }

    this.didUpdate();
    this.rerender();
    this.schedule(() => {
      let nextElement = nextCursorMarker.renderNode.element;
      this.editor.cursor.moveToNode(
        nextElement,
        nextCursorOffset
      );
    });
  }

  /*
   * @return {Array} of markers that are "inside the split"
   */
  splitMarkers({headMarker, headOffset, tailMarker, tailOffset}) {
    let selectedMarkers = [];

    let headSection = headMarker.section;
    let tailSection = tailMarker.section;

    // These render will be removed by the split functions. Mark them
    // for removal before doing that. FIXME this seems prime for
    // refactoring onto the postEditor as a split function
    headMarker.renderNode.scheduleForRemoval();
    headMarker.renderNode.scheduleForRemoval();
    headMarker.section.renderNode.markDirty();
    headMarker.section.renderNode.markDirty();

    if (headMarker === tailMarker) {
      let markers = headSection.splitMarker(headMarker, headOffset, tailOffset);
      selectedMarkers = this.editor.markersInRange({
        headMarker: markers[0],
        tailMarker: markers[markers.length-1],
        headOffset,
        tailOffset
      });
    } else {
      let newHeadMarkers = headSection.splitMarker(headMarker, headOffset);
      let selectedHeadMarkers = this.editor.markersInRange({
        headMarker: newHeadMarkers[0],
        tailMarker: newHeadMarkers[newHeadMarkers.length-1],
        headOffset
      });

      let newTailMarkers = tailSection.splitMarker(tailMarker, tailOffset);
      let selectedTailMarkers = this.editor.markersInRange({
        headMarker: newTailMarkers[0],
        tailMarker: newTailMarkers[newTailMarkers.length-1],
        headOffset: 0,
        tailOffset
      });

      let newHeadMarker = selectedHeadMarkers[0],
          newTailMarker = selectedTailMarkers[selectedTailMarkers.length - 1];

      this.editor.post.markersFrom(newHeadMarker, newTailMarker, m => {
        selectedMarkers.push(m);
      });
    }

    this.didUpdate();
    this.rerender();

    return selectedMarkers;
  }

  applyMarkupToMarkers(markerRange, markup) {
    const markers = this.splitMarkers(markerRange);
    markers.forEach(marker => {
      marker.addMarkup(markup);
      marker.section.renderNode.markDirty();
    });

    this.rerender();
    this.didUpdate();

    return markers;
  }

  removeMarkupFromMarkers(markerRange, markup) {
    const markers = this.splitMarkers(markerRange);
    markers.forEach(marker => {
      marker.removeMarkup(markup);
      marker.section.renderNode.markDirty();
    });

    this.rerender();
    this.didUpdate();

    return markers;
  }


  /**
   * A method for adding work the deferred queue
   *
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
   */
  rerender() {
    this.schedule(() => {
      if (!this._didRerender) {
        this._didRerender = true;
        this.editor.rerender();
      }
    });
  }

  /**
   * Add an update notice job to the queue
   *
   */
  didUpdate() {
    this.schedule(() => {
      if (!this._didUpdate) {
        this._didUpdate = true;
        this.editor.didUpdate();
      }
    });
  }

  /**
   * Flush the work queue
   *
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

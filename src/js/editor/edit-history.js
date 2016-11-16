import mobiledocParsers from 'mobiledoc-kit/parsers/mobiledoc';
import FixedQueue from 'mobiledoc-kit/utils/fixed-queue';

function findLeafSectionAtIndex(post, index) {
  let section;
  post.walkAllLeafSections((_section, _index) => {
    if (index === _index) {
      section = _section;
    }
  });
  return section;
}

export class Snapshot {
  constructor(takenAt, editor, editAction=null) {
    this.mobiledoc = editor.serialize();
    this.editor = editor;
    this.editAction = editAction;
    this.takenAt = takenAt;

    this.snapshotRange();
  }

  snapshotRange() {
    let { range, cursor } = this.editor;
    if (cursor.hasCursor() && !range.isBlank) {
      let { head, tail } = range;
      this.range = {
        head: [head.leafSectionIndex, head.offset],
        tail: [tail.leafSectionIndex, tail.offset]
      };
    }
  }

  getRange(post) {
    if (this.range) {
      let { head, tail } = this.range;
      let [headLeafSectionIndex, headOffset] = head;
      let [tailLeafSectionIndex, tailOffset] = tail;
      let headSection = findLeafSectionAtIndex(post, headLeafSectionIndex);
      let tailSection = findLeafSectionAtIndex(post, tailLeafSectionIndex);

      head = headSection.toPosition(headOffset);
      tail = tailSection.toPosition(tailOffset);

      return head.toRange(tail);
    }
  }

  groupsWith(groupingTimeout, editAction, takenAt) {
    return (
      editAction !== null &&
      this.editAction === editAction &&
      this.takenAt + groupingTimeout > takenAt
    );
  }
}

export default class EditHistory {
  constructor(editor, queueLength, groupingTimeout) {
    this.editor = editor;
    this._undoStack = new FixedQueue(queueLength);
    this._redoStack = new FixedQueue(queueLength);

    this._pendingSnapshot = null;
    this._groupingTimeout = groupingTimeout;
  }

  snapshot() {
    // update the current snapshot with the range read from DOM
    if (this._pendingSnapshot) {
      this._pendingSnapshot.snapshotRange();
    }
  }

  storeSnapshot(editAction=null) {
    let now = Date.now();
    // store pending snapshot
    let pendingSnapshot = this._pendingSnapshot;
    if (pendingSnapshot) {
      if (!pendingSnapshot.groupsWith(this._groupingTimeout, editAction, now)) {
        this._undoStack.push(pendingSnapshot);
      }
      this._redoStack.clear();
    }

    // take new pending snapshot to store next time `storeSnapshot` is called
    this._pendingSnapshot = new Snapshot(now, this.editor, editAction);
  }

  stepBackward(postEditor) {
    // Throw away the pending snapshot
    this._pendingSnapshot = null;

    let snapshot = this._undoStack.pop();
    if (snapshot) {
      this._redoStack.push(new Snapshot(Date.now(), this.editor));
      this._restoreFromSnapshot(snapshot, postEditor);
    }
  }

  stepForward(postEditor) {
    let snapshot = this._redoStack.pop();
    if (snapshot) {
      this._undoStack.push(new Snapshot(Date.now(), this.editor));
      this._restoreFromSnapshot(snapshot, postEditor);
    }
    postEditor.cancelSnapshot();
  }

  _restoreFromSnapshot(snapshot, postEditor) {
    let { mobiledoc } = snapshot;
    let { editor } = this;
    let { builder, post } = editor;
    let restoredPost = mobiledocParsers.parse(builder, mobiledoc);

    postEditor.removeAllSections();
    postEditor.migrateSectionsFromPost(restoredPost);

    // resurrect snapshotted range if it exists
    let newRange = snapshot.getRange(post);
    if (newRange) {
      postEditor.setRange(newRange);
    }
  }
}

import Post from '../models/post'
import Section from '../models/_section'
import mobiledocParsers from '../parsers/mobiledoc'
import FixedQueue from '../utils/fixed-queue'
import { Option } from '../utils/types'
import Editor from './editor'
import PostEditor, { EditAction } from './post'
import { Mobiledoc } from '../renderers/mobiledoc'

function findLeafSectionAtIndex(post: Post, index: number) {
  let section: Section

  post.walkAllLeafSections((_section, _index) => {
    if (index === _index) {
      section = _section
    }
  })
  return section!
}

export class Snapshot {
  takenAt: number
  editor: Editor
  editAction: Option<EditAction>
  mobiledoc: Mobiledoc
  range!: {
    head: [number, number]
    tail: [number, number]
  }

  constructor(takenAt: number, editor: Editor, editAction: Option<EditAction> = null) {
    this.mobiledoc = editor.serialize()
    this.editor = editor
    this.editAction = editAction
    this.takenAt = takenAt

    this.snapshotRange()
  }

  snapshotRange() {
    let { range, cursor } = this.editor
    if (cursor.hasCursor() && !range.isBlank) {
      let { head, tail } = range
      this.range = {
        head: [head.leafSectionIndex, head.offset],
        tail: [tail.leafSectionIndex, tail.offset],
      }
    }
  }

  getRange(post: Post) {
    if (this.range) {
      let { head, tail } = this.range
      let [headLeafSectionIndex, headOffset] = head
      let [tailLeafSectionIndex, tailOffset] = tail
      let headSection = findLeafSectionAtIndex(post, headLeafSectionIndex)
      let tailSection = findLeafSectionAtIndex(post, tailLeafSectionIndex)

      let headPosition = headSection.toPosition(headOffset)
      let tailPosition = tailSection.toPosition(tailOffset)

      return headPosition.toRange(tailPosition)
    }
  }

  groupsWith(groupingTimeout: number, editAction: Option<EditAction>, takenAt: number) {
    return editAction !== null && this.editAction === editAction && this.takenAt + groupingTimeout > takenAt
  }
}

export default class EditHistory {
  editor: Editor
  _undoStack: FixedQueue<Snapshot>
  _redoStack: FixedQueue<Snapshot>
  _pendingSnapshot: Option<Snapshot>
  _groupingTimeout: number

  constructor(editor: Editor, queueLength: number, groupingTimeout: number) {
    this.editor = editor
    this._undoStack = new FixedQueue(queueLength)
    this._redoStack = new FixedQueue(queueLength)

    this._pendingSnapshot = null
    this._groupingTimeout = groupingTimeout
  }

  snapshot() {
    // update the current snapshot with the range read from DOM
    if (this._pendingSnapshot) {
      this._pendingSnapshot.snapshotRange()
    }
  }

  storeSnapshot(editAction: Option<EditAction> = null) {
    let now = Date.now()
    // store pending snapshot
    let pendingSnapshot = this._pendingSnapshot
    if (pendingSnapshot) {
      if (!pendingSnapshot.groupsWith(this._groupingTimeout, editAction, now)) {
        this._undoStack.push(pendingSnapshot)
      }
      this._redoStack.clear()
    }

    // take new pending snapshot to store next time `storeSnapshot` is called
    this._pendingSnapshot = new Snapshot(now, this.editor, editAction)
  }

  stepBackward(postEditor: PostEditor) {
    // Throw away the pending snapshot
    this._pendingSnapshot = null

    let snapshot = this._undoStack.pop()
    if (snapshot) {
      this._redoStack.push(new Snapshot(Date.now(), this.editor))
      this._restoreFromSnapshot(snapshot, postEditor)
    }
  }

  stepForward(postEditor: PostEditor) {
    let snapshot = this._redoStack.pop()
    if (snapshot) {
      this._undoStack.push(new Snapshot(Date.now(), this.editor))
      this._restoreFromSnapshot(snapshot, postEditor)
    }
    postEditor.cancelSnapshot()
  }

  _restoreFromSnapshot(snapshot, postEditor) {
    let { mobiledoc } = snapshot
    let { editor } = this
    let { builder, post } = editor
    let restoredPost = mobiledocParsers.parse(builder, mobiledoc)

    postEditor.removeAllSections()
    postEditor.migrateSectionsFromPost(restoredPost)

    // resurrect snapshotted range if it exists
    let newRange = snapshot.getRange(post)
    if (newRange) {
      postEditor.setRange(newRange)
    }
  }
}

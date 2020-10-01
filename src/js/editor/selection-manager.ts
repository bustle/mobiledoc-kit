import SelectionChangeObserver from '../editor/selection-change-observer'
import Editor from './editor'
import { PartialSelection } from '../utils/selection-utils'

type SelectionManagerCallback = (curSelection: PartialSelection, prevSelection: PartialSelection) => void

export default class SelectionManager {
  editor: Editor
  callback: SelectionManagerCallback
  started: boolean

  constructor(editor: Editor, callback: SelectionManagerCallback) {
    this.editor = editor
    this.callback = callback
    this.started = false
  }

  start() {
    if (this.started) {
      return
    }

    SelectionChangeObserver.addListener(this)
    this.started = true
  }

  stop() {
    this.started = false
    SelectionChangeObserver.removeListener(this)
  }

  destroy() {
    this.stop()
  }

  selectionDidChange(curSelection: PartialSelection, prevSelection: PartialSelection) {
    if (this.started) {
      this.callback(curSelection, prevSelection)
    }
  }
}

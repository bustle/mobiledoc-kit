import { PartialSelection } from '../utils/selection-utils'

let instance: SelectionChangeObserver

export interface SelectionChangeListener {
  selectionDidChange(nextSelection: PartialSelection, prevSelection: PartialSelection): void
}

class SelectionChangeObserver {
  started: boolean
  listeners: SelectionChangeListener[]
  selection: PartialSelection

  constructor() {
    this.started = false
    this.listeners = []
    this.selection = {} as PartialSelection
  }

  static getInstance() {
    if (!instance) {
      instance = new SelectionChangeObserver()
    }
    return instance
  }

  static addListener(listener: SelectionChangeListener) {
    SelectionChangeObserver.getInstance().addListener(listener)
  }

  addListener(listener: SelectionChangeListener) {
    if (this.listeners.indexOf(listener) === -1) {
      this.listeners.push(listener)
      this.start()
    }
  }

  static removeListener(listener: SelectionChangeListener) {
    SelectionChangeObserver.getInstance().removeListener(listener)
  }

  removeListener(listener: SelectionChangeListener) {
    let index = this.listeners.indexOf(listener)
    if (index !== -1) {
      this.listeners.splice(index, 1)
      if (this.listeners.length === 0) {
        this.stop()
      }
    }
  }

  start() {
    if (this.started) {
      return
    }
    this.started = true

    this.poll()
  }

  stop() {
    this.started = false
    this.selection = {} as Selection
  }

  notifyListeners(newSelection: PartialSelection, prevSelection: PartialSelection) {
    this.listeners.forEach(listener => {
      listener.selectionDidChange(newSelection, prevSelection)
    })
  }

  destroy() {
    this.stop()
    this.listeners = []
  }

  getSelection(): PartialSelection {
    let selection = window.getSelection()!
    let { anchorNode, focusNode, anchorOffset, focusOffset } = selection
    return { anchorNode, focusNode, anchorOffset, focusOffset }
  }

  poll() {
    if (this.started) {
      this.update()
      this.runNext(() => this.poll())
    }
  }

  runNext(fn: FrameRequestCallback) {
    window.requestAnimationFrame(fn)
  }

  update() {
    let prevSelection = this.selection
    let curSelection = this.getSelection()!
    if (!this.selectionIsEqual(prevSelection, curSelection)) {
      this.selection = curSelection
      this.notifyListeners(curSelection, prevSelection)
    }
  }

  selectionIsEqual(s1: PartialSelection, s2: PartialSelection) {
    return (
      s1.anchorNode === s2.anchorNode &&
      s1.anchorOffset === s2.anchorOffset &&
      s1.focusNode === s2.focusNode &&
      s1.focusOffset === s2.focusOffset
    )
  }
}

export default SelectionChangeObserver

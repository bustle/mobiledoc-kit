import Range from 'mobiledoc-kit/utils/cursor/range'
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder'

export default class MockEditor {
  builder: PostNodeBuilder
  range: Range
  _renderedRange!: Range

  constructor(builder: PostNodeBuilder) {
    this.builder = builder
    this.range = Range.blankRange()
  }

  selectRange(range: Range) {
    this._renderedRange = range
  }

  rerender() {}
  _postDidChange() {}
  _readRangeFromDOM() {}
}

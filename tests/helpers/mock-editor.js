import PostEditor from 'mobiledoc-kit/editor/post';
import Range from 'mobiledoc-kit/utils/cursor/range';

class MockEditor {
  constructor(builder) {
    this.builder = builder;
    this.range = Range.blankRange();
  }
  run(callback) {
    let postEditor = new PostEditor(this);
    postEditor.begin();
    let result = callback(postEditor);
    postEditor.end();
    return result;
  }
  rerender() {}
  _postDidChange() {}
  selectRange(range) {
    this._renderedRange = range;
  }
  _readRangeFromDOM() {}
}

export default MockEditor;

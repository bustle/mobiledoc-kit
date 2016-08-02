import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import PostEditor from 'mobiledoc-kit/editor/post';
import MockEditor from './mock-editor';
import renderBuiltAbstract from './render-built-abstract';

export default function run(post, callback) {
  let builder = new PostNodeBuilder();
  let editor = new MockEditor(builder);

  renderBuiltAbstract(post, editor);

  let postEditor = new PostEditor(editor);
  postEditor.begin();
  let result = callback(postEditor);
  postEditor.complete();
  return result;
}


import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder'
import PostEditor from 'mobiledoc-kit/editor/post'
import MockEditor from './mock-editor'
import renderBuiltAbstract from './render-built-abstract'
import Post from 'mobiledoc-kit/models/post'
import { Editor } from 'mobiledoc-kit'

export default function run<T>(post: Post, callback: (editor: PostEditor) => T): T {
  let builder = new PostNodeBuilder()
  let editor = new MockEditor(builder)

  renderBuiltAbstract(post, editor as unknown as Editor)

  let postEditor = new PostEditor(editor as unknown as Editor)
  postEditor.begin()
  let result = callback(postEditor)
  postEditor.complete()
  return result
}

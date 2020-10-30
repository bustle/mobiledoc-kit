import EditorDomRenderer from 'mobiledoc-kit/renderers/editor-dom'
import RenderTree from 'mobiledoc-kit/models/render-tree'
import Post from 'mobiledoc-kit/models/post'
import Editor from 'mobiledoc-kit/editor/editor'

export default function renderBuiltAbstract(post: Post, editor: Editor) {
  editor.post = post
  let unknownCardHandler = () => null
  let unknownAtomHandler = () => null
  let renderer = new EditorDomRenderer(editor, [], [], unknownCardHandler, unknownAtomHandler, {})
  let renderTree = new RenderTree(post)
  renderer.render(renderTree)
  return editor
}

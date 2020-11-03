import PostAbstractHelpers, { BuildCallback } from './post-abstract'
import mobiledocRenderers, { MobiledocVersion } from 'mobiledoc-kit/renderers/mobiledoc'
import Editor, { EditorOptions } from 'mobiledoc-kit/editor/editor'
import Range from 'mobiledoc-kit/utils/cursor/range'
import { mergeWithOptions } from 'mobiledoc-kit/utils/merge'
import Post from 'mobiledoc-kit/models/post'

/*
 * usage:
 *  build(({post, section, marker, markup}) =>
 *    post([
 *      section('P', [
 *        marker('some text', [markup('B')])
 *      ])
 *    })
 *  )
 *  @return Mobiledoc
 */
function build(treeFn: BuildCallback, version?: MobiledocVersion) {
  let post = PostAbstractHelpers.build(treeFn)
  return mobiledocRenderers.render(post, version)
}

function renderPostInto(element: HTMLElement, post: Post, editorOptions = {}) {
  let mobiledoc = mobiledocRenderers.render(post)
  mergeWithOptions(editorOptions, { mobiledoc })
  let editor = new Editor(editorOptions)
  editor.render(element)
  return editor
}

function renderInto(element: HTMLElement, treeFn: BuildCallback, editorOptions: EditorOptions = {}) {
  let mobiledoc = build(treeFn)
  mergeWithOptions(editorOptions, { mobiledoc })
  let editor = new Editor(editorOptions)
  editor.render(element)
  return editor
}

// In Firefox, if the window isn't active (which can happen when running tests
// at SauceLabs), the editor element won't have the selection. This helper method
// ensures that it has a cursor selection.
// See https://github.com/bustle/mobiledoc-kit/issues/388
function renderIntoAndFocusTail(editorElement: HTMLElement, treeFn: BuildCallback, options: EditorOptions = {}) {
  let editor = renderInto(editorElement, treeFn, options)
  editor.selectRange(new Range(editor.post.tailPosition()))
  return editor
}

export default {
  build,
  renderInto,
  renderPostInto,
  renderIntoAndFocusTail,
}

import PostAbstractHelpers from './post-abstract'
import Editor, { EditorOptions } from 'mobiledoc-kit/editor/editor'
import MobiledocRenderer from 'mobiledoc-kit/renderers/mobiledoc/0-3-1'
import Post from 'mobiledoc-kit/models/post'
import Position from 'mobiledoc-kit/utils/cursor/position'
import Range from 'mobiledoc-kit/utils/cursor/range'
import { unwrap } from 'mobiledoc-kit/utils/assert'
import { Maybe } from 'mobiledoc-kit/utils/types'

function retargetPosition(position: Position, toPost: Post) {
  let fromPost = unwrap(position.section!.post)
  let sectionIndex: Maybe<number>
  let retargetedPosition: Maybe<Position>

  fromPost.walkAllLeafSections((section, index) => {
    if (sectionIndex !== undefined) {
      return
    }
    if (section === position.section) {
      sectionIndex = index
    }
  })

  if (sectionIndex === undefined) {
    throw new Error('`retargetPosition` could not find section index')
  }

  toPost.walkAllLeafSections((section, index) => {
    if (retargetedPosition) {
      return
    }
    if (index === sectionIndex) {
      retargetedPosition = section.toPosition(position.offset)
    }
  })

  if (!retargetedPosition) {
    throw new Error('`retargetPosition` could not find target section')
  }

  return retargetedPosition
}

function retargetRange(range: Range, toPost: Post) {
  let newHead = retargetPosition(range.head, toPost)
  let newTail = retargetPosition(range.tail, toPost)

  return newHead.toRange(newTail)
}

type BuildFromTextOptions = EditorOptions & {
  element?: HTMLElement
  beforeRender?: (editor: Editor) => void
}

function buildFromText(texts: string | string[], editorOptions: BuildFromTextOptions = {}) {
  let renderElement = editorOptions.element
  delete editorOptions.element

  let beforeRender = editorOptions.beforeRender || function () {}
  delete editorOptions.beforeRender

  let { post, range } = PostAbstractHelpers.buildFromText(texts)
  let mobiledoc = MobiledocRenderer.render(post)
  editorOptions.mobiledoc = mobiledoc
  let editor = new Editor(editorOptions)

  if (renderElement) {
    beforeRender(editor)
    editor.render(renderElement)
    if (range) {
      range = retargetRange(range, editor.post)
      editor.selectRange(range)
    }
  }
  return editor
}

export { buildFromText, retargetRange, retargetPosition }

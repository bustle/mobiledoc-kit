import { endsWith } from '../utils/string-utils'
import assert from '../utils/assert'
import deprecate from '../utils/deprecate'
import { ENTER } from '../utils/characters'
import Editor from './editor'
import Markerable from '../models/_markerable'
import { Maybe } from '../utils/types'

class TextInputHandler {
  editor: Editor
  _handlers: TextInputHandlerListener[]

  constructor(editor: Editor) {
    this.editor = editor
    this._handlers = []
  }

  register(handler: TextInputHandlerListener) {
    assert(`Input Handler is not valid`, this._validateHandler(handler))
    this._handlers.push(handler)
  }

  unregister(name: string) {
    let handlers = this._handlers
    for (let i = 0; i < handlers.length; i++) {
      if (handlers[i].name === name) {
        handlers.splice(i, 1)
      }
    }
  }

  handle(string: string) {
    let { editor } = this

    editor.insertText(string)

    let matchedHandler = this._findHandler()
    if (matchedHandler) {
      let [handler, matches] = matchedHandler
      handler.run(editor, matches)
    }
  }

  handleNewLine() {
    let { editor } = this

    let matchedHandler = this._findHandler(ENTER)
    if (matchedHandler) {
      let [handler, matches] = matchedHandler
      handler.run(editor, matches)
    }
  }

  _findHandler(string = ''): Maybe<[TextInputHandlerListener, string[]]> {
    const { editor } = this
    const { range } = editor
    const { head } = range
    const { section } = head

    let preText = ((section! as unknown) as Markerable).textUntil(head) + string

    for (let i = 0; i < this._handlers.length; i++) {
      let handler = this._handlers[i]

      if ('text' in handler && endsWith(preText, handler.text)) {
        return [handler, [handler.text]]
      } else if ('match' in handler && handler.match.test(preText)) {
        return [handler, handler.match.exec(preText)!]
      }
    }
  }

  _validateHandler(handler: TextInputHandlerListener) {
    deprecate('Registered input handlers require a "name" property so that they can be unregistered', !!handler.name)
    return (
      !!handler.run && // has `run`
      (!!(handler as TextHandler).text || !!(handler as MatchHandler).match) && // and `text` or `match`
      !(!!(handler as TextHandler).text && !!(handler as MatchHandler).match)
    ) // not both `text` and `match`
  }

  destroy() {
    this._handlers = []
  }
}

interface BaseHandler {
  name: string
  run: (editor: Editor, matches: string[]) => void
}

interface TextHandler extends BaseHandler {
  text: string
}

interface MatchHandler extends BaseHandler {
  match: RegExp
}

export type TextInputHandlerListener = TextHandler | MatchHandler

export default TextInputHandler

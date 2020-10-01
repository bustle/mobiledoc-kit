declare module 'mobiledoc-dom-renderer' {
  export interface DOMRendererOptions {
    unknownCardHandler: () => void
    unknownAtomHandler: () => void
  }

  export interface DOMRendererResult {
    result: Node
  }

  export default class DOMRenderer {
    constructor(options: DOMRendererOptions)
    render(mobiledoc: Mobiledoc): DOMRendererResult
  }
}

declare module 'mobiledoc-text-renderer' {
  export interface TextRendererOptions {
    unknownCardHandler: () => void
    unknownAtomHandler: () => void
  }

  export interface TextRendererResult {
    result: string
  }

  export default class TextRenderer {
    constructor(options: TextRendererOptions)
    render(mobiledoc: Mobiledoc): TextRendererResult
  }
}

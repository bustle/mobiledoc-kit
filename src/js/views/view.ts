import { addClassName } from '../utils/dom-utils'

interface ViewOptions {
  tagName: string
  container: HTMLElement
  classNames: string[]
}

type EventType = keyof HTMLElementEventMap

class View {
  element: HTMLElement
  container: HTMLElement

  isShowing: boolean = false
  isDestroyed: boolean = false

  _eventListeners: [HTMLElement, EventType, EventListener][]

  constructor(options: Partial<ViewOptions> = {}) {
    options.tagName = options.tagName || 'div'
    options.container = options.container || document.body

    this.element = document.createElement(options.tagName)
    this.container = options.container

    let classNames = options.classNames || []
    classNames.forEach(name => addClassName(this.element, name))
    this._eventListeners = []
  }

  addEventListener(element: HTMLElement, type: EventType, listener: EventListener) {
    element.addEventListener(type, listener)
    this._eventListeners.push([element, type, listener])
  }

  removeAllEventListeners() {
    this._eventListeners.forEach(([element, type, listener]) => {
      element.removeEventListener(type, listener)
    })
  }

  show() {
    if (!this.isShowing) {
      this.container.appendChild(this.element)
      this.isShowing = true
      return true
    }
  }

  hide() {
    if (this.isShowing) {
      this.container.removeChild(this.element)
      this.isShowing = false
      return true
    }
  }

  destroy() {
    this.removeAllEventListeners()
    this.hide()
    this.isDestroyed = true
  }
}

export default View

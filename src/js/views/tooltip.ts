import View from './view'
import { positionElementCenteredBelow, getEventTargetMatchingTag, whenElementIsNotInDOM, Cancelable } from '../utils/element-utils'
import { editLink } from '../editor/ui'

const SHOW_DELAY = 200
const HIDE_DELAY = 600

type Editor = any

interface TooltipOptions {
  rootElement: HTMLElement
  editor: Editor
}

export default class Tooltip extends View {
  rootElement: HTMLElement
  editor: any
  elementObserver: Cancelable | null = null

  constructor(options: TooltipOptions) {
    super({ ...options, classNames: ['__mobiledoc-tooltip'] })

    this.rootElement = options.rootElement
    this.editor = options.editor

    this.addListeners(options)
  }

  showLink(linkEl) {
    const { editor, element: tooltipEl } = this
    const { tooltipPlugin } = editor

    tooltipPlugin.renderLink(tooltipEl, linkEl, {
      editLink: () => {
        editLink(linkEl, editor)
        this.hide()
      },
    })

    this.show()
    positionElementCenteredBelow(this.element, linkEl)

    this.elementObserver = whenElementIsNotInDOM(linkEl, () => this.hide())
  }

  addListeners(options) {
    const { rootElement, element: tooltipElement } = this
    let showTimeout: number, hideTimeout: number

    const scheduleHide = () => {
      clearTimeout(hideTimeout)
      hideTimeout = setTimeout(() => {
        this.hide()
      }, HIDE_DELAY)
    }

    this.addEventListener(tooltipElement, 'mouseenter', () => {
      clearTimeout(hideTimeout)
    })

    this.addEventListener(tooltipElement, 'mouseleave', () => {
      scheduleHide()
    })

    this.addEventListener(rootElement, 'mouseover', event => {
      let target = getEventTargetMatchingTag(options.showForTag, event.target as HTMLElement, rootElement)

      if (target && target.isContentEditable) {
        clearTimeout(hideTimeout)
        showTimeout = setTimeout(() => {
          this.showLink(target)
        }, SHOW_DELAY)
      }
    })

    this.addEventListener(rootElement, 'mouseout', () => {
      clearTimeout(showTimeout)
      if (this.elementObserver) {
        this.elementObserver.cancel()
      }
      scheduleHide()
    })
  }
}

export const DEFAULT_TOOLTIP_PLUGIN = {
  renderLink(tooltipEl: Element, linkEl: HTMLLinkElement, { editLink }) {
    const { href } = linkEl
    tooltipEl.innerHTML = `<a href="${href}" target="_blank">${href}</a>`
    const button = document.createElement('button')
    button.classList.add('__mobiledoc-tooltip__edit-link')
    button.innerText = 'Edit Link'
    button.addEventListener('click', editLink)
    tooltipEl.append(button)
  },
}

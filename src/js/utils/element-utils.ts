import { dasherize } from './string-utils'
import { normalizeTagName } from './dom-utils'

export function getEventTargetMatchingTag(tagName: string, target: HTMLElement | null, container: HTMLElement) {
  tagName = normalizeTagName(tagName)
  // Traverses up DOM from an event target to find the node matching specifed tag
  while (target && target !== container) {
    if (normalizeTagName(target.tagName) === tagName) {
      return target
    }
    target = target.parentElement
  }
}

export function getElementRelativeOffset(element: HTMLElement) {
  const offset = { left: 0, top: -window.pageYOffset }
  const offsetParent = element.offsetParent!
  const offsetParentPosition = window.getComputedStyle(offsetParent).position
  let offsetParentRect

  if (offsetParentPosition === 'relative') {
    offsetParentRect = offsetParent.getBoundingClientRect()
    offset.left = offsetParentRect.left
    offset.top = offsetParentRect.top
  }
  return offset
}

type StringPropertyNames<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T]

export function getElementComputedStyleNumericProp(
  element: HTMLElement,
  prop: StringPropertyNames<CSSStyleDeclaration>
) {
  return parseFloat(window.getComputedStyle(element)[prop])
}

export function positionElementToRect(element: HTMLElement, rect: ClientRect, topOffset: number, leftOffset: number) {
  const relativeOffset = getElementRelativeOffset(element)
  const style = element.style
  const round = Math.round
  let left, top

  topOffset = topOffset || 0
  leftOffset = leftOffset || 0
  left = round(rect.left - relativeOffset.left - leftOffset)
  top = round(rect.top + rect.height - relativeOffset.top - topOffset)
  style.left = `${left}px`
  style.top = `${top}px`
  return { left: left, top: top }
}

export function positionElementHorizontallyCenteredToRect(element: HTMLElement, rect: ClientRect, topOffset: number) {
  const horizontalCenter = element.offsetWidth / 2 - rect.width / 2
  return positionElementToRect(element, rect, topOffset, horizontalCenter)
}

export function positionElementCenteredBelow(element: HTMLElement, belowElement: HTMLElement) {
  const elementMargin = getElementComputedStyleNumericProp(element, 'marginTop')
  return positionElementHorizontallyCenteredToRect(element, belowElement.getBoundingClientRect(), -elementMargin)
}

export function setData(element: HTMLElement, name: string, value: string) {
  if (element.dataset) {
    element.dataset[name] = value
  } else {
    const dataName = dasherize(name)
    return element.setAttribute(dataName, value)
  }
}

export interface Cancelable {
  cancel(): void
}

export function whenElementIsNotInDOM(element: HTMLElement, callback: () => void): Cancelable {
  let isCanceled = false
  const observerFn = () => {
    if (isCanceled) {
      return
    }
    if (!element.parentNode) {
      callback()
    } else {
      window.requestAnimationFrame(observerFn)
    }
  }
  observerFn()
  return { cancel: () => (isCanceled = true) }
}

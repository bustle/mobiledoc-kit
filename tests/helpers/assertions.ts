/* global QUnit, $ */

import DOMHelper from './dom'
import mobiledocRenderers from '../../src/js/renderers/mobiledoc'
import Marker from '../../src/js/models/marker'
import { PostNode } from '../../src/js/models/post-node-builder'
import Markup from '../../src/js/models/markup'
import Post from '../../src/js/models/post'
import Atom from '../../src/js/models/atoms/atom'
import Markuperable from '../../src/js/utils/markuperable'
import ListItem from '../../src/js/models/list-item'
import Card from '../../src/js/models/card'
import ListSection from '../../src/js/models/list-section'
import Image from '../../src/js/models/image'
import RenderTree from '../../src/js/models/render-tree'
import { Position, Range } from '../../src/js'
import RenderNode from '../../src/js/models/render-node'
import Markerable from '../../src/js/models/_markerable'
import { TagNameable } from '../../src/js/models/_tag-nameable'
import Section from '../../src/js/models/_section'
import MarkupSection from 'mobiledoc-kit/models/markup-section'

function compareMarkers(actual: Marker | Markuperable, expected: Marker, assert: Assert, path: string, deepCompare: boolean) {
  if (actual.value !== expected.value) {
    assert.equal(actual.value, expected.value, `wrong value at ${path}`)
  }
  if (actual.markups.length !== expected.markups.length) {
    assert.equal(actual.markups.length, expected.markups.length, `wrong markups at ${path}`)
  }
  if (deepCompare) {
    actual.markups.forEach((markup, index) => {
      comparePostNode(markup, expected.markups[index], assert, `${path}:${index}`, deepCompare)
    })
  }
}

function comparePostNode<T extends PostNode | Markup>(actual: T, expected: any, assert: Assert, path = 'root', deepCompare = false) {
  if (!actual || !expected) {
    assert.ok(!!actual, `missing actual post node at ${path}`)
    assert.ok(!!expected, `missing expected post node at ${path}`)
    return
  }
  if (actual.type !== expected.type) {
    assert.pushResult({
      result: false,
      actual: actual.type,
      expected: expected.type,
      message: `wrong type at ${path}`,
    })
  }

  if (actual instanceof Post) {
    if (actual.sections.length !== expected.sections.length) {
      assert.equal(actual.sections.length, expected.sections.length, `wrong sections for post`)
    }
    if (deepCompare) {
      actual.sections.forEach((section, index) => {
        comparePostNode(section, expected.sections.objectAt(index), assert, `${path}:${index}`, deepCompare)
      })
    }
  } else if (actual instanceof Atom) {
    if (actual.name !== expected.name) {
      assert.equal(actual.name, expected.name, `wrong atom name at ${path}`)
    }
    compareMarkers(actual, expected, assert, path, deepCompare)
  } else if (actual instanceof Marker) {
    compareMarkers(actual, expected, assert, path, deepCompare)
  } else if (actual instanceof MarkupSection || actual instanceof ListItem) {
      if (actual.tagName !== expected.tagName) {
        assert.equal(actual.tagName, expected.tagName, `wrong tagName at ${path}`)
      }
      if (actual.markers.length !== expected.markers.length) {
        assert.equal(actual.markers.length, expected.markers.length, `wrong markers at ${path}`)
      }
      if (deepCompare) {
        actual.markers.forEach((marker, index) => {
          comparePostNode(marker, expected.markers.objectAt(index), assert, `${path}:${index}`, deepCompare)
        })
      }
  } else if (actual instanceof Card) {
      if (actual.name !== expected.name) {
        assert.equal(actual.name, expected.name, `wrong card name at ${path}`)
      }
      if (!QUnit.equiv(actual.payload, expected.payload)) {
        assert.deepEqual(actual.payload, expected.payload, `wrong card payload at ${path}`)
      }
  } else if (actual instanceof ListSection) {
      if (actual.items.length !== expected.items.length) {
        assert.equal(actual.items.length, expected.items.length, `wrong items at ${path}`)
      }
      if (deepCompare) {
        actual.items.forEach((item, index) => {
          comparePostNode(item, expected.items.objectAt(index), assert, `${path}:${index}`, deepCompare)
        })
      }
  } else if (actual instanceof Image) {
    if (actual.src !== expected.src) {
      assert.equal(actual.src, expected.src, `wrong image src at ${path}`)
    }
  } else if (actual instanceof Markup) {
      if (actual.tagName !== expected.tagName) {
        assert.equal(actual.tagName, expected.tagName, `wrong tagName at ${path}`)
      }
      if (!QUnit.equiv(actual.attributes, expected.attributes)) {
        assert.deepEqual(actual.attributes, expected.attributes, `wrong attributes at ${path}`)
      }
  } else {
      throw new Error('wrong type :' + actual.type)
  }
}

declare global {
  interface Assert {
    isBlank(val: unknown, message: string): void
    hasElement(selector: string, message: string): void
    hasNoElement(selector: string, message: string): JQuery<HTMLElement>
    hasClass(element: HTMLElement, className: string, message: string): void
    notHasClass(element: HTMLElement, className: string, message: string): void
    selectedText(text: string, message: string): void
    inArray<T>(element: T, array: T[], message: string): void
    postIsSimilar(post: Post, expected: Post, postName: string): void
    renderTreeIsEqual(renderTree: RenderTree, expectedPost: Post): void
    positionIsEqual(position: Position, expected: Position, message: string): void
    rangeIsEqual(range: Range, expected: Range, message: string): void
  }
}

export default function registerAssertions(QUnit: QUnit) {
  QUnit.assert.isBlank = function (val, message = `value is blank`) {
    this.pushResult({
      result: val === null || val === undefined || val === '' || val === false,
      actual: `${val} (typeof ${typeof val})`,
      expected: `null|undefined|''|false`,
      message,
    })
  }

  QUnit.assert.hasElement = function (selector, message = `hasElement "${selector}"`) {
    let found = $('#qunit-fixture').find(selector)
    this.pushResult({
      result: found.length > 0,
      actual: `${found.length} matches for '${selector}'`,
      expected: `>0 matches for '${selector}'`,
      message: message,
    })
    return found
  }

  QUnit.assert.hasNoElement = function (selector, message = `hasNoElement "${selector}"`) {
    let found = $(selector)
    this.pushResult({
      result: found.length === 0,
      actual: `${found.length} matches for '${selector}'`,
      expected: `0 matches for '${selector}'`,
      message: message,
    })
    return found
  }

  QUnit.assert.hasClass = function (element, className, message = `element has class "${className}"`) {
    this.pushResult({
      result: element.classList.contains(className),
      actual: element.classList,
      expected: className,
      message,
    })
  }

  QUnit.assert.notHasClass = function (element, className, message = `element has class "${className}"`) {
    this.pushResult({
      result: !element.classList.contains(className),
      actual: element.classList,
      expected: className,
      message,
    })
  }

  QUnit.assert.selectedText = function (text, message = `selectedText "${text}"`) {
    const selected = DOMHelper.getSelectedText()
    this.pushResult({
      result: selected === text,
      actual: selected,
      expected: text,
      message: message,
    })
  }

  QUnit.assert.inArray = function (element, array, message = `has "${element}" in "${array}"`) {
    QUnit.assert.ok(array.indexOf(element) !== -1, message)
  }

  QUnit.assert.postIsSimilar = function (post, expected, postName = 'post') {
    comparePostNode(post, expected, this, postName, true)
    let mobiledoc = mobiledocRenderers.render(post),
      expectedMobiledoc = mobiledocRenderers.render(expected)
    this.deepEqual(mobiledoc, expectedMobiledoc, `${postName} is similar to expected`)
  }

  QUnit.assert.renderTreeIsEqual = function (renderTree, expectedPost) {
    if (renderTree.rootNode.isDirty) {
      this.ok(false, 'renderTree is dirty')
      return
    }

    expectedPost.sections.forEach((section, index) => {
      let renderNode = renderTree.rootNode.childNodes.objectAt(index)!
      let path = `post:${index}`

      let compareChildren = (parentPostNode: PostNode, parentRenderNode: RenderNode, path: string) => {
        let children = (parentPostNode as Markerable).markers || (parentPostNode as ListSection).items || []

        if (children.length !== parentRenderNode.childNodes.length) {
          this.equal(parentRenderNode.childNodes.length, children.length, `wrong child render nodes at ${path}`)
          return
        }

        children.forEach((child, index) => {
          let renderNode = parentRenderNode.childNodes.objectAt(index)!

          comparePostNode(child, renderNode && renderNode.postNode, this, `${path}:${index}`, false)
          compareChildren(child, renderNode, `${path}:${index}`)
        })
      }

      comparePostNode(section, renderNode.postNode, this, path, false)
      compareChildren(section, renderNode, path)
    })

    this.ok(true, 'renderNode is similar')
  }

  QUnit.assert.positionIsEqual = function (position, expected, message = `position is equal`) {
    if (position.section !== expected.section) {
      this.pushResult({
        result: false,
        actual: formatPosition(position),
        expected: formatPosition(expected),
        message: `incorrect position section (${message})`,
      })
    } else if (position.offset !== expected.offset) {
      this.pushResult({
        result: false,
        actual: position.offset,
        expected: expected.offset,
        message: `incorrect position offset (${message})`,
      })
    } else {
      this.pushResult({
        result: true,
        actual: position,
        expected: expected,
        message: message,
      })
    }
  }

  QUnit.assert.rangeIsEqual = function (range, expected, message = `range is equal`) {
    let { head, tail, isCollapsed, direction } = range
    let {
      head: expectedHead,
      tail: expectedTail,
      isCollapsed: expectedIsCollapsed,
      direction: expectedDirection,
    } = expected

    let failed = false

    if (!head.isEqual(expectedHead)) {
      failed = true
      this.pushResult({
        result: false,
        actual: formatPosition(head),
        expected: formatPosition(expectedHead),
        message: 'incorrect head position',
      })
    }

    if (!tail.isEqual(expectedTail)) {
      failed = true
      this.pushResult({
        result: false,
        actual: formatPosition(tail),
        expected: formatPosition(expectedTail),
        message: 'incorrect tail position',
      })
    }

    if (isCollapsed !== expectedIsCollapsed) {
      failed = true
      this.pushResult({
        result: false,
        actual: isCollapsed,
        expected: expectedIsCollapsed,
        message: 'wrong value for isCollapsed',
      })
    }

    if (direction !== expectedDirection) {
      failed = true
      this.pushResult({
        result: false,
        actual: direction,
        expected: expectedDirection,
        message: 'wrong value for direction',
      })
    }

    if (!failed) {
      this.pushResult({
        result: true,
        actual: range,
        expected: expected,
        message: message,
      })
    }
  }
}

function formatPosition(position: Position): string {
  const section = position.section! as Section & TagNameable
  return `${section.type}:${section.tagName}`
}

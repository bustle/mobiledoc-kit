/* global QUnit, $ */

import DOMHelper from './dom';
import mobiledocRenderers from 'mobiledoc-kit/renderers/mobiledoc';
import {
  MARKUP_SECTION_TYPE,
  LIST_SECTION_TYPE,
  MARKUP_TYPE,
  MARKER_TYPE,
  POST_TYPE,
  LIST_ITEM_TYPE,
  CARD_TYPE,
  IMAGE_SECTION_TYPE,
  ATOM_TYPE
} from 'mobiledoc-kit/models/types';

function compareMarkers(actual, expected, assert, path, deepCompare) {
  if (actual.value !== expected.value) {
    assert.equal(actual.value, expected.value, `wrong value at ${path}`);
  }
  if (actual.markups.length !== expected.markups.length) {
    assert.equal(actual.markups.length, expected.markups.length,
                 `wrong markups at ${path}`);
  }
  if (deepCompare) {
    actual.markups.forEach((markup, index) => {
      comparePostNode(markup, expected.markups[index],
                      assert, `${path}:${index}`, deepCompare);
    });
  }
}

/* eslint-disable complexity */
function comparePostNode(actual, expected, assert, path='root', deepCompare=false) {
  if (!actual || !expected) {
    assert.ok(!!actual, `missing actual post node at ${path}`);
    assert.ok(!!expected, `missing expected post node at ${path}`);
    return;
  }
  if (actual.type !== expected.type) {
    assert.pushResult({
      result: false,
      actual: actual.type,
      expected: expected.type,
      message: `wrong type at ${path}`
    });
  }

  switch (actual.type) {
    case POST_TYPE:
      if (actual.sections.length !== expected.sections.length) {
        assert.equal(actual.sections.length, expected.sections.length,
                     `wrong sections for post`);
      }
      if (deepCompare) {
        actual.sections.forEach((section, index) => {
          comparePostNode(section, expected.sections.objectAt(index),
                          assert, `${path}:${index}`, deepCompare);
        });
      }
      break;
    case ATOM_TYPE:
      if (actual.name !== expected.name) {
        assert.equal(actual.name, expected.name, `wrong atom name at ${path}`);
      }
      compareMarkers(actual, expected, assert, path, deepCompare);
      break;
    case MARKER_TYPE:
      compareMarkers(actual, expected, assert, path, deepCompare);
      break;
    case MARKUP_SECTION_TYPE:
    case LIST_ITEM_TYPE:
      if (actual.tagName !== expected.tagName) {
        assert.equal(actual.tagName, expected.tagName, `wrong tagName at ${path}`);
      }
      if (actual.markers.length !== expected.markers.length) {
        assert.equal(actual.markers.length, expected.markers.length,
                     `wrong markers at ${path}`);
      }
      if (deepCompare) {
        actual.markers.forEach((marker, index) => {
          comparePostNode(marker, expected.markers.objectAt(index),
                          assert, `${path}:${index}`, deepCompare);
        });
      }
      break;
    case CARD_TYPE:
      if (actual.name !== expected.name) {
        assert.equal(actual.name, expected.name, `wrong card name at ${path}`);
      }
      if (!QUnit.equiv(actual.payload, expected.payload)) {
        assert.deepEqual(actual.payload, expected.payload,
                         `wrong card payload at ${path}`);
      }
      break;
    case LIST_SECTION_TYPE:
      if (actual.items.length !== expected.items.length) {
        assert.equal(actual.items.length, expected.items.length,
                     `wrong items at ${path}`);
      }
      if (deepCompare) {
        actual.items.forEach((item, index) => {
          comparePostNode(item, expected.items.objectAt(index),
                          assert, `${path}:${index}`, deepCompare);
        });
      }
      break;
    case IMAGE_SECTION_TYPE:
      if (actual.src !== expected.src) {
        assert.equal(actual.src, expected.src, `wrong image src at ${path}`);
      }
      break;
    case MARKUP_TYPE:
      if (actual.tagName !== expected.tagName) {
        assert.equal(actual.tagName, expected.tagName,
                     `wrong tagName at ${path}`);
      }
      if (!QUnit.equiv(actual.attributes, expected.attributes)) {
        assert.deepEqual(actual.attributes, expected.attributes,
                         `wrong attributes at ${path}`);
      }
      break;
    default:
      throw new Error('wrong type :' + actual.type);
  }
}
/* eslint-enable complexity */

export default function registerAssertions(QUnit) {
  QUnit.assert.isBlank = function(val, message=`value is blank`) {
    this.pushResult({
      result: val === null || val === undefined || val === '' || val === false,
      actual: `${val} (typeof ${typeof val})`,
      expected: `null|undefined|''|false`,
      message
    });
  };

  QUnit.assert.hasElement = function(selector,
                                     message=`hasElement "${selector}"`) {
    let found = $('#qunit-fixture').find(selector);
    this.pushResult({
      result: found.length > 0,
      actual: `${found.length} matches for '${selector}'`,
      expected: `>0 matches for '${selector}'`,
      message: message
    });
    return found;
  };

  QUnit.assert.hasNoElement = function(selector,
                                       message=`hasNoElement "${selector}"`) {
    let found = $(selector);
    this.pushResult({
      result: found.length === 0,
      actual: `${found.length} matches for '${selector}'`,
      expected: `0 matches for '${selector}'`,
      message: message
    });
    return found;
  };

  QUnit.assert.hasClass = function(element, className,
                               message=`element has class "${className}"`) {
    this.pushResult({
      result: element.classList.contains(className),
      actual: element.classList,
      expected: className,
      message
    });
  };

  QUnit.assert.notHasClass = function(element, className,
                               message=`element has class "${className}"`) {
    this.pushResult({
      result: !element.classList.contains(className),
      actual: element.classList,
      expected: className,
      message
    });
  };

  QUnit.assert.selectedText = function(text, message=`selectedText "${text}"`) {
    const selected = DOMHelper.getSelectedText();
    this.pushResult({
      result: selected === text,
      actual: selected,
      expected: text,
      message: message
    });
  };

  QUnit.assert.inArray = function(element, array,
                                  message=`has "${element}" in "${array}"`) {
    QUnit.assert.ok(array.indexOf(element) !== -1, message);
  };

  QUnit.assert.postIsSimilar = function(post, expected, postName='post') {
    comparePostNode(post, expected, this, postName, true);
    let mobiledoc         = mobiledocRenderers.render(post),
        expectedMobiledoc = mobiledocRenderers.render(expected);
    this.deepEqual(mobiledoc, expectedMobiledoc,
                   `${postName} is similar to expected`);
  };

  QUnit.assert.renderTreeIsEqual = function(renderTree, expectedPost) {
    if (renderTree.rootNode.isDirty) {
      this.ok(false, 'renderTree is dirty');
      return;
    }

    expectedPost.sections.forEach((section, index) => {
      let renderNode = renderTree.rootNode.childNodes.objectAt(index);
      let path = `post:${index}`;

      let compareChildren = (parentPostNode, parentRenderNode, path) => {
        let children = parentPostNode.markers ||
                       parentPostNode.items ||
                       [];

        if (children.length !== parentRenderNode.childNodes.length) {
          this.equal(parentRenderNode.childNodes.length, children.length,
                     `wrong child render nodes at ${path}`);
          return;
        }

        children.forEach((child, index) => {
          let renderNode = parentRenderNode.childNodes.objectAt(index);

          comparePostNode(child, renderNode && renderNode.postNode,
                          this, `${path}:${index}`, false);
          compareChildren(child, renderNode, `${path}:${index}`);
        });
      };

      comparePostNode(section, renderNode.postNode, this, path, false);
      compareChildren(section, renderNode, path);
    });

    this.ok(true, 'renderNode is similar');
  };

  QUnit.assert.positionIsEqual = function(position, expected,
                                          message=`position is equal`) {
    if (position.section !== expected.section) {
      this.pushResult({
        result: false,
        actual: `${position.section.type}:${position.section.tagName}`,
        expected: `${expected.section.type}:${expected.section.tagName}`,
        message: `incorrect position section (${message})`
      });
    } else if (position.offset !== expected.offset) {
      this.pushResult({
        result: false,
        actual: position.offset,
        expected: expected.offset,
        message: `incorrect position offset (${message})`
      });
    } else {
      this.pushResult({
        result: true,
        actual: position,
        expected: expected,
        message: message
      });
    }
  };

  QUnit.assert.rangeIsEqual = function(range, expected,
                                          message=`range is equal`) {
    let { head, tail, isCollapsed, direction } = range;
    let {
      head: expectedHead,
      tail: expectedTail,
      isCollapsed: expectedIsCollapsed,
      direction: expectedDirection
    } = expected;

    let failed = false;

    if (!head.isEqual(expectedHead)) {
      failed = true;
      this.pushResult({
        result: false,
        actual: `${head.section.type}:${head.section.tagName}`,
        expected: `${expectedHead.section.type}:${expectedHead.section.tagName}`,
        message: 'incorrect head position'
      });
    }

    if (!tail.isEqual(expectedTail)) {
      failed = true;
      this.pushResult({
        result: false,
        actual: `${tail.section.type}:${tail.section.tagName}`,
        expected: `${expectedTail.section.type}:${expectedTail.section.tagName}`,
        message: 'incorrect tail position'
      });
    }

    if (isCollapsed !== expectedIsCollapsed) {
      failed = true;
      this.pushResult({
        result: false,
        actual: isCollapsed,
        expected: expectedIsCollapsed,
        message: 'wrong value for isCollapsed'
      });
    }

    if (direction !== expectedDirection) {
      failed = true;
      this.pushResult({
        result: false,
        actual: direction,
        expected: expectedDirection,
        message: 'wrong value for direction'
      });
    }

    if (!failed) {
      this.pushResult({
        result: true,
        actual: range,
        expected: expected,
        message: message
      });
    }
  };
}

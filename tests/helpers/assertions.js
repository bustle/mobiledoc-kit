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
  IMAGE_SECTION_TYPE
} from 'mobiledoc-kit/models/types';

function comparePostNode(actual, expected, assert, path='root', deepCompare=false) {
  if (!actual || !expected) {
    assert.ok(!!actual, `missing actual post node at ${path}`);
    assert.ok(!!expected, `missing expected post node at ${path}`);
    return;
  }
  if (actual.type !== expected.type) {
    assert.push(false, actual.type, expected.type, `wrong type at ${path}`);
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
    case MARKER_TYPE:
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

export default function registerAssertions() {
  QUnit.assert.hasElement = function(selector,
                                     message=`hasElement "${selector}"`) {
    let found = $(selector);
    this.push(found.length > 0, found.length, selector, message);
    return found;
  };

  QUnit.assert.hasNoElement = function(selector,
                                       message=`hasNoElement "${selector}"`) {
    let found = $(selector);
    this.push(found.length === 0, found.length, selector, message);
    return found;
  };

  QUnit.assert.selectedText = function(text, message=`selectedText "${text}"`) {
    const selected = DOMHelper.getSelectedText();
    this.push(selected === text,
              selected,
              text,
              message);
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
      this.push(false,
                `${position.section.type}:${position.section.tagName}`,
                `${expected.section.type}:${expected.section.tagName}`,
               `incorrect position section (${message})`);
    } else if (position.offset !== expected.offset) {
      this.push(false, position.offset, expected.offset,
                `incorrect position offset (${message})`);
    } else {
      this.push(true, position, expected, message);
    }
  };

}

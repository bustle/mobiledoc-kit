import registerAssertions from './helpers/assertions';
registerAssertions();

import DOMHelpers from './helpers/dom';
import MobiledocHelpers from './helpers/mobiledoc';
import PostAbstract from './helpers/post-abstract';
import { detectIE11 } from './helpers/browsers';
import wait from './helpers/wait';
import MockEditor from './helpers/mock-editor';
import renderBuiltAbstract from './helpers/render-built-abstract';
import run from './helpers/post-editor-run';
import EditorHelpers from './helpers/editor';

const { test:qunitTest, module, skip } = QUnit;

QUnit.config.urlConfig.push({
  id: 'debugTest',
  label: 'Debug Test'
});

const test = (msg, callback) => {
  let originalCallback = callback;
  callback = (...args) => {
    if (QUnit.config.debugTest) {
      debugger; // jshint ignore:line
    }
    originalCallback(...args);
  };
  qunitTest(msg, callback);
};

const skipInIE11 = (msg, callback) => {
  if (detectIE11()) {
    skip('SKIPPED IN IE11: ' + msg, callback);
  } else {
    test(msg, callback);
  }
};

QUnit.testStart(() => {
  // The fixture is cleared between tests, clearing this
  $('<div id="editor"></div>').appendTo('#qunit-fixture');
});

export default {
  dom: DOMHelpers,
  mobiledoc: MobiledocHelpers,
  postAbstract: PostAbstract,
  editor: EditorHelpers,
  test,
  module,
  skipInIE11,
  skip,
  wait,
  postEditor: { run, renderBuiltAbstract, MockEditor }
};

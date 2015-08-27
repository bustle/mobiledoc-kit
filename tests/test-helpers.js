import registerAssertions from './helpers/assertions';
registerAssertions();

import DOMHelpers from './helpers/dom';
import ToolbarHelpers from './helpers/toolbar';
import skipInPhantom from './helpers/skip-in-phantom';
import MobiledocHelpers from './helpers/mobiledoc';
import PostAbstract from './helpers/post-abstract';

const { test:qunitTest, module } = QUnit;

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

function skip(message) {
  message = `[SKIPPED] ${message}`;
  test(message, (assert) => assert.ok(true));
}

export default {
  dom: DOMHelpers,
  toolbar: ToolbarHelpers,
  skipInPhantom,
  mobiledoc: MobiledocHelpers,
  postAbstract: PostAbstract,
  skip,
  test,
  module
};

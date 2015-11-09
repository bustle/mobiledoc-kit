import registerAssertions from './helpers/assertions';
registerAssertions();

import DOMHelpers from './helpers/dom';
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

QUnit.testStart(() => {
  // The fixture is cleared between tests, clearing this
  $('<div id="editor"></div>').appendTo('#qunit-fixture');
});

export default {
  dom: DOMHelpers,
  mobiledoc: MobiledocHelpers,
  postAbstract: PostAbstract,
  test,
  module
};

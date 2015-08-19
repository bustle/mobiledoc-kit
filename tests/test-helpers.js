import registerAssertions from './helpers/assertions';
registerAssertions();

import DOMHelpers from './helpers/dom';
import ToolbarHelpers from './helpers/toolbar';
import skipInPhantom from './helpers/skip-in-phantom';
import MobiledocHelpers from './helpers/mobiledoc';
import PostAbstract from './helpers/post-abstract';

const { test } = QUnit;
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
  skip
};

const { test } = QUnit;
import isPhantom from './is-phantom';

export default function(message, testFn) {
  if (isPhantom()) {
    message = '[SKIPPED in PhantomJS] ' + message;
    testFn = (assert) => assert.ok(true);
  }
  test(message, testFn);
}

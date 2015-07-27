const { test } = QUnit;

export default function(message, testFn) {
  const isPhantom = navigator.userAgent.indexOf('PhantomJS') !== -1;
  if (isPhantom) {
    message = '[SKIPPED in PhantomJS] ' + message;
    testFn = (assert) => assert.ok(true);
  }
  test(message, testFn);
}

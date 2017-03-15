import TestLoader from 'ember-cli/test-loader';

/**
 * Ensures that when the TestLoader failures to load a test module, the error
 * is reported. Without this the rest of the full test suite still passes and there is an
 * error printed in the console only.
 * The technique is from: https://github.com/ember-cli/ember-cli-qunit/blob/master/vendor/ember-cli-qunit/test-loader.js#L55
 */
export default function(QUnit) {
  var moduleLoadFailures = [];

  TestLoader.prototype.moduleLoadFailure = function(moduleName, error) {
    moduleLoadFailures.push(error);
    QUnit.module('TestLoader Failures');
    QUnit.test(moduleName + ': could not be loaded', function() {
      throw error;
    });
  };

  QUnit.done(function() {
    if (moduleLoadFailures.length) {
      throw new Error('\n' + moduleLoadFailures.join('\n'));
    }
  });
}

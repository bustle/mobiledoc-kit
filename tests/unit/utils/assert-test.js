import Helpers from '../../test-helpers';
import mobiledocAssert from 'mobiledoc-kit/utils/assert';
import MobiledocError from 'mobiledoc-kit/utils/mobiledoc-error';

const {module, test} = Helpers;

module('Unit: Utils: assert');

test('#throws a MobiledocError when conditional is false', (assert) => {
  try {
    mobiledocAssert('The message', false);
  } catch (e) {
    assert.ok(true, 'caught error');
    assert.equal(e.message, 'The message');
    assert.ok(e instanceof MobiledocError, 'e instanceof MobiledocError');
  }
});


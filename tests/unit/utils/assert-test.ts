import Helpers from '../../test-helpers'
import mobiledocAssert from '../../../src/js/utils/assert'
import MobiledocError from '../../../src/js/utils/mobiledoc-error'

const { module, test } = Helpers

module('Unit: Utils: assert')

test('#throws a MobiledocError when conditional is false', assert => {
  try {
    mobiledocAssert('The message', false)
  } catch (e) {
    assert.ok(true, 'caught error')
    assert.equal(e instanceof Error ? e.message : '', 'The message')
    assert.ok(e instanceof MobiledocError, 'e instanceof MobiledocError')
  }
})

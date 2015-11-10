import Helpers from '../../test-helpers';
import { shallowCopyObject } from 'mobiledoc-kit/utils/copy';

const {module, test} = Helpers;

module('Unit: Utils: copy');

test('#shallowCopyObject breaks references', (assert) => {
  let obj = {a: 1, b:'b'};
  let obj2 = shallowCopyObject(obj);
  obj.a = 2;
  obj.b = 'new b';

  assert.ok(obj !== obj2, 'obj !== obj2');
  assert.equal(obj2.a, 1, 'obj2 "a" preserved');
  assert.equal(obj2.b, 'b', 'obj2 "b" preserved');
});


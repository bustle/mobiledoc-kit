const {module, test} = QUnit;

import LinkedList from 'content-kit-editor/utils/linked-list';
import LinkedItem from 'content-kit-editor/utils/linked-item';

module('Unit: Utils: LinkedList');

test('initial state', (assert) => {
  let list = new LinkedList();
  assert.equal(list.head, null, 'head is null');
  assert.equal(list.tail, null ,'tail is null');
});

['append', 'prepend', 'insertBefore', 'insertAfter'].forEach(method => {
  test(`#${method} initial item`, (assert) => {
    let list = new LinkedList();
    let item = new LinkedItem();
    list[method](item);
    assert.equal(list.head, item, 'head is item');
    assert.equal(list.tail, item, 'tail is item');
    assert.equal(item.next, null, 'item next is null');
    assert.equal(item.prev, null, 'item prev is null');
  });

  test(`#${method} call adoptItem`, (assert) => {
    let adoptedItem;
    let list = new LinkedList({
      adoptItem(item) {
        adoptedItem = item;
      }
    });
    let item = new LinkedItem();
    list[method](item);
    assert.equal(adoptedItem, item, 'item is adopted');
  });
});

test(`#append second item`, (assert) => {
  let list = new LinkedList();
  let itemOne = new LinkedItem();
  let itemTwo = new LinkedItem();
  list.append(itemOne);
  list.append(itemTwo);
  assert.equal(list.head, itemOne, 'head is itemOne');
  assert.equal(list.tail, itemTwo, 'tail is itemTwo');
  assert.equal(itemOne.prev, null, 'itemOne prev is null');
  assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
  assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
  assert.equal(itemTwo.next, null, 'itemTwo next is null');
});

test(`#prepend first item`, (assert) => {
  let list = new LinkedList();
  let itemOne = new LinkedItem();
  let itemTwo = new LinkedItem();
  list.prepend(itemTwo);
  list.prepend(itemOne);
  assert.equal(list.head, itemOne, 'head is itemOne');
  assert.equal(list.tail, itemTwo, 'tail is itemTwo');
  assert.equal(itemOne.prev, null, 'itemOne prev is null');
  assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
  assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
  assert.equal(itemTwo.next, null, 'itemTwo next is null');
});

test(`#insertBefore a middle item`, (assert) => {
  let list = new LinkedList();
  let itemOne = new LinkedItem();
  let itemTwo = new LinkedItem();
  let itemThree = new LinkedItem();
  list.prepend(itemOne);
  list.append(itemThree);
  list.insertBefore(itemTwo, itemThree);
  assert.equal(list.head, itemOne, 'head is itemOne');
  assert.equal(list.tail, itemThree, 'tail is itemThree');
  assert.equal(itemOne.prev, null, 'itemOne prev is null');
  assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
  assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
  assert.equal(itemTwo.next, itemThree, 'itemTwo next is itemThree');
  assert.equal(itemThree.prev, itemTwo, 'itemThree prev is itemTwo');
  assert.equal(itemThree.next, null, 'itemThree next is null');
});

test(`#insertAfter a middle item`, (assert) => {
  let list = new LinkedList();
  let itemOne = new LinkedItem();
  let itemTwo = new LinkedItem();
  let itemThree = new LinkedItem();
  list.prepend(itemOne);
  list.append(itemThree);
  list.insertAfter(itemTwo, itemOne);
  assert.equal(list.head, itemOne, 'head is itemOne');
  assert.equal(list.tail, itemThree, 'tail is itemThree');
  assert.equal(itemOne.prev, null, 'itemOne prev is null');
  assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
  assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
  assert.equal(itemTwo.next, itemThree, 'itemTwo next is itemThree');
  assert.equal(itemThree.prev, itemTwo, 'itemThree prev is itemTwo');
  assert.equal(itemThree.next, null, 'itemThree next is null');
});

test(`#remove an only item`, (assert) => {
  let list = new LinkedList();
  let item = new LinkedItem();
  list.append(item);
  list.remove(item);
  assert.equal(list.head, null, 'head is null');
  assert.equal(list.tail, null, 'tail is null');
  assert.equal(item.prev, null, 'item prev is null');
  assert.equal(item.next, null, 'item next is null');
});

test(`#remove calls freeItem`, (assert) => {
  let freedItem;
  let list = new LinkedList({
    freeItem(item) {
      freedItem = item;
    }
  });
  let item = new LinkedItem();
  list.append(item);
  list.remove(item);
  assert.equal(freedItem, item, 'item is freed');
});

test(`#remove a first item`, (assert) => {
  let list = new LinkedList();
  let itemOne = new LinkedItem();
  let itemTwo = new LinkedItem();
  list.append(itemOne);
  list.append(itemTwo);
  list.remove(itemOne);
  assert.equal(list.head, itemTwo, 'head is itemTwo');
  assert.equal(list.tail, itemTwo, 'tail is itemTwo');
  assert.equal(itemOne.prev, null, 'itemOne prev is null');
  assert.equal(itemOne.next, null, 'itemOne next is null');
  assert.equal(itemTwo.prev, null, 'itemTwo prev is null');
  assert.equal(itemTwo.next, null, 'itemTwo next is null');
});

test(`#remove a second item`, (assert) => {
  let list = new LinkedList();
  let itemOne = new LinkedItem();
  let itemTwo = new LinkedItem();
  list.append(itemOne);
  list.append(itemTwo);
  list.remove(itemTwo);
  assert.equal(list.head, itemOne, 'head is itemOne');
  assert.equal(list.tail, itemOne, 'tail is itemOne');
  assert.equal(itemOne.prev, null, 'itemOne prev is null');
  assert.equal(itemOne.next, null, 'itemOne next is null');
  assert.equal(itemTwo.prev, null, 'itemTwo prev is null');
  assert.equal(itemTwo.next, null, 'itemTwo next is null');
});

test(`#remove a middle item`, (assert) => {
  let list = new LinkedList();
  let itemOne = new LinkedItem();
  let itemTwo = new LinkedItem();
  let itemThree = new LinkedItem();
  list.append(itemOne);
  list.append(itemTwo);
  list.append(itemThree);
  list.remove(itemTwo);
  assert.equal(list.head, itemOne, 'head is itemOne');
  assert.equal(list.tail, itemThree, 'tail is itemThree');
  assert.equal(itemOne.prev, null, 'itemOne prev is null');
  assert.equal(itemOne.next, itemThree, 'itemOne next is itemThree');
  assert.equal(itemTwo.prev, null, 'itemTwo prev is null');
  assert.equal(itemTwo.next, null, 'itemTwo next is null');
  assert.equal(itemThree.prev, itemOne, 'itemThree prev is itemOne');
  assert.equal(itemThree.next, null, 'itemThree next is null');
});

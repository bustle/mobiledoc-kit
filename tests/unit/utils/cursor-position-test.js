import Helpers from '../../test-helpers';
import Position from 'mobiledoc-kit/utils/cursor/position';

const {module, test} = Helpers;

module('Unit: Utils: Position');

test('#move moves forward and backward in markup section', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abcd')])]);
  });
  let position = new Position(post.sections.head, 'ab'.length);
  let rightPosition = new Position(post.sections.head, 'abc'.length);
  let leftPosition = new Position(post.sections.head, 'a'.length);

  assert.positionIsEqual(position.moveRight(), rightPosition, 'right position');
  assert.positionIsEqual(position.moveLeft(), leftPosition, 'left position');
});

test('#move moves forward and backward between markup sections', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('a')]),
      markupSection('p', [marker('b')]),
      markupSection('p', [marker('c')])
    ]);
  });
  let midHead = post.sections.objectAt(1).headPosition();
  let midTail = post.sections.objectAt(1).tailPosition();

  let aTail   = post.sections.head.tailPosition();
  let cHead   = post.sections.tail.headPosition();

  assert.positionIsEqual(midHead.moveLeft(), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.moveRight(), cHead, 'right to next section');
});

test('#move from one nested section to another', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [
      listItem([marker('a')]),
      listItem([marker('b')]),
      listItem([marker('c')])
    ])]);
  });
  let midHead = post.sections.head.items.objectAt(1).headPosition();
  let midTail = post.sections.head.items.objectAt(1).tailPosition();

  let aTail   = post.sections.head.items.head.tailPosition();
  let cHead   = post.sections.tail.items.tail.headPosition();

  assert.positionIsEqual(midHead.moveLeft(), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.moveRight(), cHead, 'right to next section');
});

test('#move from last nested section to next un-nested section', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('a')]),
      listSection('ul', [listItem([marker('b')])]),
      markupSection('p', [marker('c')])
    ]);
  });
  let midHead = post.sections.objectAt(1).items.head.headPosition();
  let midTail = post.sections.objectAt(1).items.head.tailPosition();

  let aTail   = post.sections.head.tailPosition();
  let cHead   = post.sections.tail.headPosition();

  assert.positionIsEqual(midHead.moveLeft(), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.moveRight(), cHead, 'right to next section');
});

test('#move across and beyond card section', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, cardSection, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('a')]),
      cardSection('my-card'),
      markupSection('p', [marker('c')])
    ]);
  });
  let midHead = post.sections.objectAt(1).headPosition();
  let midTail = post.sections.objectAt(1).tailPosition();

  let aTail   = post.sections.head.tailPosition();
  let cHead   = post.sections.tail.headPosition();

  assert.positionIsEqual(midHead.moveLeft(), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.moveRight(), cHead, 'right to next section');
  assert.positionIsEqual(midHead.moveRight(), midTail, 'move l-to-r across card');
  assert.positionIsEqual(midTail.moveLeft(), midHead, 'move r-to-l across card');
});

test('#move across and beyond card section into list section', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, cardSection, listSection, listItem, marker}) => {
    return post([
      listSection('ul', [
        listItem([marker('a1')]),
        listItem([marker('a2')])
      ]),
      cardSection('my-card'),
      listSection('ul', [
        listItem([marker('c1')]),
        listItem([marker('c2')])
      ])
    ]);
  });
  let midHead = post.sections.objectAt(1).headPosition();
  let midTail = post.sections.objectAt(1).tailPosition();

  let aTail   = post.sections.head.items.tail.tailPosition();
  let cHead   = post.sections.tail.items.head.headPosition();

  assert.positionIsEqual(midHead.moveLeft(), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.moveRight(), cHead, 'right to next section');
});

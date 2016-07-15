import Helpers from '../../test-helpers';
import Position from 'mobiledoc-kit/utils/cursor/position';
import { CARD_ELEMENT_CLASS_NAME, ZWNJ } from 'mobiledoc-kit/renderers/editor-dom';

const {module, test} = Helpers;

let editor, editorElement;

module('Unit: Utils: Position', {
  beforeEach() {
    editorElement = $('#editor')[0];
  },
  afterEach() {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

test('#move moves forward and backward in markup section', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abcd')])]);
  });
  let position = new Position(post.sections.head, 'ab'.length);
  let rightPosition = new Position(post.sections.head, 'abc'.length);
  let leftPosition = new Position(post.sections.head, 'a'.length);

  assert.positionIsEqual(position.move(1), rightPosition, 'right position');
  assert.positionIsEqual(position.move(-1), leftPosition, 'left position');
});

test('#move is emoji-aware', (assert) => {
  let emoji = '🙈';
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker(`a${emoji}z`)])]);
  });
  let marker = post.sections.head.markers.head;
  assert.equal(marker.length, 'a'.length + 2 + 'z'.length); // precond
  let position = post.sections.head.headPosition();

  position = position.move(1);
  assert.equal(position.offset, 1);
  position = position.move(1);
  assert.equal(position.offset, 3); // l-to-r across emoji
  position = position.move(1);
  assert.equal(position.offset, 4);

  position = position.move(-1);
  assert.equal(position.offset, 3);

  position = position.move(-1); // r-to-l across emoji
  assert.equal(position.offset, 1);

  position = position.move(-1);
  assert.equal(position.offset, 0);
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

  assert.positionIsEqual(midHead.move(-1), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.move(1), cHead, 'right to next section');
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

  assert.positionIsEqual(midHead.move(-1), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.move(1), cHead, 'right to next section');
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

  assert.positionIsEqual(midHead.move(-1), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.move(1), cHead, 'right to next section');
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

  assert.positionIsEqual(midHead.move(-1), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.move(1), cHead, 'right to next section');
  assert.positionIsEqual(midHead.move(1), midTail, 'move l-to-r across card');
  assert.positionIsEqual(midTail.move(-1), midHead, 'move r-to-l across card');
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

  assert.positionIsEqual(midHead.move(-1), aTail, 'left to prev section');
  assert.positionIsEqual(midTail.move(1), cHead, 'right to next section');
});

test('#move left at headPosition or right at tailPosition returns self', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('def')])
    ]);
  });

  let head = post.headPosition(),
      tail = post.tailPosition();
  assert.positionIsEqual(head.move(-1), head, 'head move left is head');
  assert.positionIsEqual(tail.move(1), tail, 'tail move right is tail');
});

test('#move can move multiple units', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('def')])
    ]);
  });

  let head = post.headPosition(),
      tail = post.tailPosition();

  assert.positionIsEqual(head.move('abc'.length + 1 + 'def'.length), tail, 'head can move to tail');
  assert.positionIsEqual(tail.move(-1 * ('abc'.length + 1 + 'def'.length)), head, 'tail can move to head');

  assert.positionIsEqual(head.move(0), head, 'move(0) is no-op');
});

test('#fromNode when node is marker text node', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc'), marker('123')])]);
  });

  let textNode = editorElement.firstChild  // p
                              .lastChild; // textNode

  assert.equal(textNode.textContent, '123', 'precond - correct text node');

  let renderTree = editor._renderTree;
  let position = Position.fromNode(renderTree, textNode, 2);

  let section = editor.post.sections.head;
  assert.positionIsEqual(position, new Position(section, 'abc'.length + 2));
});

test('#fromNode when node is section node with offset', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc'), marker('123')])]);
  });

  let pNode = editorElement.firstChild;
  assert.equal(pNode.tagName.toLowerCase(), 'p', 'precond - correct node');

  let renderTree = editor._renderTree;
  let position = Position.fromNode(renderTree, pNode, 0);

  assert.positionIsEqual(position, editor.post.sections.head.headPosition());
});

test('#fromNode when node is root element and offset is 0', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc'), marker('123')])]);
  });

  let renderTree = editor._renderTree;
  let position = Position.fromNode(renderTree, editorElement, 0);

  assert.positionIsEqual(position, editor.post.headPosition());
});

test('#fromNode when node is root element and offset is > 0', (assert) => {
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc'), marker('123')])]);
  });

  let renderTree = editor._renderTree;
  let position = Position.fromNode(renderTree, editorElement, 1);

  assert.positionIsEqual(position, editor.post.tailPosition());
});

test('#fromNode when node is card section element or next to it', (assert) => {
  let editorOptions = { cards: [{
    name: 'some-card',
    type: 'dom',
    render() {
      return $('<div id="the-card">this is the card</div>')[0];
    }
  }]};
  editor = Helpers.mobiledoc.renderInto(editorElement,
    ({post, cardSection}) => {
    return post([cardSection('some-card')]);
  }, editorOptions);

  let nodes = {
    wrapper:     editorElement.firstChild,
    leftCursor:  editorElement.firstChild.firstChild,
    rightCursor: editorElement.firstChild.lastChild,
    cardDiv:     editorElement.firstChild.childNodes[1]
  };

  assert.ok(nodes.wrapper && nodes.leftCursor && nodes.rightCursor &&
            nodes.cardDiv,
            'precond - nodes');

  assert.equal(nodes.wrapper.tagName.toLowerCase(), 'div', 'precond - wrapper');
  assert.equal(nodes.leftCursor.textContent, ZWNJ, 'precond - left cursor');
  assert.equal(nodes.rightCursor.textContent, ZWNJ, 'precond - right cursor');
  assert.ok(nodes.cardDiv.className.indexOf(CARD_ELEMENT_CLASS_NAME) !== -1,
            'precond -card div');

  let renderTree = editor._renderTree;
  let cardSection = editor.post.sections.head;

  let leftPos  = cardSection.headPosition();
  let rightPos = cardSection.tailPosition();

  assert.positionIsEqual(Position.fromNode(renderTree, nodes.wrapper, 0),
                         leftPos, 'wrapper offset 0');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.wrapper, 1),
                         leftPos, 'wrapper offset 1');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.wrapper, 2),
                         rightPos, 'wrapper offset 2');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.leftCursor, 0),
                         leftPos, 'left cursor offset 0');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.leftCursor, 1),
                         leftPos, 'left cursor offset 1');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.rightCursor, 0),
                         rightPos, 'right cursor offset 0');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.rightCursor, 1),
                         rightPos, 'right cursor offset 1');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.cardDiv, 0),
                         leftPos, 'card div offset 0');
  assert.positionIsEqual(Position.fromNode(renderTree, nodes.cardDiv, 1),
                         leftPos, 'card div offset 1');
});

test('Position cannot be on list section', (assert) => {
  let post = Helpers.postAbstract.build(({post, listSection, listItem}) => {
    return post([listSection('ul', [listItem()])]);
  });

  let listSection = post.sections.head;
  let listItem = listSection.items.head;

  let position;
  assert.throws(() => {
    position = new Position(listSection, 0);
  }, /addressable by the cursor/);

  position = new Position(listItem, 0);
  assert.ok(position, 'position with list item is ok');
});

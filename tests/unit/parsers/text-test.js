import TextParser from 'mobiledoc-kit/parsers/text';
import { SECTION_BREAK } from 'mobiledoc-kit/parsers/text';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';

const {module, test} = Helpers;

let parser;

module('Unit: Parser: TextParser', {
  beforeEach() {
    const builder = new PostNodeBuilder();
    parser = new TextParser(builder);
  },
  afterEach() {
    parser = null;
  }
});

test('#parse returns a markup section when given single line of text', (assert) => {
  let text = 'some text';
  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('some text')])]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse returns multiple markup sections when given multiple lines', (assert) => {
  let text = ['first', 'second', 'third'].join(SECTION_BREAK);
  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('first')]),
      markupSection('p', [marker('second')]),
      markupSection('p', [marker('third')])
    ]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse returns multiple sections when lines are separated by CR+LF', (assert) => {
  let text = ['first', 'second', 'third'].join('\r\n');
  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('first')]),
      markupSection('p', [marker('second')]),
      markupSection('p', [marker('third')])
    ]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse returns multiple sections when lines are separated by CR', (assert) => {
  let text = ['first', 'second', 'third'].join('\r');
  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('first')]),
      markupSection('p', [marker('second')]),
      markupSection('p', [marker('third')])
    ]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse returns list section when text starts with "*"', (assert) => {
  let text = '* a list item';

  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(({post, listSection, listItem, marker}) => {
    return post([
      listSection('ul', [listItem([marker('a list item')])])
    ]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse returns list section with multiple items when text starts with "*"', (assert) => {
  let text = ['* first', '* second'].join(SECTION_BREAK);

  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(({post, listSection, listItem, marker}) => {
    return post([
      listSection('ul', [
        listItem([marker('first')]),
        listItem([marker('second')])
      ])
    ]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse returns list sections separated by markup sections', (assert) => {
  let text = ['* first list', 'middle section', '* second list'].join(SECTION_BREAK);

  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([
      listSection('ul', [
        listItem([marker('first list')])
      ]),
      markupSection('p', [marker('middle section')]),
      listSection('ul', [
        listItem([marker('second list')])
      ])
    ]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse returns ordered list items', (assert) => {
  let text = '1. first list';

  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([listSection('ol', [listItem([marker('first list')])])]);
  });

  assert.postIsSimilar(post, expected);
});

test('#parse can have ordered and unordered lists together', (assert) => {
  let text = ['1. ordered list', '* unordered list'].join(SECTION_BREAK);

  let post = parser.parse(text);
  let expected = Helpers.postAbstract.build(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([
      listSection('ol', [listItem([marker('ordered list')])]),
      listSection('ul', [listItem([marker('unordered list')])])
    ]);
  });

  assert.postIsSimilar(post, expected);
});

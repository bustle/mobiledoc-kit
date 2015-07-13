import DOMParser from 'content-kit-editor/parsers/dom';
import { generateBuilder } from 'content-kit-editor/utils/post-builder';

const { module, test } = window.QUnit;

function buildDOM(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div;
}

let parser, builder, expectedPost;

module('Unit: DOMParser', {
  beforeEach() {
    parser = new DOMParser();
    builder = generateBuilder();
    expectedPost = builder.generatePost();
  },
  afterEach() {
    parser = null;
    builder = null;
    expectedPost = null;
  }
});

test('parse empty content', (assert) => {
  const post = parser.parse(buildDOM(''));
  assert.deepEqual(post, expectedPost);
});

test('blank textnodes are ignored', (assert) => {
  let post = parser.parse(buildDOM('<p>first line</p>\n<p>second line</p>'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([], 0, 'first line'));
  expectedPost.appendSection(expectedFirst);
  let expectedSecond = builder.generateSection('P');
  expectedSecond.markers.push(builder.generateMarker([], 0, 'second line'));
  expectedPost.appendSection(expectedSecond);

  assert.deepEqual(post, expectedPost);
});

test('textnode adjacent to p tag becomes section', (assert) => {
  const post = parser.parse(buildDOM('<p>first line</p>second line'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([], 0, 'first line'));
  expectedPost.appendSection(expectedFirst);
  let expectedSecond = builder.generateSection('P', {}, true);
  expectedSecond.markers.push(builder.generateMarker([], 0, 'second line'));
  expectedPost.appendSection(expectedSecond);

  assert.deepEqual(post, expectedPost);
});

test('p tag (section markup) should create a block', (assert) => {
  const post = parser.parse(buildDOM('<p>text</p>'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([], 0, 'text'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('strong tag (stray markup) without a block should create a block', (assert) => {
  const post = parser.parse(buildDOM('<strong>text</strong>'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('STRONG')
  ], 1, 'text'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('strong tag with inner em (stray markup) without a block should create a block', (assert) => {
  const post = parser.parse(buildDOM('<strong><em>stray</em> markup tags</strong>.'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('STRONG'),
    builder.generateMarkerType('EM')
  ], 1, 'stray'));
  expectedFirst.markers.push(builder.generateMarker([], 1, ' markup tags'));
  expectedFirst.markers.push(builder.generateMarker([], 0, '.'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('stray text (stray markup) should create a block', (assert) => {
  const post = parser.parse(buildDOM('text'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([], 0, 'text'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('text node, strong tag, text node (stray markup) without a block should create a block', (assert) => {
  const post = parser.parse(buildDOM('start <strong>bold</strong> end'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([], 0, 'start '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('STRONG')
  ], 1, 'bold'));
  expectedFirst.markers.push(builder.generateMarker([], 0, ' end'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('italic tag (stray markup) without a block should create a block', (assert) => {
  const post = parser.parse(buildDOM('<em>text</em>'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('EM')
  ], 1, 'text'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('u tag (stray markup) without a block should strip U and create a block', (assert) => {
  const post = parser.parse(buildDOM('<u>text</u>'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([], 0, 'text'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('a tag (stray markup) without a block should create a block', (assert) => {
  var url = "http://test.com";
  const post = parser.parse(buildDOM('<a href="'+url+'">text</a>'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('A', ['href', url])
  ], 1, 'text'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

/* FIXME: What should happen with br
test('markup: break', (assert) => {
  const post = parser.parse(buildDOM('line <br/>break'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([], 0, 'line '));
  expectedFirst.markers.push(builder.generateMarker([], 0, 'break'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});
*/

test('sub tag (stray markup) without a block should filter SUB and create a block', (assert) => {
  const post = parser.parse(buildDOM('footnote<sub>1</sub>'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([], 0, 'footnote'));
  expectedFirst.markers.push(builder.generateMarker([], 0, '1'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('sup tag (stray markup) without a block should filter SUP and create a block', (assert) => {
  const post = parser.parse(buildDOM('e=mc<sup>2</sup>'));

  let expectedFirst = builder.generateSection('P', {}, true);
  expectedFirst.markers.push(builder.generateMarker([], 0, 'e=mc'));
  expectedFirst.markers.push(builder.generateMarker([], 0, '2'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('list (stray markup) without a block should create a block', (assert) => {
  const post = parser.parse(buildDOM('<ul><li>Item 1</li><li>Item 2</li></ul>'));

  let expectedFirst = builder.generateSection('UL');
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('LI')
  ], 1, 'Item 1'));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('LI')
  ], 1, 'Item 2'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('nested tags (section markup) should create a block', (assert) => {
  const post = parser.parse(buildDOM('<p><em><strong>Double.</strong></em> <strong><em>Double staggered</em> start.</strong> <strong>Double <em>staggered end.</em></strong> <strong>Double <em>staggered</em> middle.</strong></p>'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('EM'),
    builder.generateMarkerType('STRONG')
  ], 2, 'Double.'));
  expectedFirst.markers.push(builder.generateMarker([], 0, ' '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('STRONG'),
    builder.generateMarkerType('EM')
  ], 1, 'Double staggered'));
  expectedFirst.markers.push(builder.generateMarker([], 1, ' start.'));
  expectedFirst.markers.push(builder.generateMarker([], 0, ' '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('STRONG')
  ], 0, 'Double '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('EM')
  ], 2, 'staggered end.'));
  expectedFirst.markers.push(builder.generateMarker([], 0, ' '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('STRONG')
  ], 0, 'Double '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('EM')
  ], 1, 'staggered'));
  expectedFirst.markers.push(builder.generateMarker([], 1, ' middle.'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

/*
 * FIXME: Update these tests to use the renderer
 *
test('markup: nested/unsupported tags', (assert) => {
  var parsed = compiler.parse('<p>Test one <strong>two</strong> <em><strong>three</strong></em> <span>four</span> <span><strong>five</strong></span> <strong><span>six</span></strong> <strong></strong><span></span><strong><span></span></strong><span><strong></strong></span>seven</p>');

  equal ( parsed.length, 1 );
  equal ( parsed[0].type, Type.PARAGRAPH.id );
  equal ( parsed[0].value, 'Test one two three four five six seven' );
  equal ( parsed[0].markup.length, 5 );

  equal ( parsed[0].markup[0].type, Type.BOLD.id );
  equal ( parsed[0].markup[0].start, 9 );
  equal ( parsed[0].markup[0].end, 12 );

  equal ( parsed[0].markup[1].type, Type.ITALIC.id );
  equal ( parsed[0].markup[1].start, 13 );
  equal ( parsed[0].markup[1].end, 18 );

  equal ( parsed[0].markup[2].type, Type.BOLD.id );
  equal ( parsed[0].markup[2].start, 13 );
  equal ( parsed[0].markup[2].end, 18 );

  equal ( parsed[0].markup[3].type, Type.BOLD.id );
  equal ( parsed[0].markup[3].start, 24 );
  equal ( parsed[0].markup[3].end, 28 );

  equal ( parsed[0].markup[4].type, Type.BOLD.id );
  equal ( parsed[0].markup[4].start, 29 );
  equal ( parsed[0].markup[4].end, 32 );
});

test('markup: preserves spaces in empty tags', (assert) => {
  var rendered = compiler.rerender('<p>Testing a<span> </span><em>space</em></p>');
  equal ( rendered, '<p>Testing a <em>space</em></p>');
});

test('markup: self-closing tags with nesting', (assert) => {
  var input = '<p><strong>Blah <br/>blah</strong> <br/>blah</p>';
  var parsed = compiler.parse(input);

  equal ( parsed[0].value, 'Blah blah blah' );
  equal ( parsed[0].markup.length, 3 );

  equal ( parsed[0].markup[0].type, Type.BOLD.id );
  equal ( parsed[0].markup[0].start, 0 );
  equal ( parsed[0].markup[0].end, 9 );

  equal ( parsed[0].markup[1].type, Type.BREAK.id );
  equal ( parsed[0].markup[1].start, 5 );
  equal ( parsed[0].markup[1].end, 5 );

  equal ( parsed[0].markup[2].type, Type.BREAK.id );
  equal ( parsed[0].markup[2].start, 10 );
  equal ( parsed[0].markup[2].end, 10 );
});

test('markup: whitespace', (assert) => {
  var parsed = compiler.parse('<ul>   ' +
                              '\t <li>Item <em>1</em></li> &nbsp;\n' +
                              '   <li><strong>Item 2</strong></li>\r\n &nbsp; ' +
                              '\t\t<li><strong>Item</strong> 3</li>\r' +
                              '</ul>');
  equal ( parsed.length, 1 );
  equal ( parsed[0].value, 'Item 1 Item 2 Item 3' );

  var markup = parsed[0].markup
  equal ( markup.length, 6);
  equal ( markup[0].type, Type.LIST_ITEM.id );
  equal ( markup[0].start, 0 );
  equal ( markup[0].end, 6 );
  equal ( markup[1].type, Type.ITALIC.id );
  equal ( markup[1].start, 5 );
  equal ( markup[1].end, 6 );
  equal ( markup[2].type, Type.LIST_ITEM.id );
  equal ( markup[2].start, 7 );
  equal ( markup[2].end, 13 );
  equal ( markup[3].type, Type.BOLD.id );
  equal ( markup[3].start, 7 );
  equal ( markup[3].end, 13 );
  equal ( markup[4].type, Type.LIST_ITEM.id );
  equal ( markup[4].start, 14 );
  equal ( markup[4].end, 20 );
  equal ( markup[5].type, Type.BOLD.id );
  equal ( markup[5].start, 14 );
  equal ( markup[5].end, 18 );
});

test('markup: consistent order', (assert) => {
  var correctlyOrdered = compiler.parse('<p><a><strong>text</strong></a></p>');
  var incorrectlyOrdered = compiler.parse('<p><strong><a>text</a></strong></p>');

  equal( compiler.render(correctlyOrdered),  compiler.render(incorrectlyOrdered) );
});
*/

test('attributes', (assert) => {
  var href = 'http://google.com';
  var rel = 'nofollow';
  const post = parser.parse(buildDOM('<p><a href="'+href+'" rel="'+rel+'">Link to google.com</a></p>'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('A', ['href', href, 'rel', rel])
  ], 1, 'Link to google.com'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('attributes filters out inline styles and classes', (assert) => {
  const post = parser.parse(buildDOM('<p class="test" style="color:red;"><b style="line-height:11px">test</b></p>'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('B')
  ], 1, 'test'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('blocks: paragraph', (assert) => {
  const post = parser.parse(buildDOM('<p>TEXT</p>'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([], 0, 'TEXT'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('blocks: heading', (assert) => {
  const post = parser.parse(buildDOM('<h2>TEXT</h2>'));

  let expectedFirst = builder.generateSection('H2');
  expectedFirst.markers.push(builder.generateMarker([], 0, 'TEXT'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('blocks: subheading', (assert) => {
  const post = parser.parse(buildDOM('<h3>TEXT</h3>'));

  let expectedFirst = builder.generateSection('H3');
  expectedFirst.markers.push(builder.generateMarker([], 0, 'TEXT'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

/* FIXME: should not create a markup type section
test('blocks: image', (assert) => {
  var url = "http://domain.com/text.png";
  const post = parser.parse(buildDOM('<img src="'+url+'" />'));
  assert.deepEqual( post, {
    sections: [{
      type: MARKUP_SECTION,
      tagName: 'IMG',
      attributes: ['src', url],
      markups: []
    }]
  });
});
*/

test('blocks: quote', (assert) => {
  const post = parser.parse(buildDOM('<blockquote>quote</blockquote>'));

  let expectedFirst = builder.generateSection('BLOCKQUOTE');
  expectedFirst.markers.push(builder.generateMarker([], 0, 'quote'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('blocks: list', (assert) => {
  const post = parser.parse(buildDOM('<ul><li>Item 1</li> <li>Item 2</li></ul>'));

  let expectedFirst = builder.generateSection('UL');
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('LI')
  ], 1, 'Item 1'));
  expectedFirst.markers.push(builder.generateMarker([], 0, ' '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('LI')
  ], 1, 'Item 2'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

test('blocks: ordered list', (assert) => {
  const post = parser.parse(buildDOM('<ol><li>Item 1</li> <li>Item 2</li></ol>'));

  let expectedFirst = builder.generateSection('OL');
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('LI')
  ], 1, 'Item 1'));
  expectedFirst.markers.push(builder.generateMarker([], 0, ' '));
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('LI')
  ], 1, 'Item 2'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

/*
test('blocks: mixed', (assert) => {
  var input = '<h2>The Title</h2><h3>The Subtitle</h3><p>TEXT <strong>1</strong></p><p>TEXT <strong><em>2</em></strong></p><p>TEXT with a <a href="http://google.com/">link</a>.</p><blockquote>Quote</blockquote>';
  var parsed = compiler.parse(input);

  equal ( parsed.length, 6 );
  equal ( parsed[0].type, Type.HEADING.id );
  equal ( parsed[1].type, Type.SUBHEADING.id );
  equal ( parsed[2].type, Type.PARAGRAPH.id );
  equal ( parsed[3].type, Type.PARAGRAPH.id );
  equal ( parsed[4].type, Type.PARAGRAPH.id );
  equal ( parsed[5].type, Type.QUOTE.id );
});
*/

/* FIXME: needs images, br support
test('blocks: self-closing', (assert) => {
  var url = 'http://domain.com/test.png';
  const post = parser.parse(buildDOM('<img src="'+url+'"/><p>Line<br/>break</p>'));

  assert.deepEqual( post, {
    sections: [{
      type: MARKUP_SECTION,
      tagName: 'IMG',
      attributes: ['src', url],
      markups: []
    }, {
      type: MARKUP_SECTION,
      tagName: 'P',
      markups: [{
        open: [],
        close: 0,
        value: 'Line'
      }, {
        open: [{
          tagName: 'BR'
        }],
        close: 1,
        value: null
      }, {
        open: [],
        close: 0,
        value: 'break'
      }]
    }]
  });
});
*/

test('converts tags to mapped values', (assert) => {
  // FIXME: Should probably be normalizing b to strong etc
  const post = parser.parse(buildDOM('<p><b><i>Converts</i> tags</b>.</p>'));

  let expectedFirst = builder.generateSection('P');
  expectedFirst.markers.push(builder.generateMarker([
    builder.generateMarkerType('B'),
    builder.generateMarkerType('I')
  ], 1, 'Converts'));
  expectedFirst.markers.push(builder.generateMarker([], 1, ' tags'));
  expectedFirst.markers.push(builder.generateMarker([], 0, '.'));
  expectedPost.appendSection(expectedFirst);

  assert.deepEqual(post, expectedPost);
});

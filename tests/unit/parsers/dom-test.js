import DOMParser from 'mobiledoc-kit/parsers/dom';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';
import { TAB } from 'mobiledoc-kit/utils/characters';

const {module, test} = Helpers;
const { postAbstract: { buildFromText } } = Helpers;
const ZWNJ = '\u200c';

let editorElement, builder, parser, editor;
let editorOpts;
let buildDOM = Helpers.dom.fromHTML;

let mentionAtom = {
  name: 'mention',
  type: 'dom',
  render({value}) {
    let element = document.createElement('span');
    element.setAttribute('id', 'mention-atom');
    element.appendChild(document.createTextNode(value));
    return element;
  }
};

module('Unit: Parser: DOMParser', {
  beforeEach() {
    editorElement = $('#editor')[0];
    builder = new PostNodeBuilder();
    parser = new DOMParser(builder);
    editorOpts = { element: editorElement, atoms: [mentionAtom] };
  },
  afterEach() {
    builder = null;
    parser = null;
    if (editor) {
      editor.destroy();
      editor = null;
    }
  }
});

let expectations = [
  ['<p>some text</p>', ['some text']],
  ['<p>some text</p><p>some other text</p>', ['some text','some other text']],
  ['<p>some &nbsp;text &nbsp;&nbsp;for &nbsp; &nbsp;you</p>', ['some  text   for    you']],
  ['<p>a\u2003b</p>', [`a${TAB}b`]],

  // multiple ps, with and without adjacent text nodes
  ['<p>first line</p>\n<p>second line</p>', ['first line','second line']],
  ['<p>first line</p>middle line<p>third line</p>', ['first line','middle line','third line']],
  ['<p>first line</p>second line', ['first line','second line']],
  ['<p>first line</p><p></p><p>third line</p>', ['first line', 'third line']],

  ['<b>bold text</b>',['*bold text*']],

  // unrecognized tags
  ['<p>before<span>span</span>after</p>',['beforespanafter']],
  ['<p><span><span>inner</span></span></p>', ['inner']],

  //  unrecognized attribute
  ['<p><span style="font-color:red;">was red</span></p>', ['was red']],

  // list elements
  ['<ul><li>first element</li><li>second element</li></ul>', ['* first element', '* second element']],

  // nested list elements
  ['<ul><li>first element</li><li><ul><li>nested element</li></ul></li></ul>', ['* first element', '* nested element']],

  // See https://github.com/bustle/mobiledoc-kit/issues/333
  ['abc\ndef', ['abc def']],
];

let structures = [
  // See https://github.com/bustle/mobiledoc-kit/issues/648
  ['<section><p>first</p><p>second</p></section>', ['first', 'second'], 'one level'],
  ['<section><div><p>first</p><p>second</p></div></section>', ['first', 'second'], 'two levels'],
  ['<section><div><div><p>first</p><p>second</p></div></div></section>', ['first', 'second'], 'three levels'],
  ['<section><div><p>first</p></div><p>second</p></section>', ['first', 'second'], 'offset left'],
  ['<section><p>first</p><div><p>second</p></div></section>', ['first', 'second'], 'offset right'],
  // Part two - siblings
  ['<section><p>first</p></section><section><p>second</p></section>', ['first', 'second'], 'siblings'],
  ['<div><section><p>first</p></section><section><p>second</p></section></div>', ['first', 'second'], 'wrapped siblings'],
  ['<section><div><p>first</p></div></section><section><div><p>second</p></div></section>', ['first', 'second'], 'two-level siblings'],
  ['<section><div><p>first</p></div></section><section><p>second</p></section>', ['first', 'second'], 'offset siblings left'],
  ['<section><p>first</p></section><section><div><p>second</p></div></section>', ['first', 'second'], 'offset siblings right'],
  // Part three - trees
  ['<section><p>first</p></section><section><div><p>second</p></div><section><div><p>third</p><p>fourth</p></div></section></section>', ['first', 'second', 'third', 'fourth'], 'tree']
];

expectations.forEach(([html, dslText]) => {
  test(`#parse ${html} -> ${dslText}`, (assert) => {
    let post = parser.parse(buildDOM(html));
    let { post: expected } = buildFromText(dslText);

    assert.postIsSimilar(post, expected);
  });
});

structures.forEach(([html, dslText, name]) => {
  test(`wrapped#parse ${html} -> ${dslText} (${name})`, (assert) => {
    let post = parser.parse(buildDOM(html));
    let { post: expected } = buildFromText(dslText);

    assert.postIsSimilar(post, expected);
  });
});

test('editor#parse fixes text in atom headTextNode when atom is at start of section', (assert) => {
  let done = assert.async();
  let {post: expected} = buildFromText(['X@("name": "mention", "value": "bob")']);
  editor = Helpers.editor.buildFromText('@("name": "mention", "value": "bob")', editorOpts);

  let headTextNode = editor.post.sections.head.markers.head.renderNode.headTextNode;
  assert.ok(!!headTextNode, 'precond - headTextNode');
  headTextNode.textContent = ZWNJ + 'X';

  Helpers.wait(() => { // wait for mutation
    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);

    done();
  });
});

test('editor#parse fixes text in atom headTextNode when atom has atom before it', (assert) => {
  let done = assert.async();
  let {post: expected} = buildFromText('@("name": "mention", "value": "first")X@("name": "mention", "value": "last")');
  editor = Helpers.editor.buildFromText('@("name": "mention", "value": "first")@("name": "mention", "value": "last")', editorOpts);

  let headTextNode = editor.post.sections.head.markers.tail.renderNode.headTextNode;
  assert.ok(!!headTextNode, 'precond - headTextNode');
  headTextNode.textContent = ZWNJ + 'X';

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    done();
  });
});

test('editor#parse fixes text in atom headTextNode when atom has marker before it', (assert) => {
  let done = assert.async();
  let {post: expected} = buildFromText('textX@("name":"mention","value":"bob")');
  editor = Helpers.editor.buildFromText('text@("name":"mention","value":"bob")', editorOpts);

  let headTextNode = editor.post.sections.head.markers.objectAt(1).renderNode.headTextNode;
  assert.ok(!!headTextNode, 'precond - headTextNode');
  headTextNode.textContent = ZWNJ + 'X';

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    done();
  });
});

test('editor#parse fixes text in atom tailTextNode when atom is at end of section', (assert) => {
  let done = assert.async();
  let {post: expected} = buildFromText('@("name":"mention","value":"bob")X');
  editor = Helpers.editor.buildFromText('@("name":"mention","value":"bob")', editorOpts);

  let tailTextNode = editor.post.sections.head.markers.head.renderNode.tailTextNode;
  assert.ok(!!tailTextNode, 'precond - tailTextNode');
  tailTextNode.textContent = ZWNJ + 'X';

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    done();
  });
});

test('editor#parse fixes text in atom tailTextNode when atom has atom after it', (assert) => {
  let done = assert.async();
  let {post: expected} = buildFromText('@("name":"mention","value":"first")X@("name":"mention","value":"last")');
  editor = Helpers.editor.buildFromText('@("name":"mention","value":"first")@("name":"mention","value":"last")',
                                        editorOpts);

  let tailTextNode = editor.post.sections.head.markers.head.renderNode.tailTextNode;
  assert.ok(!!tailTextNode, 'precond - tailTextNode');
  tailTextNode.textContent = ZWNJ + 'X';

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    done();
  });
});

test('editor#parse fixes text in atom tailTextNode when atom has marker after it', (assert) => {
  let done = assert.async();
  let {post: expected} = buildFromText('@("name":"mention","value":"bob")Xabc');
  editor = Helpers.editor.buildFromText('@("name":"mention","value":"bob")abc',
                                        editorOpts);

  let tailTextNode = editor.post.sections.head.markers.head.renderNode.tailTextNode;
  assert.ok(!!tailTextNode, 'precond - tailTextNode');
  tailTextNode.textContent = ZWNJ + 'X';

  Helpers.wait(() => {
    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    done();
  });
});

test('parse empty content', (assert) => {
  let element = buildDOM('');
  const post = parser.parse(element);

  assert.ok(post.isBlank, 'post is blank');
});

test('plain text creates a section', (assert) => {
  let container = buildDOM('plain text');
  let element = container.firstChild;
  const post = parser.parse(element);
  let {post: expected} = buildFromText('plain text');

  assert.postIsSimilar(post, expected);
});

test('strong tag + em + text node creates section', (assert) => {
  let element = buildDOM('<b><em>stray</em> markup tags</b>');
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, 'parse 1 section');
  assert.equal(post.sections.objectAt(0).text, 'stray markup tags');

  let markers = post.sections.objectAt(0).markers.toArray();
  assert.equal(markers.length, 2, '2 markers');

  let [m1, m2] = markers;

  assert.equal(m1.value, 'stray');
  assert.equal(m2.value, ' markup tags');

  assert.ok(m1.hasMarkup('b'), 'm1 is b');
  assert.ok(m1.hasMarkup('em'), 'm1 is em');

  assert.ok(m2.hasMarkup('b'), 'm2 is b');
  assert.ok(!m2.hasMarkup('em'), 'm1 is not em');
});

test('wrapped strong tag + em + text node creates section', (assert) => {
  let element = buildDOM('<div><b><em>stray</em> markup tags</b></div>');
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, 'parse 1 section');
  assert.equal(post.sections.objectAt(0).text, 'stray markup tags');

  let markers = post.sections.objectAt(0).markers.toArray();
  assert.equal(markers.length, 2, '2 markers');

  let [m1, m2] = markers;

  assert.equal(m1.value, 'stray');
  assert.equal(m2.value, ' markup tags');

  assert.ok(m1.hasMarkup('b'), 'm1 is b');
  assert.ok(m1.hasMarkup('em'), 'm1 is em');

  assert.ok(m2.hasMarkup('b'), 'm2 is b');
  assert.ok(!m2.hasMarkup('em'), 'm1 is not em');
});

test('link (A tag) is parsed', (assert) => {
  let url = 'http://bustle.com',
      rel = 'nofollow';
  let element = buildDOM(`<a href="${url}" rel="${rel}">link</a>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'link');

  let markers = post.sections.objectAt(0).markers.toArray();
  assert.equal(markers.length, 1, '1 marker');
  let [marker] = markers;
  assert.equal(marker.value, 'link');
  assert.ok(marker.hasMarkup('a'), 'has A markup');

  let markup = marker.markups[0];
  assert.equal(markup.getAttribute('href'), url, 'has href attr');
  assert.equal(markup.getAttribute('rel'), rel, 'has rel attr');
});

test('span with font-style italic maps to em', (assert) => {
  let element = buildDOM(`<p><span style="font-style:ItaLic;">emph</span></p>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');

  let section = post.sections.objectAt(0);
  assert.equal(section.markers.length, 1, '1 marker');
  let marker = section.markers.objectAt(0);

  assert.equal(marker.value, 'emph');
  assert.ok(marker.hasMarkup('em'), 'marker is em');
});

test('span with font-weight 700 maps to strong', (assert) => {
  let element = buildDOM(`<p><span style="font-weight:700;">bold 700</span></p>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');

  let section = post.sections.objectAt(0);
  assert.equal(section.markers.length, 1, '1 marker');
  let marker = section.markers.objectAt(0);

  assert.equal(marker.value, 'bold 700');
  assert.ok(marker.hasMarkup('strong'), 'marker is strong');
});

test('span with font-weight "bold" maps to strong', (assert) => {
  let element = buildDOM(`<p><span style="font-weight:bold;">bold bold</span></p>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');

  let section = post.sections.objectAt(0);
  assert.equal(section.markers.length, 1, '1 marker');
  let marker = section.markers.objectAt(0);

  assert.equal(marker.value, 'bold bold');
  assert.ok(marker.hasMarkup('strong'), 'marker is strong');
});

let recognizedTags = ['aside', 'blockquote', 'h1','h2','h3','h4','h5','h6','p'];
recognizedTags.forEach(tag => {
  test(`recognized markup section tags are parsed (${tag})`, (assert) => {
    let element = buildDOM(`<${tag}>${tag} text</${tag}>`);
    const post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');
    assert.equal(post.sections.objectAt(0).text, `${tag} text`);
    assert.equal(post.sections.objectAt(0).tagName, tag);
  });
});

test('unrecognized attributes are ignored', (assert) => {
  let element = buildDOM(`
    <a href="http://bustle.com"
       style="text-decoration: none">not-underlined link</a>`
  );
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'not-underlined link');
  let marker = post.sections.objectAt(0).markers.objectAt(0);
  assert.equal(marker.value, 'not-underlined link');
  assert.ok(marker.hasMarkup('a'), 'has <a> markup');
  let markup = marker.getMarkup('a');
  assert.equal(markup.getAttribute('href'), 'http://bustle.com');
  assert.ok(!markup.getAttribute('style'), 'style attribute not included');
});

test('singly-nested ol lis are parsed correctly', (assert) => {
  let element= buildDOM(`
    <ol><li>first element</li><li>second element</li></ol>
  `);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  let section = post.sections.objectAt(0);
  assert.equal(section.tagName, 'ol');
  assert.equal(section.items.length, 2, '2 items');
  assert.equal(section.items.objectAt(0).text, 'first element');
  assert.equal(section.items.objectAt(1).text, 'second element');
});

test('nested html doesn\'t create unneccessary whitespace', (assert) => {
  let element = buildDOM(`
    <div>
      <p>
        One
      <p>
      <p>
        Two
      </p>
    </div>
  `);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 2, '2 sections');
  assert.equal(post.sections.objectAt(0).text, 'One');
  assert.equal(post.sections.objectAt(1).text, 'Two');
});

/*
 * FIXME: Google docs nests uls like this
test('lis in nested uls are flattened (when ul is child of ul)', (assert) => {
  let element= buildDOM(`
    <ul>
      <li>outer</li>
      <ul><li>inner</li></ul>
    </ul>
  `);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  let section = post.sections.objectAt(0);
  assert.equal(section.tagName, 'ul');
  assert.equal(section.items.length, 2, '2 items');
  assert.equal(section.items.objectAt(0).text, 'outer');
  assert.equal(section.items.objectAt(1).text, 'inner');
});
 */

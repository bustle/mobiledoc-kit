import DOMParser from 'mobiledoc-kit/parsers/dom';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';
import { Editor } from 'mobiledoc-kit';
import { NO_BREAK_SPACE } from 'mobiledoc-kit/renderers/editor-dom';
import { TAB } from 'mobiledoc-kit/utils/characters';

const {module, test} = Helpers;
const ZWNJ = '\u200c';

let editorElement, builder, parser, editor;
let buildDOM = Helpers.dom.fromHTML;

function renderMobiledoc(builderFn) {
  let mobiledoc = Helpers.mobiledoc.build(builderFn);
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
  editor = new Editor({mobiledoc, atoms: [mentionAtom]});
  editor.render(editorElement);
  return editor;
}

module('Unit: Parser: DOMParser', {
  beforeEach() {
    editorElement = $('#editor')[0];
    builder = new PostNodeBuilder();
    parser = new DOMParser(builder);
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

test('#parse can parse a section element', (assert) => {
  let element = buildDOM("<p>some text</p>");

  const post = parser.parse(element);
  assert.ok(post, 'gets post');
  assert.equal(post.sections.length, 1, 'has 1 section');

  const s1 = post.sections.head;
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers.head.value, 'some text', 'has text');
});

test('#parse can parse multiple elements', (assert) => {
  let element = buildDOM('<p>some text</p><p>some other text</p>');

  const post = parser.parse(element);
  assert.ok(post, 'gets post');
  assert.equal(post.sections.length, 2, 'has 2 sections');

  const [s1, s2] = post.sections.toArray();
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers.head.value, 'some text');

  assert.equal(s2.markers.length, 1, 's2 has 1 marker');
  assert.equal(s2.markers.head.value, 'some other text');
});

test('#parse can parse spaces and breaking spaces', (assert) => {
  let element = buildDOM("<p>some &nbsp;text &nbsp;&nbsp;for &nbsp; &nbsp;you</p>");

  const post = parser.parse(element);
  const s1 = post.sections.head;
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers.head.value, 'some  text   for    you', 'has text');
});

test('#parse can parse tabs', (assert) => {
  let element = buildDOM("<p>a\u2003b</p>");
  let post = parser.parse(element);
  let s1 = post.sections.head;
  assert.equal(s1.markers.length, 1, 's1 has 1 marker');
  assert.equal(s1.markers.head.value, `a${TAB}b`);
});

test('editor#reparse catches changes to section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) =>
    post([
      markupSection('p', [marker('the marker')])
    ])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p:contains(the marker)', 'precond - rendered correctly');

  const p = $('#editor p:eq(0)')[0];
  p.childNodes[0].textContent = 'the NEW marker';

  // In Firefox, changing the text content changes the selection, so re-set it
  Helpers.dom.moveCursorTo(p.childNodes[0]);

  editor.reparse();

  const section = editor.post.sections.head;
  assert.equal(section.text, 'the NEW marker');
});

test('editor#reparse parses spaces and breaking spaces', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, markupSection, marker}) =>
    post([
      markupSection('p', [marker('the marker')])
    ])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor p:contains(the marker)', 'precond - rendered correctly');

  const p = $('#editor p:eq(0)')[0];
  p.childNodes[0].textContent = `some ${NO_BREAK_SPACE}text ${NO_BREAK_SPACE}${NO_BREAK_SPACE}for ${NO_BREAK_SPACE} ${NO_BREAK_SPACE}you`;

  // In Firefox, changing the text content changes the selection, so re-set it
  Helpers.dom.moveCursorTo(p.childNodes[0]);

  editor.reparse();

  const section = editor.post.sections.head;
  assert.equal(section.text, 'some  text   for    you');
});

test('editor#reparse catches changes to list section', (assert) => {
  const mobiledoc = Helpers.mobiledoc.build(({post, listSection, listItem, marker}) =>
    post([
      listSection('ul', [
        listItem([marker('the list item')])
      ])
    ])
  );
  editor = new Editor({mobiledoc});
  editor.render(editorElement);

  assert.hasElement('#editor li:contains(list item)', 'precond - rendered correctly');

  const li = $('#editor li:eq(0)')[0];
  li.childNodes[0].textContent = 'the NEW list item';

  // In Firefox, changing the text content changes the selection, so re-set it
  Helpers.dom.moveCursorTo(li.childNodes[0]);

  editor.reparse();

  const listItem = editor.post.sections.head.items.head;
  assert.equal(listItem.text, 'the NEW list item');
});

test('editor#parse fixes text in atom headTextNode when atom is at start of section', (assert) => {
  let expected = Helpers.postAbstract.build(({post, atom, marker, markupSection}) => {
    return post([markupSection('p', [marker('X'), atom('mention', 'bob')])]);
  });

  editor = renderMobiledoc(({post, atom, markupSection}) => {
    return post([markupSection('p', [atom('mention', 'bob')])]);
  });

  let headTextNode = editor.post.sections.head.markers.head.renderNode.headTextNode;
  assert.ok(!!headTextNode, 'precond - headTextNode');
  headTextNode.textContent = ZWNJ + 'X';

  editor.reparse();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
});

// test('editor#parse fixes text in atom headTextNode when atom has atom before it', (assert) => {

test('editor#parse fixes text in atom headTextNode when atom has marker before it', (assert) => {
  let expected = Helpers.postAbstract.build(({post, atom, marker, markupSection}) => {
    return post([markupSection('p', [marker('textX'), atom('mention', 'bob')])]);
  });

  editor = renderMobiledoc(({post, atom, markupSection, marker}) => {
    return post([markupSection('p', [marker('text'), atom('mention', 'bob')])]);
  });

  let headTextNode = editor.post.sections.head.markers.objectAt(1).renderNode.headTextNode;
  assert.ok(!!headTextNode, 'precond - headTextNode');
  headTextNode.textContent = ZWNJ + 'X';

  editor.reparse();

  assert.postIsSimilar(editor.post, expected);
  assert.renderTreeIsEqual(editor._renderTree, expected);
});

// test('editor#parse fixes text in atom tailTextNode when atom is at end of section', (assert) => {
// test('editor#parse fixes text in atom tailTextNode when atom has atom after it', (assert) => {
// test('editor#parse fixes text in atom tailTextNode when atom has marker after it', (assert) => {

test('parse empty content', (assert) => {
  let element = buildDOM('');
  const post = parser.parse(element);

  assert.ok(post.isBlank, 'post is blank');
});

test('blank textnodes are ignored', (assert) => {
  let post = parser.parse(buildDOM('<p>first line</p>\n<p>second line</p>'));

  assert.equal(post.sections.length, 2, 'parse 2 sections');
  assert.equal(post.sections.objectAt(0).text, 'first line');
  assert.equal(post.sections.objectAt(1).text, 'second line');
});

test('adjacent textnodes are turned into sections', (assert) => {
  let post = parser.parse(buildDOM('<p>first line</p>middle line<p>third line</p>'));

  assert.equal(post.sections.length, 3, 'parse 3 sections');
  assert.equal(post.sections.objectAt(0).text, 'first line');
  assert.equal(post.sections.objectAt(1).text, 'middle line');
  assert.equal(post.sections.objectAt(2).text, 'third line');
});

test('textnode adjacent to p tag becomes section', (assert) => {
  const post = parser.parse(buildDOM('<p>first line</p>second line'));

  assert.equal(post.sections.length, 2, 'parse 2 sections');
  assert.equal(post.sections.objectAt(0).text, 'first line');
  assert.equal(post.sections.objectAt(1).text, 'second line');
});

test('plain text creates a section', (assert) => {
  let container = buildDOM('plain text');
  let element = container.firstChild;
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, 'parse 1 section');
  assert.equal(post.sections.objectAt(0).text, 'plain text');
});

test('strong tag + text node creates section', (assert) => {
  let element = buildDOM('<b>bold text</b>');
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, 'parse 1 section');
  assert.equal(post.sections.objectAt(0).text, 'bold text');
  let marker = post.sections.head.markers.head;
  assert.equal(marker.value, 'bold text');
  assert.ok(marker.hasMarkup('b'), 'marker has b');
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

test('link (A tag) is parsed', (assert) => {
  let url = 'http://bustle.com',
      ref = 'nofollow';
  let element = buildDOM(`<a href="${url}" ref="${ref}">link</a>`);
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
  assert.equal(markup.getAttribute('ref'), ref, 'has ref attr');
});

test('unrecognized tags are ignored', (assert) => {
  let element = buildDOM(`<p>before<span>span</span>after</p>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'beforespanafter');
  assert.equal(post.sections.objectAt(0).markers.length, 1, '1 marker');
});

test('doubly-nested span with text is parsed into a section', (assert) => {
  let element = buildDOM(`<p><span><span>inner</span></span></p>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'inner');
  assert.equal(post.sections.objectAt(0).markers.length, 1, '1 marker');
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

test('unrecognized inline styles are ignored', (assert) => {
  let element = buildDOM(`<p><span style="font-color:red;">was red</span></p>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');

  let section = post.sections.objectAt(0);
  assert.equal(section.markers.length, 1, '1 marker');
  let marker = section.markers.objectAt(0);

  assert.equal(marker.value, 'was red');
  assert.equal(marker.markups.length, 0, 'no markups');
});

test('recognized markup section tags are parsed (H1)', (assert) => {
  let element = buildDOM(`<h1>h1 text</h1>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'h1 text');
  assert.equal(post.sections.objectAt(0).tagName, 'h1');
});

test('recognized markup section tags are parsed (H2)', (assert) => {
  let element = buildDOM(`<h2>h2 text</h2>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'h2 text');
  assert.equal(post.sections.objectAt(0).tagName, 'h2');
});

test('recognized markup section tags are parsed (H3)', (assert) => {
  let element = buildDOM(`<h3>h3 text</h3>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'h3 text');
  assert.equal(post.sections.objectAt(0).tagName, 'h3');
});

test('recognized markup section tags are parsed (blockquote)', (assert) => {
  let element = buildDOM(`<blockquote>blockquote text</blockquote>`);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  assert.equal(post.sections.objectAt(0).text, 'blockquote text');
  assert.equal(post.sections.objectAt(0).tagName, 'blockquote');
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

test('singly-nested ul lis are parsed correctly', (assert) => {
  let element= buildDOM(`
    <ul><li>first element</li><li>second element</li></ul>
  `);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  let section = post.sections.objectAt(0);
  assert.equal(section.tagName, 'ul');
  assert.equal(section.items.length, 2, '2 items');
  assert.equal(section.items.objectAt(0).text, 'first element');
  assert.equal(section.items.objectAt(1).text, 'second element');
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

test('lis in nested uls are flattened (when ul is child of li)', (assert) => {
  let element= buildDOM(`
    <ul>
      <li>first element</li>
      <li><ul><li>nested element</li></ul></li>
    </ul>
  `);
  const post = parser.parse(element);

  assert.equal(post.sections.length, 1, '1 section');
  let section = post.sections.objectAt(0);
  assert.equal(section.tagName, 'ul');
  assert.equal(section.items.length, 2, '2 items');
  assert.equal(section.items.objectAt(0).text, 'first element');
  assert.equal(section.items.objectAt(1).text, 'nested element');
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

import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import Renderer from 'content-kit-editor/renderers/editor-dom';
import RenderTree from 'content-kit-editor/models/render-tree';
import Helpers from '../../test-helpers';
const { module, test } = Helpers;

const DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
let builder;

function render(renderTree, cards=[]) {
  let editor = {};
  let renderer = new Renderer(editor, cards);
  return renderer.render(renderTree);
}

module("Unit: Renderer: Editor-Dom", {
  beforeEach() {
    builder = new PostNodeBuilder();
  }
});

test("renders a dirty post", (assert) => {
  /*
   * renderTree is:
   *
   * renderNode
   *
   */
  const renderTree = new RenderTree(builder.createPost());
  render(renderTree);

  assert.ok(renderTree.rootElement, 'renderTree renders element for post');
  assert.ok(!renderTree.rootNode.isDirty, 'dirty node becomes clean');
  assert.equal(renderTree.rootElement.tagName, 'DIV', 'renderTree renders element for post');
});

test("renders a dirty post with un-rendered sections", (assert) => {
  let post = builder.createPost();
  let sectionA = builder.createMarkupSection('P');
  post.sections.append(sectionA);
  let sectionB = builder.createMarkupSection('P');
  post.sections.append(sectionB);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.outerHTML, '<div><p><br></p><p><br></p></div>',
               'correct HTML is rendered');

  assert.ok(renderTree.rootNode.childNodes.head,
            'sectionA creates a first child');
  assert.equal(renderTree.rootNode.childNodes.head.postNode, sectionA,
               'sectionA is first renderNode child');
  assert.ok(!renderTree.rootNode.childNodes.head.isDirty, 'sectionA node is clean');
  assert.equal(renderTree.rootNode.childNodes.tail.postNode, sectionB,
               'sectionB is second renderNode child');
  assert.ok(!renderTree.rootNode.childNodes.tail.isDirty, 'sectionB node is clean');
});

[
  {
    name: 'markup',
    section: (builder) => builder.createMarkupSection('P')
  },
  {
    name: 'image',
    section: (builder) => builder.createImageSection(DATA_URL)
  },
  {
    name: 'card',
    section: (builder) => builder.createCardSection('new-card')
  },
  {
    name: 'list-section',
    section: (builder) => builder.createListSection('ul', [
      builder.createListItem([builder.createMarker('item')])
    ])
  }
].forEach((testInfo) => {
  test(`removes nodes with ${testInfo.name} section`, (assert) => {
    let post = builder.createPost();
    let section = testInfo.section(builder);
    post.sections.append(section);

    let postElement = document.createElement('div');
    let sectionElement = document.createElement('p');
    postElement.appendChild(sectionElement);

    const renderTree = new RenderTree(post);
    const postRenderNode = renderTree.rootNode;
    postRenderNode.element = postElement;

    let sectionRenderNode = renderTree.buildRenderNode(section);
    sectionRenderNode.element = sectionElement;
    sectionRenderNode.scheduleForRemoval();
    postRenderNode.childNodes.append(sectionRenderNode);

    render(renderTree);

    assert.equal(renderTree.rootElement, postElement,
                 'post element remains');

    assert.equal(renderTree.rootElement.firstChild, null,
                 'section element removed');

    assert.equal(renderTree.rootNode.childNodes.length, 0,
                 'section renderNode is removed');
  });
});

test('renders a post with marker', (assert) => {
  let post = builder.createPost();
  let section = builder.createMarkupSection('P');
  post.sections.append(section);
  section.markers.append(
    builder.createMarker('Hi', [
      builder.createMarkup('STRONG')
    ])
  );

  const renderTree = new RenderTree(post);
  render(renderTree);
  assert.equal(renderTree.rootElement.innerHTML, '<p><strong>Hi</strong></p>');
});

test('renders a post with markup empty section', (assert) => {
  let post = builder.createPost();
  let section = builder.createMarkupSection('P');
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);
  assert.equal(renderTree.rootElement.innerHTML, '<p><br></p>');
});

test('renders a post with multiple markers', (assert) => {
  let post = builder.createPost();
  let section = builder.createMarkupSection('P');
  post.sections.append(section);

  let b = builder.createMarkup('B');
  let i = builder.createMarkup('I');

  section.markers.append(builder.createMarker('hello '));
  section.markers.append(
    builder.createMarker('bold, ', [b])
  );
  section.markers.append(
    builder.createMarker('italic,', [b,i])
  );
  section.markers.append(
    builder.createMarker(' world.')
  );

  const renderTree = new RenderTree(post);
  render(renderTree);
  assert.equal(renderTree.rootElement.innerHTML, '<p>hello <b>bold, <i>italic,</i></b> world.</p>');
});


test('renders a post with image', (assert) => {
  let url = DATA_URL;
  let post = builder.createPost();
  let section = builder.createImageSection(url);
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);
  assert.equal(renderTree.rootElement.innerHTML, `<img src="${url}">`);
});

test('renders a card section', (assert) => {
  let post = builder.createPost();
  let cardSection = builder.createCardSection('my-card');
  let card = {
    name: 'my-card',
    display: {
      setup(element) {
        element.innerHTML = 'I am a card';
      }
    }
  };
  post.sections.append(cardSection);

  const renderTree = new RenderTree(post);
  render(renderTree, [card]);

  assert.equal(renderTree.rootElement.firstChild.innerHTML, 'I am a card',
              'card is rendered');
});

test('renders a card section into a non-contenteditable element', (assert) => {
  assert.expect(2);

  let post = builder.createPost();
  let cardSection = builder.createCardSection('my-card');
  let card = {
    name: 'my-card',
    display: {
      setup(element) {
        element.setAttribute('id', 'my-card-div');
      }
    }
  };
  post.sections.append(cardSection);

  const renderTree = new RenderTree(post);
  render(renderTree, [card]);

  let element = renderTree.rootElement.firstChild;
  assert.equal(element.getAttribute('id'), 'my-card-div',
               'precond - correct element selected');
  assert.equal(element.contentEditable, 'false', 'is not contenteditable');
});

/*
 * renderTree:
 *
 *     post
 *       |
 *    section
 *       |
 *       |----------------|
 *       |                |
 *     marker1 [b]      marker2 []
 *       |                |
 *     <text1>           <text2>
 *
 *  add "b" markup to marker2, new tree should be:
 *
 *     post
 *       |
 *    section
 *       |
 *       |
 *       |      
 *     marker1 [b]
 *       |       
 *     <text1> + <text2>
 */

test('rerender a marker after adding a markup to it', (assert) => {
  const post = builder.createPost();
  const section = builder.createMarkupSection('p');
  const b = builder.createMarkup('B');
  const marker1 = builder.createMarker('text1', [b]);
  const marker2 = builder.createMarker('text2');

  section.markers.append(marker1);
  section.markers.append(marker2);
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><b>text1</b>text2</p>');

  marker2.addMarkup(b);
  marker2.renderNode.markDirty();

  // rerender
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><b>text1text2</b></p>');
});

test('rerender a marker after removing a markup from it', (assert) => {
  const post = builder.createPost();
  const section = builder.createMarkupSection('p');
  const bMarkup = builder.createMarkup('B');
  const marker1 = builder.createMarker('text1');
  const marker2 = builder.createMarker('text2', [bMarkup]);

  section.markers.append(marker1);
  section.markers.append(marker2);
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p>text1<b>text2</b></p>');

  marker2.removeMarkup(bMarkup);
  marker2.renderNode.markDirty();

  // rerender
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p>text1text2</p>');
});

test('rerender a marker after removing a markup from it (when changed marker is first marker)', (assert) => {
  const post = builder.createPost();
  const section = builder.createMarkupSection('p');
  const bMarkup = builder.createMarkup('B');
  const marker1 = builder.createMarker('text1', [bMarkup]);
  const marker2 = builder.createMarker('text2');

  section.markers.append(marker1);
  section.markers.append(marker2);
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><b>text1</b>text2</p>');

  marker1.removeMarkup(bMarkup);
  marker1.renderNode.markDirty();

  // rerender
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p>text1text2</p>');
});

test('rerender a marker after removing a markup from it (when both markers have same markup)', (assert) => {
  const post = builder.createPost();
  const section = builder.createMarkupSection('p');
  const bMarkup = builder.createMarkup('B');
  const marker1 = builder.createMarker('text1', [bMarkup]);
  const marker2 = builder.createMarker('text2', [bMarkup]);

  section.markers.append(marker1);
  section.markers.append(marker2);
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><b>text1text2</b></p>');

  marker1.removeMarkup(bMarkup);
  marker1.renderNode.markDirty();

  // rerender
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p>text1<b>text2</b></p>');
});

test('rerender a marker after removing a markup from it (when both markers have same markup)', (assert) => {
  const post = builder.createPost();
  const section = builder.createMarkupSection('p');
  const bMarkup = builder.createMarkup('B');
  const marker1 = builder.createMarker('text1', [bMarkup]);
  const marker2 = builder.createMarker('text2', [bMarkup]);

  section.markers.append(marker1);
  section.markers.append(marker2);
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><b>text1text2</b></p>');

  marker1.removeMarkup(bMarkup);
  marker1.renderNode.markDirty();

  // rerender
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p>text1<b>text2</b></p>');
});

test('render when contiguous markers have out-of-order markups', (assert) => {
  const post = builder.createPost();
  const section = builder.createMarkupSection('p');

  const b = builder.createMarkup('B'),
        i = builder.createMarkup('I');

  const markers = [
    builder.createMarker('BI', [b,i]),
    builder.createMarker('IB', [i,b]),
    builder.createMarker('plain', [])
  ];
  const m1 = markers[0];

  markers.forEach(m => section.markers.append(m));
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><b><i>BI</i></b><i><b>IB</b></i>plain</p>');

  // remove 'b' from 1st marker, rerender
  m1.removeMarkup(b);
  m1.renderNode.markDirty();
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><i>BI<b>IB</b></i>plain</p>');
});

test('contiguous markers have overlapping markups', (assert) => {
  const b = builder.createMarkup('b'),
        i = builder.createMarkup('i');
  const post = builder.createPost();
  const markers = [
    builder.createMarker('W', [i]),
    builder.createMarker('XY', [i,b]),
    builder.createMarker('Z', [b])
  ];
  const section = builder.createMarkupSection('P', markers);
  post.sections.append(section);

  const renderTree = new RenderTree(post);
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               '<p><i>W<b>XY</b></i><b>Z</b></p>');
});

test('renders and rerenders list items', (assert) => {
  const post = Helpers.postAbstract.build(({post, listSection, listItem, marker}) => 
    post([
      listSection('ul', [
        listItem([marker('first item')]),
        listItem([marker('second item')])
      ])
    ])
  );

  const renderTree = new RenderTree(post);
  render(renderTree);

  const expectedDOM = Helpers.dom.build(t =>
    t('ul', {}, [
      t('li', {}, [t.text('first item')]),
      t('li', {}, [t.text('second item')])
    ])
  );
  const expectedHTML = expectedDOM.outerHTML;

  assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'correct html on initial render');

  // test rerender after dirtying list section
  const listSection = post.sections.head;
  listSection.renderNode.markDirty();
  render(renderTree);
  assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'correct html on rerender after dirtying list-section');

  // test rerender after dirtying list item
  const listItem = post.sections.head.items.head;
  listItem.renderNode.markDirty();
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'correct html on rerender after diryting list-item');
});

test('removes list items', (assert) => {
  const post = Helpers.postAbstract.build(({post, listSection, listItem, marker}) =>
    post([
      listSection('ul', [
        listItem([marker('first item')]),
        listItem([marker('second item')]),
        listItem([marker('third item')])
      ])
    ])
  );

  const renderTree = new RenderTree(post);
  render(renderTree);

  // return HTML for a list with the given items
  const htmlWithItems = (itemTexts) => {
    const expectedDOM = Helpers.dom.build(t =>
      t('ul', {}, itemTexts.map(text => t('li', {}, [t.text(text)])))
    );
    return expectedDOM.outerHTML;
  };

  const listItem2 = post.sections.head. // listSection
                         items.objectAt(1); // li
  listItem2.renderNode.scheduleForRemoval();
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               htmlWithItems(['first item', 'third item']),
               'removes middle list item');

  const listItemLast = post.sections.head. // listSection
                            items.tail;
  listItemLast.renderNode.scheduleForRemoval();
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML,
               htmlWithItems(['first item']),
               'removes last list item');
});

test('removes list sections', (assert) => {
  const post = Helpers.postAbstract.build(({post, listSection, markupSection, listItem, marker}) =>
    post([
      markupSection('p', [marker('something')]),
      listSection('ul', [
        listItem([marker('first item')])
      ])
    ])
  );

  const renderTree = new RenderTree(post);
  render(renderTree);

  const expectedDOM = Helpers.dom.build(t =>
    t('p', {}, [t.text('something')])
  );
  const expectedHTML = expectedDOM.outerHTML;

  const listSection = post.sections.objectAt(1);
  listSection.renderNode.scheduleForRemoval();
  render(renderTree);

  assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'removes list section');
});

test('includes card sections in renderTree element map', (assert) => {
  const post = Helpers.postAbstract.build(({post, cardSection}) =>
    post([cardSection('simple-card')])
  );
  const cards = [{
    name: 'simple-card',
    display: {
      setup(element) {
        element.setAttribute('id', 'simple-card');
      }
    }
  }];

  const renderTree = new RenderTree(post);
  render(renderTree, cards);

  $('#qunit-fixture')[0].appendChild(renderTree.rootElement);

  const element = $('#simple-card')[0];
  assert.ok(!!element, 'precond - simple card is rendered');
  assert.ok(!!renderTree.getElementRenderNode(element),
            'has render node for card element');
});

test('removes nested children of removed render nodes', (assert) => {
  let section;
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    section = markupSection('p', [marker('abc')]);
    return post([section]);
  });

  const renderTree = new RenderTree(post);
  render(renderTree);

  const marker = section.markers.head;
  assert.ok(!!section.renderNode, 'precond - section has render node');
  assert.ok(!!marker.renderNode, 'precond - marker has render node');

  section.renderNode.scheduleForRemoval();
  render(renderTree);

  assert.ok(!marker.renderNode.parent, 'marker render node is orphaned');
  assert.ok(!marker.renderNode.element, 'marker render node has no element');
  assert.equal(section.renderNode.childNodes.length, 0,
               'section render node has all children removed');
});

/*
test("It renders a renderTree with rendered dirty section", (assert) => {
  /*
   * renderTree is:
   *
   *      post<dirty>
   *       /        \
   *      /          \
   * section      section<dirty>
   *
  let post = builder.createPost
  let postRenderNode = {
    element: null,
    parent: null,
    isDirty: true,
    postNode: builder.createPost()
  }
  let renderTree = {
    node: renderNode
  }

  render(renderTree);

  assert.ok(renderTree.rootElement, 'renderTree renders element for post');
  assert.ok(!renderTree.rootNode.isDirty, 'dirty node becomes clean');
  assert.equal(renderTree.rootElement.tagName, 'DIV', 'renderTree renders element for post');
});
*/

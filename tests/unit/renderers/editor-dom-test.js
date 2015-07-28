import { generateBuilder } from 'content-kit-editor/utils/post-builder';
const { module, test } = window.QUnit;
import Renderer from 'content-kit-editor/renderers/editor-dom';
import RenderNode from 'content-kit-editor/models/render-node';
import RenderTree from 'content-kit-editor/models/render-tree';

const DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
let builder;

function render(renderTree, cards=[]) {
  let renderer = new Renderer(cards);
  return renderer.render(renderTree);
}

module("Unit: Renderer", {
  beforeEach() {
    builder = generateBuilder();
  }
});

test("It renders a dirty post", (assert) => {
  /*
   * renderTree is:
   *
   * renderNode
   *
   */
  let renderNode = new RenderNode(builder.generatePost());
  let renderTree = new RenderTree(renderNode);
  renderNode.renderTree = renderTree;

  render(renderTree);

  assert.ok(renderTree.node.element, 'renderTree renders element for post');
  assert.ok(!renderTree.node.isDirty, 'dirty node becomes clean');
  assert.equal(renderTree.node.element.tagName, 'DIV', 'renderTree renders element for post');
});

test("It renders a dirty post with un-rendered sections", (assert) => {
  let post = builder.generatePost();
  let sectionA = builder.generateMarkupSection('P');
  post.appendSection(sectionA);
  let sectionB = builder.generateMarkupSection('P');
  post.appendSection(sectionB);

  let renderNode = new RenderNode(post);
  let renderTree = new RenderTree(renderNode);
  renderNode.renderTree = renderTree;

  render(renderTree);

  assert.equal(renderTree.node.element.outerHTML, '<div><p></p><p></p></div>',
               'correct HTML is rendered');

  assert.ok(renderTree.node.firstChild,
            'sectionA creates a first child');
  assert.equal(renderTree.node.firstChild.postNode, sectionA,
               'sectionA is first renderNode child');
  assert.ok(!renderTree.node.firstChild.isDirty, 'sectionA node is clean');
  assert.equal(renderTree.node.lastChild.postNode, sectionB,
               'sectionB is second renderNode child');
  assert.ok(!renderTree.node.lastChild.isDirty, 'sectionB node is clean');
});

[
  {
    name: 'markup',
    section: (builder) => builder.generateMarkupSection('P')
  },
  {
    name: 'image',
    section: (builder) => builder.generateImageSection(DATA_URL)
  },
  {
    name: 'card',
    section: (builder) => builder.generateCardSection('new-card')
  }
].forEach((testInfo) => {
  test(`Remove nodes with ${testInfo.name} section`, (assert) => {
    let post = builder.generatePost();
    let section = testInfo.section(builder);
    post.appendSection(section);

    let postElement = document.createElement('div');
    let sectionElement = document.createElement('p');
    postElement.appendChild(sectionElement);

    let postRenderNode = new RenderNode(post);

    let renderTree = new RenderTree(postRenderNode);
    postRenderNode.renderTree = renderTree;
    postRenderNode.element = postElement;

    let sectionRenderNode = renderTree.buildRenderNode(section);
    sectionRenderNode.element = sectionElement;
    sectionRenderNode.scheduleForRemoval();
    postRenderNode.appendChild(sectionRenderNode);

    render(renderTree);

    assert.equal(renderTree.node.element, postElement,
                 'post element remains');

    assert.equal(renderTree.node.element.firstChild, null,
                 'section element removed');

    assert.equal(renderTree.node.firstChild, null,
                 'section renderNode is removed');
  });
});

test('renders a post with marker', (assert) => {
  let post = builder.generatePost();
  let section = builder.generateMarkupSection('P');
  post.appendSection(section);
  section.appendMarker(
    builder.generateMarker([
      builder.generateMarkup('STRONG')
    ], 'Hi')
  );

  let node = new RenderNode(post);
  let renderTree = new RenderTree(node);
  node.renderTree = renderTree;
  render(renderTree);
  assert.equal(node.element.innerHTML, '<p><strong>Hi</strong></p>');
});

test('renders a post with multiple markers', (assert) => {
  let post = builder.generatePost();
  let section = builder.generateMarkupSection('P');
  post.appendSection(section);

  let bMarkup = builder.generateMarkup('B');
  let iMarkup = builder.generateMarkup('I');

  section.appendMarker(builder.generateMarker([], 'hello '));
  section.appendMarker(
    builder.generateMarker([
      bMarkup
    ], 'bold, ')
  );
  section.appendMarker(
    builder.generateMarker([
      bMarkup,
      iMarkup
    ], 'italic,')
  );
  section.appendMarker(
    builder.generateMarker([], ' world.')
  );

  let node = new RenderNode(post);
  let renderTree = new RenderTree(node);
  node.renderTree = renderTree;
  render(renderTree);
  assert.equal(node.element.innerHTML, '<p>hello <b>bold, <i>italic,</i></b> world.</p>');
});


test('renders a post with image', (assert) => {
  let url = DATA_URL;
  let post = builder.generatePost();
  let section = builder.generateImageSection(url);
  post.appendSection(section);

  let node = new RenderNode(post);
  let renderTree = new RenderTree(node);
  node.renderTree = renderTree;
  render(renderTree);
  assert.equal(node.element.innerHTML, `<img src="${url}">`);
});

test('renders a card section', (assert) => {
  let post = builder.generatePost();
  let cardSection = builder.generateCardSection('my-card');
  let card = {
    name: 'my-card',
    display: {
      setup(element) {
        element.innerHTML = 'I am a card';
      }
    }
  };
  post.appendSection(cardSection);

  let node = new RenderNode(post);
  let renderTree = new RenderTree(node);
  node.renderTree = renderTree;
  render(renderTree, [card]);

  assert.equal(node.element.firstChild.innerHTML, 'I am a card',
              'card is rendered');
});

test('renders a card section into a non-contenteditable element', (assert) => {
  assert.expect(2);

  let post = builder.generatePost();
  let cardSection = builder.generateCardSection('my-card');
  let card = {
    name: 'my-card',
    display: {
      setup(element) {
        element.setAttribute('id', 'my-card-div');
      }
    }
  };
  post.appendSection(cardSection);

  let node = new RenderNode(post);
  let renderTree = new RenderTree(node);
  node.renderTree = renderTree;
  render(renderTree, [card]);

  let element = node.element.firstChild;
  assert.equal(element.getAttribute('id'), 'my-card-div',
               'precond - correct element selected');
  assert.equal(element.contentEditable, 'false', 'is not contenteditable');
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
  let post = builder.generatePost
  let postRenderNode = {
    element: null,
    parent: null,
    isDirty: true,
    postNode: builder.generatePost()
  }
  let renderTree = {
    node: renderNode
  }

  render(renderTree);

  assert.ok(renderTree.node.element, 'renderTree renders element for post');
  assert.ok(!renderTree.node.isDirty, 'dirty node becomes clean');
  assert.equal(renderTree.node.element.tagName, 'DIV', 'renderTree renders element for post');
});
*/

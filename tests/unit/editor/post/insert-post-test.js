import Helpers from '../../../test-helpers';

const { module, test } = Helpers;
const { editor: { retargetRange } } = Helpers;

let editor, editorElement;
// see https://github.com/bustle/mobiledoc-kit/issues/259
module('Unit: PostEditor: #insertPost', {
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

let blankSectionExpecations = [
  ['* abc'], // single list item
  ['* abc','* def'], // multiple list items
  ['abc'], // single section
  ['abc','def'], // multiple sections, see https://github.com/bustle/mobiledoc-kit/issues/462
  ['*abc*'], // section with markup
  ['[my-card]'], // single card
  ['[my-card]', '[my-other-card]'], // multiple cards
  ['abc','* 123','* 456','[my-card]'], // mixed
];
blankSectionExpecations.forEach(dsl => {
  test(`inserting "${dsl}" in blank section replaces it`, (assert) => {
    let {post: toInsert} = Helpers.postAbstract.buildFromText(dsl);
    let expected = toInsert;
    editor = Helpers.editor.buildFromText(['|'], {unknownCardHandler: () => {}, element: editorElement});

    editor.run(postEditor => postEditor.insertPost(editor.range.head, toInsert));

    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.postIsSimilar(editor.post, expected);

    let expectedRange = editor.post.tailPosition().toRange();
    assert.rangeIsEqual(editor.range, expectedRange);
  });
});

let expectationGroups = [{
  groupName: 'insert around card',
  expectations: [
    // insert 1 section
    [['|[my-card]'], ['abc'], ['abc|','[my-card]']],
    [['[my-card]|'], ['abc'], ['[my-card]','abc|']],

    // insert multiple sections
    [['|[my-card]'], ['abc','def'], ['abc','def|','[my-card]']],
    [['[my-card]|'], ['abc','def'], ['[my-card]','abc','def|']],

    // insert list with 1 item
    [['|[my-card]'], ['* abc'], ['* abc|','[my-card]']],
    [['[my-card]|'], ['* abc'], ['[my-card]','* abc|']],

    // insert list with multiple items
    [['|[my-card]'], ['* abc','* def'], ['* abc','* def|', '[my-card]']],
    [['[my-card]|'], ['* abc','* def'], ['[my-card]','* abc','* def|']]
  ],
}, {
  groupName: 'insert card around markerable',
  expectations: [
    // insert card only
    [['|abc'], ['[my-card]'], ['[my-card]|','abc']],
    [['ab|c'], ['[my-card]'], ['ab','[my-card]|','c']],
    [['abc|'], ['[my-card]'], ['abc', '[my-card]|']],

    // insert card+section
    [['|abc'], ['[my-card]','def'], ['[my-card]','def|','abc']],
    [['ab|c'], ['[my-card]','def'], ['ab','[my-card]','def|','c']],
    [['abc|'], ['[my-card]','def'], ['abc','[my-card]','def|']],

    // insert section+card
    [['|abc'], ['def','[my-card]'], ['def', '[my-card]|','abc']],
    [['ab|c'], ['def','[my-card]'], ['abdef','[my-card]|','c']],
    [['abc|'], ['def','[my-card]'], ['abcdef','[my-card]|']]
  ]
}, {
  groupName: 'insert (non-list-item) markerable(s) around markerable',
  expectations: [
    // insert 1 section
    [['|abc'], ['123'], ['123|abc']],
    [['ab|c'], ['123'], ['ab123|c']],
    [['abc|'], ['123'], ['abc123|']],

    // insert multiple sections
    [['|abc'], ['123','456'], ['123','456|', 'abc']],
    [['ab|c'], ['123','456'], ['ab123','456|','c']],
    [['abc|'], ['123','456'], ['abc123','456|']]
  ]
}, {
  groupName: 'insert list item(s) around markerable',
  expectations: [
    // insert 1 item
    [['|abc'], ['* 123'], ['123|abc']],
    [['ab|c'], ['* 123'], ['ab123|c']],
    [['abc|'], ['* 123'], ['abc123|']],

    // insert multiple items
    [['|abc'], ['* 123','* 456'], ['123','* 456|', 'abc']],
    [['ab|c'], ['* 123','* 456'], ['ab123','* 456|', 'c']],
    [['abc|'], ['* 123','* 456'], ['abc123','* 456|']]
  ]
}, {
  groupName: 'insert list+markup-section around markerable',
  expectations: [
    // list + markup section
    [['|abc'], ['* 123','def'], ['123','def|','abc']],
    [['ab|c'], ['* 123','def'], ['ab123','def|','c']],
    [['abc|'], ['* 123','def'], ['abc123','def|']],

    // markup section + 1-item list
    [['|abc'], ['def', '* 123'], ['def', '* 123|','abc']],
    [['ab|c'], ['def', '* 123'], ['abdef','* 123|','c']],
    [['abc|'], ['def', '* 123'], ['abcdef','* 123|']],

    // markup section + multi-item list
    [['|abc'], ['def', '* 123','* 456'], ['def', '* 123','* 456|', 'abc']],
    [['ab|c'], ['def', '* 123','* 456'], ['abdef', '* 123','* 456|', 'c']],
    [['abc|'], ['def', '* 123','* 456'], ['abcdef', '* 123','* 456|']],
  ]
}, {
  groupName: 'insert into list',
  expectations: [
    // insert 1 markup section
    [['* |abc'], ['def'], ['* def|abc']],
    [['* ab|c'], ['def'], ['* abdef|c']],
    [['* abc|'], ['def'], ['* abcdef|']],

    // insert multiple markup sections
    [['* abc|'], ['def', 'ghi'], ['* abcdef', '* ghi|']],
    // See https://github.com/bustle/mobiledoc-kit/issues/456
    [['* abc','* def|'], ['ghi', 'jkl'], ['* abc', '* defghi', '* jkl|']],

    // insert markup sections + card
    [['* abc','* def|'], ['ghi', 'jkl', '[my-card]'], ['* abc', '* defghi', '* jkl', '[my-card]|']],

    // insert list item
    [['* |abc'], ['* def'], ['* def|abc']],
    [['* ab|c'], ['* def'], ['* abdef|c']],
    [['* abc|'], ['* def'], ['* abcdef|']],

    // insert multiple list items
    [['* |abc'], ['* def', '* ghi'], ['* def','* ghi|', '* abc']],
    [['* ab|c'], ['* def', '* ghi'], ['* abdef','* ghi|', '* c']],
    [['* abc|'], ['* def', '* ghi'], ['* abcdef','* ghi|']],

    // insert list + markup
    [['* |abc'], ['* def', '123'], ['* def','123|', '* abc']],
    [['* ab|c'], ['* def', '123'], ['* abdef','123|', '* c']],
    [['* abc|'], ['* def', '123'], ['* abcdef','123|']],

    // insert into empty list
    [['* |'], ['[my-card]'], ['* ', '[my-card]|']],
    [['* |'], ['abc'], ['* abc|']],
    [['* |'], ['abc', 'def'], ['* abc', '* def|']],
    [['* |'], ['* abc'], ['* abc|']],
    [['* |'], ['* abc', '* def'], ['* abc', '* def|']],


    /// insert between list items ///

    // insert card between list items
    [['* abc|','* def'], ['[my-card]'], ['* abc','[my-card]|','* def']],
    [['* ab|c','* def'], ['[my-card]'], ['* ab','[my-card]|','* c','* def']],
    [['* abc|','* def'], ['[my-card]'], ['* abc','[my-card]|','* def']],
    // See https://github.com/bustle/mobiledoc-kit/issues/467
    [['* abc','* |def'], ['[my-card]'], ['* abc','[my-card]|','* def']],

    // insert markup section between list items
    [['* abc|','* def'], ['123'], ['* abc123|','* def']],
    [['* abc','* |def'], ['123'], ['* abc','* 123|def']],

    // insert 1 list item between list items
    [['* abc|','* def'], ['* 123'], ['* abc123|','* def']],
    [['* abc','* |def'], ['* 123'], ['* abc','* 123|def']],

    // insert multiple list items between list items
    [['* abc|','* def'], ['* 123', '* 456'], ['* abc123','* 456|','* def']],
    [['* abc','* |def'], ['* 123', '* 456'], ['* abc','* 123', '* 456|','* def']]
  ]
}];

expectationGroups.forEach(({groupName, expectations}) => {
  expectations.forEach(([editorDSL, toInsertDSL, expectedDSL]) => {
    test(`${groupName}: inserting "${toInsertDSL}" in "${editorDSL}" -> "${expectedDSL}"`, (assert) => {
      editor = Helpers.editor.buildFromText(editorDSL, {unknownCardHandler: () => {}, element: editorElement});
      let {post: toInsert} = Helpers.postAbstract.buildFromText(toInsertDSL);
      let {post: expectedPost, range: expectedRange} = Helpers.postAbstract.buildFromText(expectedDSL);

      editor.run(postEditor => postEditor.insertPost(editor.range.head, toInsert));

      assert.renderTreeIsEqual(editor._renderTree, expectedPost);
      assert.postIsSimilar(editor.post, expectedPost);
      assert.rangeIsEqual(editor.range, retargetRange(expectedRange, editor.post));
    });
  });
});

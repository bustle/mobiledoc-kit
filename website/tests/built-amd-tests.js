define('tests/acceptance/basic-editor-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/utils/characters'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitUtilsCharacters) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var cards = [{
    name: 'my-card',
    type: 'dom',
    render: function render() {},
    edit: function edit() {}
  }];

  var editor = undefined,
      editorElement = undefined;

  _module('Acceptance: editor: basic', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('sets element as contenteditable', function (assert) {
    editor = new _mobiledocKit.Editor();
    editor.render(editorElement);

    assert.equal(editorElement.getAttribute('contenteditable'), 'true', 'element is contenteditable');
  });

  test('clicking outside the editor does not raise an error', function (assert) {
    var done = assert.async();
    editor = new _mobiledocKit.Editor({ autofocus: false });
    editor.render(editorElement);

    var secondEditorElement = document.createElement('div');
    document.body.appendChild(secondEditorElement);

    var secondEditor = new _mobiledocKit.Editor(); // This editor will be focused
    secondEditor.render(secondEditorElement);

    _testHelpers['default'].dom.triggerEvent(editorElement, 'click');

    _testHelpers['default'].wait(function () {
      assert.ok(true, 'can click external item without error');
      secondEditor.destroy();
      document.body.removeChild(secondEditorElement);

      done();
    });
  });

  test('typing in empty post correctly adds a section to it', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      return post();
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    assert.hasElement('#editor');
    assert.hasNoElement('#editor p');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement);
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor p:contains(X)');
    _testHelpers['default'].dom.insertText(editor, 'Y');
    assert.hasElement('#editor p:contains(XY)', 'inserts text at correct spot');
  });

  test('typing when on the end of a card is blocked', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('[my-card]', { element: editorElement, cards: cards });

    var endingZWNJ = $('#editor')[0].firstChild.lastChild;
    _testHelpers['default'].dom.moveCursorTo(editor, endingZWNJ, 0);
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasNoElement('#editor div:contains(X)');
    _testHelpers['default'].dom.moveCursorTo(editor, endingZWNJ, 1);
    _testHelpers['default'].dom.insertText(editor, 'Y');
    assert.hasNoElement('#editor div:contains(Y)');
  });

  test('typing when on the start of a card is blocked', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('[my-card]', { element: editorElement, cards: cards });

    var startingZWNJ = $('#editor')[0].firstChild.firstChild;
    _testHelpers['default'].dom.moveCursorTo(editor, startingZWNJ, 0);
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasNoElement('#editor div:contains(X)');
    _testHelpers['default'].dom.moveCursorTo(editor, startingZWNJ, 1);
    _testHelpers['default'].dom.insertText(editor, 'Y');
    assert.hasNoElement('#editor div:contains(Y)');
  });

  test('typing tab enters a tab character', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('|', { element: editorElement });

    _testHelpers['default'].dom.insertText(editor, _mobiledocKitUtilsCharacters.TAB);
    _testHelpers['default'].dom.insertText(editor, 'Y');

    var _Helpers$postAbstract$buildFromText = _testHelpers['default'].postAbstract.buildFromText(_mobiledocKitUtilsCharacters.TAB + 'Y');

    var expected = _Helpers$postAbstract$buildFromText.post;

    assert.postIsSimilar(editor.post, expected);
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/215
  test('select-all and type text works ok', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('<abc>', { element: editorElement });

    assert.selectedText('abc', 'precond - abc is selected');
    assert.hasElement('#editor p:contains(abc)', 'precond - renders p');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasNoElement('#editor p:contains(abc)', 'replaces existing text');
    assert.hasElement('#editor p:contains(X)', 'inserts text');
  });

  test('typing enter splits lines, sets cursor', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('hi|hey', { element: editorElement });

    assert.hasElement('#editor p:contains(hihey)');

    _testHelpers['default'].dom.insertText(editor, _mobiledocKitUtilsCharacters.ENTER);

    var _Helpers$postAbstract$buildFromText2 = _testHelpers['default'].postAbstract.buildFromText(['hi', '|hey']);

    var expected = _Helpers$postAbstract$buildFromText2.post;
    var expectedRange = _Helpers$postAbstract$buildFromText2.range;

    assert.postIsSimilar(editor.post, expected, 'correctly encoded');
    assert.rangeIsEqual(editor.range, _testHelpers['default'].editor.retargetRange(expectedRange, editor.post));
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/306
  test('adding/removing bold text between two bold markers works', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('*abc*123*def*', { element: editorElement });

    // preconditions
    assert.hasElement('#editor b:contains(abc)');
    assert.hasElement('#editor b:contains(def)');
    assert.hasNoElement('#editor b:contains(123)');

    _testHelpers['default'].dom.selectText(editor, '123', editorElement);
    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('b');
    });

    assert.hasElement('#editor b:contains(abc123def)', 'adds B to selection');

    assert.equal(_testHelpers['default'].dom.getSelectedText(), '123', '123 still selected');

    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('b');
    });

    assert.hasElement('#editor b:contains(abc)', 'removes B from middle, leaves abc');
    assert.hasElement('#editor b:contains(def)', 'removes B from middle, leaves def');
    assert.hasNoElement('#editor b:contains(123)', 'removes B from middle');
  });

  test('keypress events when the editor does not have selection are ignored', function (assert) {
    var done = assert.async();
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      expected = post([markupSection('p', [marker('abc')])]);
      return post([markupSection('p', [marker('abc')])]);
    });

    _testHelpers['default'].dom.clearSelection();

    _testHelpers['default'].wait(function () {
      assert.ok(!editor.hasCursor(), 'precond - editor does not have cursor');
      _testHelpers['default'].dom.insertText(editor, 'v');

      assert.postIsSimilar(editor.post, expected, 'post is not changed');
      done();
    });
  });

  test('prevent handling newline', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('', { element: editorElement });

    editor.willHandleNewline(function (event) {
      assert.ok(true, 'willHandleNewline should be triggered');
      event.preventDefault();
    });

    var _Helpers$postAbstract$buildFromText3 = _testHelpers['default'].postAbstract.buildFromText(['Line1']);

    var expected = _Helpers$postAbstract$buildFromText3.post;

    _testHelpers['default'].dom.insertText(editor, 'Line1');
    _testHelpers['default'].dom.insertText(editor, _mobiledocKitUtilsCharacters.ENTER);
    assert.postIsSimilar(editor.post, expected);
  });
});
define('tests/acceptance/cursor-movement-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/utils/key', '../helpers/browsers'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitUtilsKey, _helpersBrowsers) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var cards = [{
    name: 'my-card',
    type: 'dom',
    render: function render() {},
    edit: function edit() {}
  }];

  var atoms = [{
    name: 'my-atom',
    type: 'dom',
    render: function render() {
      return document.createTextNode('my-atom');
    }
  }];

  var editor = undefined,
      editorElement = undefined;
  var editorOptions = { cards: cards, atoms: atoms };

  _module('Acceptance: Cursor Movement', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('left arrow when at the end of a card moves the cursor across the card', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var cardSection = _ref.cardSection;

      return post([cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);
    var cardHead = editor.post.sections.head.headPosition();

    // Before zwnj
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    var _editor = editor;
    var range = _editor.range;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardHead);

    // After zwnj
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    range = editor.range;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardHead);

    // On wrapper
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild, 2);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    range = editor.range;

    assert.positionIsEqual(range.head, cardHead);
    assert.positionIsEqual(range.tail, cardHead);
  });

  test('left arrow when at the start of a card moves the cursor to the previous section', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var cardSection = _ref2.cardSection;

      return post([markupSection('p'), cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);
    var sectionTail = editor.post.sections.head.tailPosition();

    // Before zwnj
    var sectionElement = editor.post.sections.tail.renderNode.element;
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.firstChild, 0);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    var _editor2 = editor;
    var range = _editor2.range;

    assert.positionIsEqual(range.head, sectionTail);
    assert.positionIsEqual(range.tail, sectionTail);

    // After zwnj
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.firstChild, 1);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    range = editor.range;

    assert.positionIsEqual(range.head, sectionTail);
    assert.positionIsEqual(range.tail, sectionTail);
  });

  test('left arrow when at the start of a card moves to previous list item', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref3) {
      var post = _ref3.post;
      var listSection = _ref3.listSection;
      var listItem = _ref3.listItem;
      var marker = _ref3.marker;
      var cardSection = _ref3.cardSection;

      return post([listSection('ul', [listItem([marker('abc')])]), cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);
    var itemTail = editor.post.sections.head.items.head.tailPosition();

    // Before zwnj
    var sectionElement = editor.post.sections.tail.renderNode.element;
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.firstChild, 0);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    var _editor3 = editor;
    var range = _editor3.range;

    assert.positionIsEqual(range.head, itemTail);
    assert.positionIsEqual(range.tail, itemTail);

    // After zwnj
    sectionElement = editor.post.sections.tail.renderNode.element;
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.firstChild, 1);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    range = editor.range;

    assert.positionIsEqual(range.head, itemTail);
    assert.positionIsEqual(range.tail, itemTail);
  });

  test('right arrow at start of card moves the cursor across the card', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref4) {
      var post = _ref4.post;
      var cardSection = _ref4.cardSection;

      return post([cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);
    var cardTail = editor.post.sections.head.tailPosition();

    // Before zwnj
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 0);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    var _editor4 = editor;
    var range = _editor4.range;

    assert.positionIsEqual(range.head, cardTail);
    assert.positionIsEqual(range.tail, cardTail);

    // After zwnj
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 1);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    range = editor.range;

    assert.positionIsEqual(range.head, cardTail);
    assert.positionIsEqual(range.tail, cardTail);
  });

  test('right arrow at end of card moves cursor to next section', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var cardSection = _ref5.cardSection;

      return post([cardSection('my-card'), markupSection('p')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);
    var sectionHead = editor.post.sections.tail.headPosition();

    // Before zwnj
    var sectionElement = editor.post.sections.head.renderNode.element;
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.lastChild, 0);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    var _editor5 = editor;
    var range = _editor5.range;

    assert.positionIsEqual(range.head, sectionHead);
    assert.positionIsEqual(range.tail, sectionHead);

    // After zwnj
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.lastChild, 1);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    range = editor.range;

    // On wrapper
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild, 2);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    range = editor.range;

    assert.positionIsEqual(range.head, sectionHead);
    assert.positionIsEqual(range.tail, sectionHead);
  });

  test('right arrow at end of card moves cursor to next list item', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref6) {
      var post = _ref6.post;
      var listSection = _ref6.listSection;
      var listItem = _ref6.listItem;
      var marker = _ref6.marker;
      var cardSection = _ref6.cardSection;

      return post([cardSection('my-card'), listSection('ul', [listItem([marker('abc')])])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);
    var itemHead = editor.post.sections.tail.items.head.headPosition();

    // Before zwnj
    var sectionElement = editor.post.sections.head.renderNode.element;
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.lastChild, 0);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    var _editor6 = editor;
    var range = _editor6.range;

    assert.positionIsEqual(range.head, itemHead);
    assert.positionIsEqual(range.tail, itemHead);

    // After zwnj
    _testHelpers['default'].dom.moveCursorTo(editor, sectionElement.lastChild, 1);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    range = editor.range;

    assert.positionIsEqual(range.head, itemHead);
    assert.positionIsEqual(range.tail, itemHead);
  });

  test('left arrow when at the head of an atom moves the cursor left off the atom', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;
      var atom = _ref7.atom;

      return post([markupSection('p', [marker('aa'), atom('my-atom'), marker('cc')])]);
      // TODO just make 0.3.1 default
    }, '0.3.1');
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: atoms });
    editor.render(editorElement);

    var atomWrapper = editor.post.sections.head.markers.objectAt(1).renderNode.element;

    // Before zwnj, assert moving left
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.lastChild, 0);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    var range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 2, 'Cursor is positioned at offset 2');

    // After zwnj, assert moving left
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.lastChild, 1);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 2, 'Cursor is positioned at offset 2');

    // On wrapper, assert moving left
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper, 3);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 2, 'Cursor is positioned at offset 2');

    // After wrapper, asseat moving left
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.nextSibling, 0);
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 2, 'Cursor is positioned at offset 2');
  });

  test('right arrow when at the head of an atom moves the cursor across the atom', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;
      var atom = _ref8.atom;

      return post([markupSection('p', [marker('aa'), atom('my-atom'), marker('cc')])]);
      // TODO just make 0.3.1 default
    }, '0.3.1');
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: atoms });
    editor.render(editorElement);

    var atomWrapper = editor.post.sections.head.markers.objectAt(1).renderNode.element;

    // Before zwnj, assert moving right
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.firstChild, 0);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    var range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 3, 'Cursor is positioned at offset 3');

    // After zwnj, assert moving right
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.firstChild, 1);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 3, 'Cursor is positioned at offset 3');

    // On wrapper, assert moving right
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper, 1);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 3, 'Cursor is positioned at offset 3');

    // After wrapper, assert moving right
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.previousSibling, 2);
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    range = editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 3, 'Cursor is positioned at offset 3');
  });

  test('left/right arrows moves cursor l-to-r and r-to-l across atom', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;
      var atom = _ref9.atom;

      return post([markupSection('p', [atom('my-atom', 'first')])]);
    }, editorOptions);

    editor.selectRange(editor.post.tailPosition());
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    assert.positionIsEqual(editor.range.head, editor.post.headPosition());
    assert.positionIsEqual(editor.range.tail, editor.post.headPosition());

    editor.selectRange(editor.post.headPosition());
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    assert.positionIsEqual(editor.range.head, editor.post.tailPosition());
    assert.positionIsEqual(editor.range.tail, editor.post.tailPosition());
  });

  test('left arrow at start atom moves to end of prev section', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;
      var atom = _ref10.atom;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [atom('my-atom', 'first')])]);
    }, editorOptions);

    editor.selectRange(editor.post.sections.tail.headPosition());
    _testHelpers['default'].dom.triggerLeftArrowKey(editor);
    assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());
  });

  test('right arrow at end of end atom moves to start of next section', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;
      var atom = _ref11.atom;

      return post([markupSection('p', [atom('my-atom', 'first')]), markupSection('p', [marker('abc')])]);
    }, editorOptions);

    editor.selectRange(editor.post.sections.head.tailPosition());
    _testHelpers['default'].dom.triggerRightArrowKey(editor);
    assert.positionIsEqual(editor.range.head, editor.post.sections.tail.headPosition());
  });

  _module('Acceptance: Cursor Movement w/ shift', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  if ((0, _helpersBrowsers.supportsSelectionExtend)()) {
    // FIXME: Older versions of IE do not support `extends` on selection
    // objects, and thus cannot support highlighting left until we implement
    // selections without native APIs.
    test('left arrow when at the end of a card moves the selection across the card', function (assert) {
      var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref12) {
        var post = _ref12.post;
        var cardSection = _ref12.cardSection;

        return post([cardSection('my-card')]);
      });
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
      editor.render(editorElement);

      var cardHead = editor.post.sections.head.headPosition();
      var cardTail = editor.post.sections.head.tailPosition();

      // Before zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      var _editor7 = editor;
      var range = _editor7.range;

      assert.positionIsEqual(range.head, cardHead);
      assert.positionIsEqual(range.tail, cardTail);

      // After zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      range = editor.range;

      assert.positionIsEqual(range.head, cardHead);
      assert.positionIsEqual(range.tail, cardTail);

      // On wrapper
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild, 2);
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      range = editor.range;

      assert.positionIsEqual(range.head, cardHead);
      assert.positionIsEqual(range.tail, cardTail);
    });

    test('left arrow at start of card moves selection to prev section', function (assert) {
      var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref13) {
        var post = _ref13.post;
        var markupSection = _ref13.markupSection;
        var marker = _ref13.marker;
        var cardSection = _ref13.cardSection;

        return post([markupSection('p', [marker('abc')]), cardSection('my-card')]);
      });
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
      editor.render(editorElement);

      var cardHead = editor.post.sections.tail.headPosition();
      var sectionTail = editor.post.sections.head.tailPosition();

      // Before zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 0);
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      var _editor8 = editor;
      var range = _editor8.range;

      assert.positionIsEqual(range.head, sectionTail);
      assert.positionIsEqual(range.tail, cardHead);

      // After zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 1);
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      range = editor.range;

      assert.positionIsEqual(range.head, sectionTail);
      assert.positionIsEqual(range.tail, cardHead);
    });

    test('left arrow at start of card moves selection to prev list item', function (assert) {
      var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref14) {
        var post = _ref14.post;
        var listSection = _ref14.listSection;
        var listItem = _ref14.listItem;
        var marker = _ref14.marker;
        var cardSection = _ref14.cardSection;

        return post([listSection('ul', [listItem([marker('abc')])]), cardSection('my-card')]);
      });
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
      editor.render(editorElement);

      var cardHead = editor.post.sections.tail.headPosition();
      var sectionTail = editor.post.sections.head.items.head.tailPosition();

      // Before zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 0);
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      var _editor9 = editor;
      var range = _editor9.range;

      assert.positionIsEqual(range.head, sectionTail);
      assert.positionIsEqual(range.tail, cardHead);

      // After zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 1);
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      range = editor.range;

      assert.positionIsEqual(range.head, sectionTail);
      assert.positionIsEqual(range.tail, cardHead);
    });

    test('right arrow at start of card moves the cursor across the card', function (assert) {
      var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref15) {
        var post = _ref15.post;
        var cardSection = _ref15.cardSection;

        return post([cardSection('my-card')]);
      });
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
      editor.render(editorElement);

      var cardHead = editor.post.sections.head.headPosition();
      var cardTail = editor.post.sections.head.tailPosition();

      // Before zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 0);
      _testHelpers['default'].dom.triggerRightArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      var _editor10 = editor;
      var range = _editor10.range;

      assert.positionIsEqual(range.head, cardHead);
      assert.positionIsEqual(range.tail, cardTail);

      // After zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 1);
      _testHelpers['default'].dom.triggerRightArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      range = editor.range;

      assert.positionIsEqual(range.head, cardHead);
      assert.positionIsEqual(range.tail, cardTail);
    });

    test('right arrow at end of card moves to next section', function (assert) {
      var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref16) {
        var post = _ref16.post;
        var markupSection = _ref16.markupSection;
        var marker = _ref16.marker;
        var cardSection = _ref16.cardSection;

        return post([cardSection('my-card'), markupSection('p', [marker('abc')])]);
      });
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
      editor.render(editorElement);

      var cardTail = editor.post.sections.head.tailPosition();
      var sectionHead = editor.post.sections.tail.headPosition();

      // Before zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
      _testHelpers['default'].dom.triggerRightArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      var _editor11 = editor;
      var range = _editor11.range;

      assert.positionIsEqual(range.head, cardTail);
      assert.positionIsEqual(range.tail, sectionHead);

      // After zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
      _testHelpers['default'].dom.triggerRightArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      range = editor.range;

      assert.positionIsEqual(range.head, cardTail);
      assert.positionIsEqual(range.tail, sectionHead);
    });

    test('right arrow at end of card moves to next list item', function (assert) {
      var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref17) {
        var post = _ref17.post;
        var listSection = _ref17.listSection;
        var listItem = _ref17.listItem;
        var marker = _ref17.marker;
        var cardSection = _ref17.cardSection;

        return post([cardSection('my-card'), listSection('ul', [listItem([marker('abc')])])]);
      });
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
      editor.render(editorElement);

      var cardTail = editor.post.sections.head.tailPosition();
      var itemHead = editor.post.sections.tail.items.head.headPosition();

      // Before zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
      _testHelpers['default'].dom.triggerRightArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      var _editor12 = editor;
      var range = _editor12.range;

      assert.positionIsEqual(range.head, cardTail);
      assert.positionIsEqual(range.tail, itemHead);

      // After zwnj
      _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
      _testHelpers['default'].dom.triggerRightArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      range = editor.range;

      assert.positionIsEqual(range.head, cardTail);
      assert.positionIsEqual(range.tail, itemHead);
    });

    test('left/right arrows move selection l-to-r and r-to-l across atom', function (assert) {
      editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref18) {
        var post = _ref18.post;
        var markupSection = _ref18.markupSection;
        var marker = _ref18.marker;
        var atom = _ref18.atom;

        return post([markupSection('p', [atom('my-atom', 'first')])]);
      }, editorOptions);

      editor.selectRange(editor.post.tailPosition());
      _testHelpers['default'].dom.triggerLeftArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      assert.positionIsEqual(editor.range.head, editor.post.headPosition());
      assert.positionIsEqual(editor.range.tail, editor.post.tailPosition());

      editor.selectRange(editor.post.headPosition());
      _testHelpers['default'].dom.triggerRightArrowKey(editor, _mobiledocKitUtilsKey.MODIFIERS.SHIFT);
      assert.positionIsEqual(editor.range.head, editor.post.headPosition());
      assert.positionIsEqual(editor.range.tail, editor.post.tailPosition());
    });
  }
});
define('tests/acceptance/cursor-position-test', ['exports', 'mobiledoc-kit', '../test-helpers'], function (exports, _mobiledocKit, _testHelpers) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var cards = [{
    name: 'my-card',
    type: 'dom',
    render: function render() {},
    edit: function edit() {}
  }];

  var atoms = [{
    name: 'my-atom',
    type: 'dom',
    render: function render() {
      return document.createTextNode('my-atom');
    }
  }];

  var editor = undefined,
      editorElement = undefined;

  _module('Acceptance: Cursor Position', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('cursor in a markup section reports its position correctly', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 1);
    var _editor = editor;
    var range = _editor.range;

    assert.ok(range.head.section === editor.post.sections.head, 'Cursor is positioned on first section');
    assert.equal(range.head.offset, 1, 'Cursor is positioned at offset 1');
  });

  test('cursor blank section reports its position correctly', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;

      return post([markupSection('p')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 0);
    var _editor2 = editor;
    var range = _editor2.range;

    assert.positionIsEqual(range.head, editor.post.sections.head.headPosition());
  });

  test('cursor moved left from section after card is reported as on the card with offset 1', function (assert) {
    // Cannot actually move a cursor, so just emulate what things looks like after
    // the arrow key is pressed
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var cardSection = _ref3.cardSection;

      return post([cardSection('my-card'), markupSection('p')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 1);
    var _editor3 = editor;
    var range = _editor3.range;

    assert.positionIsEqual(range.head, editor.post.sections.head.toPosition(1));
  });

  test('cursor moved up from end of section after card is reported as on the card with offset 1', function (assert) {
    // Cannot actually move a cursor, so just emulate what things looks like after
    // the arrow key is pressed
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var cardSection = _ref4.cardSection;

      return post([cardSection('my-card'), markupSection('p')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.lastChild, 0);
    var _editor4 = editor;
    var range = _editor4.range;

    assert.positionIsEqual(range.head, editor.post.sections.head.tailPosition());
  });

  test('cursor moved right from end of section before card is reported as on the card with offset 0', function (assert) {
    // Cannot actually move a cursor, so just emulate what things looks like after
    // the arrow key is pressed
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var cardSection = _ref5.cardSection;

      return post([markupSection('p'), cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 0);
    var _editor5 = editor;
    var range = _editor5.range;

    assert.positionIsEqual(range.head, editor.post.sections.tail.headPosition());
  });

  test('cursor moved right from end of section before card is reported as on the card with offset 0', function (assert) {
    // Cannot actually move a cursor, so just emulate what things looks like after
    // the arrow key is pressed
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var cardSection = _ref6.cardSection;

      return post([markupSection('p'), cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.lastChild.firstChild, 1);
    var _editor6 = editor;
    var range = _editor6.range;

    assert.positionIsEqual(range.head, editor.post.sections.tail.headPosition());
  });

  test('cursor focused on card wrapper with 2 offset', function (assert) {
    // Cannot actually move a cursor, so just emulate what things looks like after
    // the arrow key is pressed
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var cardSection = _ref7.cardSection;

      return post([markupSection('p'), cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    // We need to create a selection starting from the markup section's node
    // in order for the tail to end up focused on a div instead of a text node
    // This only happens in Firefox
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 0, editorElement.lastChild, 2);

    var _editor7 = editor;
    var range = _editor7.range;

    assert.positionIsEqual(range.tail, editor.post.sections.tail.tailPosition());
  });

  // This can happen when using arrow+shift keys to select left across a card
  test('cursor focused on card wrapper with 0 offset', function (assert) {
    // Cannot actually move a cursor, so just emulate what things looks like after
    // the arrow key is pressed
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var cardSection = _ref8.cardSection;

      return post([markupSection('p'), cardSection('my-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    // We need to create a selection starting from the markup section's node
    // in order for the tail to end up focused on a div instead of a text node
    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.firstChild.firstChild, 0, editorElement.lastChild, 0);
    var _editor8 = editor;
    var range = _editor8.range;

    assert.positionIsEqual(range.tail, editor.post.sections.tail.headPosition());
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/215
  test('selecting the entire editor element reports a selection range of the entire post', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('1234')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement, 0, editorElement, editorElement.childNodes.length);
    var _editor9 = editor;
    var range = _editor9.range;

    assert.positionIsEqual(range.head, editor.post.sections.head.headPosition());
    assert.positionIsEqual(range.tail, editor.post.sections.tail.tailPosition());
  });

  test('when at the head of an atom', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;
      var atom = _ref10.atom;

      return post([markupSection('p', [marker('aa'), atom('my-atom'), marker('cc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: atoms });
    editor.render(editorElement);

    var atomWrapper = editor.post.sections.head.markers.objectAt(1).renderNode.element;

    // Before zwnj
    //
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.firstChild, 0);
    var range = editor.range;

    var positionBeforeAtom = editor.post.sections.head.toPosition('aa'.length);

    assert.positionIsEqual(range.head, positionBeforeAtom);

    // After zwnj
    //
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.firstChild, 1);
    range = editor.range;

    assert.positionIsEqual(range.head, positionBeforeAtom);

    // On wrapper
    //
    [0, 1].forEach(function (index) {
      _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper, index);
      range = editor.range;

      assert.positionIsEqual(range.head, positionBeforeAtom);
    });

    // text node before wrapper
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.previousSibling, 2);
    range = editor.range;

    assert.positionIsEqual(range.head, positionBeforeAtom);
  });

  test('when at the tail of an atom', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;
      var atom = _ref11.atom;

      return post([markupSection('p', [marker('aa'), atom('my-atom'), marker('cc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: atoms });
    editor.render(editorElement);

    var atomWrapper = editor.post.sections.head.markers.objectAt(1).renderNode.element;
    var positionAfterAtom = editor.post.sections.head.toPosition('aa'.length + 1);

    // Before zwnj
    //
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.lastChild, 0);
    var range = editor.range;

    assert.positionIsEqual(range.head, positionAfterAtom);

    // After zwnj
    //
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.lastChild, 1);
    range = editor.range;

    assert.positionIsEqual(range.head, positionAfterAtom);

    // On wrapper
    //
    [2, 3].forEach(function (index) {
      _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper, index);
      range = editor.range;
      assert.positionIsEqual(range.head, positionAfterAtom);
    });

    // After wrapper
    //
    _testHelpers['default'].dom.moveCursorTo(editor, atomWrapper.nextSibling, 0);
    range = editor.range;

    assert.positionIsEqual(range.head, positionAfterAtom);
  });
});
define('tests/acceptance/editor-atoms-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/renderers/mobiledoc/0-3-1', 'mobiledoc-kit/utils/cursor/range'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitRenderersMobiledoc031, _mobiledocKitUtilsCursorRange) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var simpleAtom = {
    name: 'simple-atom',
    type: 'dom',
    render: function render(_ref) {
      var value = _ref.value;

      var element = document.createElement('span');
      element.setAttribute('id', 'simple-atom');
      element.appendChild(document.createTextNode(value));
      return element;
    }
  };

  var editor = undefined,
      editorElement = undefined;
  var mobiledocWithAtom = {
    version: _mobiledocKitRenderersMobiledoc031.MOBILEDOC_VERSION,
    atoms: [['simple-atom', 'Bob']],
    cards: [],
    markups: [],
    sections: [[1, "P", [[0, [], 0, "text before atom"], [1, [], 0, 0], [0, [], 0, "text after atom"]]]]
  };
  var editorOptions = { atoms: [simpleAtom] };

  _module('Acceptance: Atoms', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('keystroke of character before starting atom inserts character', function (assert) {
    var done = assert.async();
    assert.expect(2);
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref2) {
      var post = _ref2.post;
      var atom = _ref2.atom;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      expected = post([markupSection('p', [marker('A'), atom('simple-atom', 'first')])]);
      return post([markupSection('p', [atom('simple-atom', 'first')])]);
    }, editorOptions);

    editor.selectRange(editor.post.headPosition());
    _testHelpers['default'].dom.insertText(editor, 'A');

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('keystroke of character before mid-text atom inserts character', function (assert) {
    var done = assert.async();
    assert.expect(2);
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref3) {
      var post = _ref3.post;
      var atom = _ref3.atom;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      expected = post([markupSection('p', [marker('ABC'), atom('simple-atom', 'first')])]);
      return post([markupSection('p', [marker('AB'), atom('simple-atom', 'first')])]);
    }, editorOptions);

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(editor.post.sections.head, 'AB'.length));
    _testHelpers['default'].dom.insertText(editor, 'C');

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('keystroke of character after mid-text atom inserts character', function (assert) {
    var done = assert.async();
    assert.expect(2);
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref4) {
      var post = _ref4.post;
      var atom = _ref4.atom;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      expected = post([markupSection('p', [atom('simple-atom', 'first'), marker('ABC')])]);
      return post([markupSection('p', [atom('simple-atom', 'first'), marker('BC')])]);
    }, editorOptions);

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(editor.post.sections.head, 1));
    _testHelpers['default'].dom.insertText(editor, 'A');

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('keystroke of character after end-text atom inserts character', function (assert) {
    var done = assert.async();
    assert.expect(2);
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref5) {
      var post = _ref5.post;
      var atom = _ref5.atom;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;

      expected = post([markupSection('p', [atom('simple-atom', 'first'), marker('A')])]);
      return post([markupSection('p', [atom('simple-atom', 'first')])]);
    }, editorOptions);

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(editor.post.sections.head, 1));
    _testHelpers['default'].dom.insertText(editor, 'A');

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('keystroke of delete removes character after atom', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledocWithAtom, atoms: [simpleAtom] });
    editor.render(editorElement);

    var pNode = $('#editor p')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, pNode.lastChild, 1);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.postIsSimilar(editor.post, _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var atom = _ref6.atom;
      var marker = _ref6.marker;

      return post([markupSection('p', [marker('text before atom'), atom('simple-atom', 'Bob'), marker('ext after atom')])]);
    }));
  });

  test('keystroke of delete removes atom', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledocWithAtom, atoms: [simpleAtom] });
    editor.render(editorElement);

    var pNode = $('#editor p')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, pNode.lastChild, 0);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.postIsSimilar(editor.post, _testHelpers['default'].postAbstract.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var atom = _ref7.atom;
      var marker = _ref7.marker;

      return post([markupSection('p', [marker('text before atomtext after atom')])]);
    }));
  });

  test('keystroke of forward delete removes atom', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledocWithAtom, atoms: [simpleAtom] });
    editor.render(editorElement);

    var pNode = $('#editor p')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, pNode.firstChild, 16);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.postIsSimilar(editor.post, _testHelpers['default'].postAbstract.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var atom = _ref8.atom;
      var marker = _ref8.marker;

      return post([markupSection('p', [marker('text before atomtext after atom')])]);
    }));
  });

  test('keystroke of enter in section with atom creates new section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledocWithAtom, atoms: [simpleAtom] });
    editor.render(editorElement);

    var pNode = $('#editor p')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, pNode.lastChild, 1);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.postIsSimilar(editor.post, _testHelpers['default'].postAbstract.build(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var atom = _ref9.atom;
      var marker = _ref9.marker;

      return post([markupSection('p', [marker('text before atom'), atom('simple-atom', 'Bob'), marker('t')]), markupSection('p', [marker('ext after atom')])]);
    }));
  });

  test('keystroke of enter after atom and before marker creates new section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledocWithAtom, atoms: [simpleAtom] });
    editor.render(editorElement);

    var pNode = $('#editor p')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, pNode.lastChild, 0);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.postIsSimilar(editor.post, _testHelpers['default'].postAbstract.build(function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var atom = _ref10.atom;
      var marker = _ref10.marker;

      return post([markupSection('p', [marker('text before atom'), atom('simple-atom', 'Bob')]), markupSection('p', [marker('text after atom')])]);
    }));
  });

  test('keystroke of enter before atom and after marker creates new section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledocWithAtom, atoms: [simpleAtom] });
    editor.render(editorElement);

    var pNode = $('#editor p')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, pNode.firstChild, 16);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.postIsSimilar(editor.post, _testHelpers['default'].postAbstract.build(function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var atom = _ref11.atom;
      var marker = _ref11.marker;

      return post([markupSection('p', [marker('text before atom')]), markupSection('p', [atom('simple-atom', 'Bob'), marker('text after atom')])]);
    }));
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/313
  test('keystroke of enter at markup section head before atom creates new section', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref12) {
      var post = _ref12.post;
      var markupSection = _ref12.markupSection;
      var atom = _ref12.atom;

      expected = post([markupSection('p'), markupSection('p', [atom('simple-atom')])]);
      return post([markupSection('p', [atom('simple-atom')])]);
    }, editorOptions);

    editor.run(function (postEditor) {
      postEditor.setRange(editor.post.headPosition());
    });
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor.range.head, editor.post.sections.tail.headPosition());
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/313
  test('keystroke of enter at list item head before atom creates new section', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref13) {
      var post = _ref13.post;
      var listSection = _ref13.listSection;
      var listItem = _ref13.listItem;
      var atom = _ref13.atom;
      var marker = _ref13.marker;

      var blankMarker = marker();
      expected = post([listSection('ul', [listItem([blankMarker]), listItem([atom('simple-atom', 'X')])])]);
      return post([listSection('ul', [listItem([atom('simple-atom', 'X')])])]);
    }, editorOptions);

    editor.run(function (postEditor) {
      postEditor.setRange(editor.post.headPosition());
    });
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.postIsSimilar(editor.post, expected);
    // FIXME the render tree does not have the blank marker render node
    // because ListItem#isBlank is true, so it simply renders a cursor-positioning
    // `<br>` tag instead of an empy marker, so the following render tree check
    // is not accurate:
    // assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor.range.head, editor.post.sections.head.items.tail.headPosition());
  });

  test('marking atom with markup adds markup', function (assert) {
    assert.expect(1);
    var done = assert.async();

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledocWithAtom, atoms: [simpleAtom] });
    editor.render(editorElement);

    var pNode = $('#editor p')[0];
    _testHelpers['default'].dom.selectRange(pNode.firstChild, 16, pNode.lastChild, 0);

    _testHelpers['default'].wait(function () {
      editor.run(function (postEditor) {
        var markup = editor.builder.createMarkup('strong');
        postEditor.addMarkupToRange(editor.range, markup);
      });

      assert.postIsSimilar(editor.post, _testHelpers['default'].postAbstract.build(function (_ref14) {
        var post = _ref14.post;
        var markupSection = _ref14.markupSection;
        var atom = _ref14.atom;
        var marker = _ref14.marker;
        var markup = _ref14.markup;

        return post([markupSection('p', [marker('text before atom'), atom('simple-atom', 'Bob', {}, [markup('strong')]), marker('text after atom')])]);
      }));

      done();
    });
  });

  test('typing between two atoms inserts character', function (assert) {
    var done = assert.async();
    assert.expect(2);

    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref15) {
      var post = _ref15.post;
      var markupSection = _ref15.markupSection;
      var atom = _ref15.atom;
      var marker = _ref15.marker;

      expected = post([markupSection('p', [atom('simple-atom', 'first'), marker('A'), atom('simple-atom', 'last')])]);
      return post([markupSection('p', [atom('simple-atom', 'first'), atom('simple-atom', 'last')])]);
    }, editorOptions);

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(editor.post.sections.head, 1));

    _testHelpers['default'].dom.insertText(editor, 'A');

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('delete selected text including atom deletes atom', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref16) {
      var post = _ref16.post;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;
      var atom = _ref16.atom;

      expected = post([markupSection('p', [marker('abc')])]);
      return post([markupSection('p', [marker('ab'), atom('simple-atom', 'deleteme'), marker('c')])]);
    }, editorOptions);

    var section = editor.post.sections.head;
    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(section, 'ab'.length, section, 'ab'.length + 1));

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
  });

  test('delete selected text that ends between atoms deletes first atom', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var marker = _ref17.marker;
      var atom = _ref17.atom;

      expected = post([markupSection('p', [marker('abd'), atom('simple-atom', 'keepme')])]);
      return post([markupSection('p', [marker('ab'), atom('simple-atom', 'deleteme'), marker('cd'), atom('simple-atom', 'keepme')])]);
    }, editorOptions);

    var section = editor.post.sections.head;
    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(section, 'ab'.length, section, 'ab'.length + 1 + 'c'.length));

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
  });
});
define('tests/acceptance/editor-attributes-test', ['exports', '../test-helpers'], function (exports, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  function renderEditor() {
    var _Helpers$mobiledoc;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    editor = (_Helpers$mobiledoc = _testHelpers['default'].mobiledoc).renderInto.apply(_Helpers$mobiledoc, [editorElement].concat(args));
    editor.selectRange(editor.post.tailPosition());
    return editor;
  }

  _module('Acceptance: Editor: Attributes', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('pressing ENTER at the end of an aligned paragraph maintains the alignment (bug #694)', function (assert) {
    renderEditor(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('abc')], false, { 'data-md-text-align': 'center' })]);
    });

    _testHelpers['default'].dom.triggerEnter(editor);

    var firstParagraph = document.querySelector('#editor p:first-of-type');
    assert.equal(firstParagraph.getAttribute('data-md-text-align'), 'center');
  });

  test('toggling the section inside an aligned list maintains the alignment of the list (bug #694)', function (assert) {
    renderEditor(function (_ref2) {
      var post = _ref2.post;
      var listSection = _ref2.listSection;
      var listItem = _ref2.listItem;
      var marker = _ref2.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('123')])], { 'data-md-text-align': 'center' })]);
    });

    editor.run(function (postEditor) {
      return postEditor.toggleSection('h1');
    });

    var ul = document.querySelector('#editor ul');
    assert.equal(ul.getAttribute('data-md-text-align'), 'center');
  });
});
define('tests/acceptance/editor-cards-test', ['exports', 'mobiledoc-kit/utils/key', '../test-helpers', 'mobiledoc-kit/models/card'], function (exports, _mobiledocKitUtilsKey, _testHelpers, _mobiledocKitModelsCard) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;
  var buildFromText = _testHelpers['default'].editor.buildFromText;

  var editor = undefined,
      editorElement = undefined;
  var editorOpts = undefined;
  var cardText = 'card text';

  var cards = [{
    name: 'simple',
    type: 'dom',
    render: function render(_ref) {
      var env = _ref.env;

      var element = document.createElement('div');

      var button = document.createElement('button');
      button.setAttribute('id', 'display-button');
      element.appendChild(button);
      element.appendChild(document.createTextNode(cardText));
      button.onclick = env.edit;

      return element;
    },
    edit: function edit(_ref2) {
      var env = _ref2.env;

      var button = document.createElement('button');
      button.setAttribute('id', 'edit-button');
      button.onclick = env.save;
      return button;
    }
  }, {
    name: 'input',
    type: 'dom',
    render: function render() {
      return $('<input id="simple-card-input">')[0];
    }
  }, {
    name: 'position',
    type: 'dom',
    render: function render() {
      return $('<div id="my-simple-card"></div>')[0];
    }
  }];

  _module('Acceptance: editor: cards', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
      editorOpts = { element: editorElement, cards: cards };
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('changing to display state triggers update on editor', function (assert) {
    editor = buildFromText(['[simple]'], editorOpts);

    var updateCount = 0,
        triggeredUpdate = function triggeredUpdate() {
      return updateCount++;
    };
    editor.postDidChange(triggeredUpdate);

    var displayButton = document.getElementById('display-button');
    assert.ok(!!displayButton, 'precond - display button is there');

    _testHelpers['default'].dom.triggerEvent(displayButton, 'click');

    var editButton = document.getElementById('edit-button');
    assert.ok(!!editButton, 'precond - edit button is there after clicking the display button');

    var currentUpdateCount = updateCount;

    _testHelpers['default'].dom.triggerEvent(editButton, 'click');

    assert.equal(updateCount, currentUpdateCount + 1, 'update is triggered after switching to display mode');
  });

  test('editor listeners are quieted for card actions', function (assert) {
    var done = assert.async();

    editor = buildFromText(['[simple]'], editorOpts);

    _testHelpers['default'].dom.selectText(editor, cardText, editorElement);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    _testHelpers['default'].wait(function () {
      // FIXME should have a better assertion here
      assert.ok(true, 'made it here with no javascript errors');
      done();
    });
  });

  test('removing last card from mobiledoc allows additional editing', function (assert) {
    var done = assert.async();
    var button = undefined;
    var cards = [{
      name: 'removable',
      type: 'dom',
      render: function render(_ref3) {
        var env = _ref3.env;

        button = $('<button id="removable-button">Click me</button>');
        button.on('click', env.remove);
        return button[0];
      }
    }];
    editor = buildFromText(['[removable]'], { element: editorElement, cards: cards });

    assert.hasElement('#editor button:contains(Click me)', 'precond - button');

    button.click();

    _testHelpers['default'].wait(function () {
      assert.hasNoElement('#editor button:contains(Click me)', 'button is removed');
      assert.hasNoElement('#editor p');
      _testHelpers['default'].dom.moveCursorTo(editor, $('#editor')[0]);
      _testHelpers['default'].dom.insertText(editor, 'X');
      assert.hasElement('#editor p:contains(X)');

      done();
    });
  });

  test('delete when cursor is positioned at end of a card deletes card, replace with empty markup section', function (assert) {
    editor = buildFromText(['[position]|'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasNoElement('#editor p', 'precond - has no markup section');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasNoElement('#my-simple-card', 'removes card after delete');
    assert.hasElement('#editor p', 'has markup section after delete');
  });

  test('delete when cursor is at start of a card and prev section is blank deletes prev section', function (assert) {
    editor = buildFromText(['', '|[position]'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasElement('#editor p', 'precond - has blank markup section');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#my-simple-card', 'card still exists after delete');
    assert.hasNoElement('#editor p', 'blank markup section deleted');
  });

  test('forward-delete when cursor is positioned at start of a card deletes card, replace with empty markup section', function (assert) {
    editor = buildFromText(['|[position]'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasNoElement('#editor p', 'precond - has no markup section');

    _testHelpers['default'].dom.triggerDelete(editor, _mobiledocKitUtilsKey.DIRECTION.FORWARD);

    assert.hasNoElement('#my-simple-card', 'removes card after delete');
    assert.hasElement('#editor p', 'has markup section after delete');
  });

  test('forward-delete when cursor is positioned at end of a card and next section is blank deletes next section', function (assert) {
    editor = buildFromText(['[position]|', ''], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasElement('#editor p', 'precond - has blank markup section');

    _testHelpers['default'].dom.triggerDelete(editor, _mobiledocKitUtilsKey.DIRECTION.FORWARD);

    assert.hasElement('#my-simple-card', 'still has card after delete');
    assert.hasNoElement('#editor p', 'deletes blank markup section');
  });

  test('selecting a card and deleting deletes the card', function (assert) {
    editor = buildFromText(['<[position]>'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasNoElement('#editor p', 'precond - has no markup section');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasNoElement('#my-simple-card', 'has no card after delete');
    assert.hasElement('#editor p', 'has blank markup section');
  });

  test('selecting a card and some text after and deleting deletes card and text', function (assert) {
    editor = buildFromText(['<[position]', 'a>bc'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasElement('#editor p:contains(abc)', 'precond - has markup section');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasNoElement('#my-simple-card', 'has no card after delete');
    assert.hasElement('p:contains(bc)', 'p with bc');
    assert.hasNoElement('p:contains(abc)', '"a" is deleted');
  });

  test('deleting at start of empty markup section with prev card deletes the markup section', function (assert) {
    editor = buildFromText(['[position]', '|'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasElement('#editor p', 'precond - has blank markup section');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#my-simple-card', 'has card after delete');
    assert.hasNoElement('#editor p', 'paragraph is gone');
  });

  test('press enter at end of card inserts section after card', function (assert) {
    editor = buildFromText(['[position]|'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasNoElement('#editor p', 'precond - has no markup section');

    _testHelpers['default'].dom.triggerEnter(editor);

    assert.hasElement('#my-simple-card', 'has card after enter');
    assert.hasElement('#editor p', 'markup section is added');
  });

  test('press enter at start of card inserts section before card', function (assert) {
    editor = buildFromText(['|[position]'], editorOpts);

    assert.hasElement('#my-simple-card', 'precond - renders card');
    assert.hasNoElement('#editor p', 'precond - has no markup section');

    _testHelpers['default'].dom.triggerEnter(editor);

    assert.hasElement('#my-simple-card', 'has card after enter');
    assert.hasElement('#editor p', 'markup section is added');
  });

  test('editor ignores events when focus is inside a card', function (assert) {
    editor = buildFromText(['', '[input]'], editorOpts);

    assert.hasElement('#simple-card-input', 'precond - renders card');

    var inputEvents = 0;
    editor._eventManager.keyup = function () {
      return inputEvents++;
    };

    var input = $('#simple-card-input')[0];
    _testHelpers['default'].dom.triggerEvent(input, 'keyup');

    assert.equal(inputEvents, 0, 'editor does not handle keyup event when in card');

    var p = $('#editor p')[0];
    _testHelpers['default'].dom.triggerEvent(p, 'keyup');

    assert.equal(inputEvents, 1, 'editor handles keyup event outside of card');
  });

  test('a moved card retains its inital editing mode', function (assert) {
    editorOpts.beforeRender = function (editor) {
      editor.post.sections.tail.setInitialMode(_mobiledocKitModelsCard.CARD_MODES.EDIT);
    };
    editor = buildFromText(['', '[simple]'], editorOpts);

    assert.hasElement('#edit-button', 'precond - card is in edit mode');

    editor.run(function (postEditor) {
      var card = editor.post.sections.tail;
      postEditor.moveSectionUp(card);
    });

    assert.hasElement('#edit-button', 'card is still in edit mode');
  });

  test('a moved card retains its current editing mode', function (assert) {
    editor = buildFromText(['', '[simple]'], editorOpts);

    assert.hasNoElement('#edit-button', 'precond - card is not in edit mode');

    editor.editCard(editor.post.sections.tail);
    assert.hasElement('#edit-button', 'precond - card is in edit mode');

    editor.run(function (postEditor) {
      return postEditor.moveSectionUp(editor.post.sections.tail);
    });

    assert.hasElement('#edit-button', 'card is still in edit mode');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/475
  test('when editing is disabled, cards can be moved and deleted', function (assert) {
    var removeHook = undefined;
    editorOpts.unknownCardHandler = function (_ref4) {
      var _ref4$env = _ref4.env;
      var name = _ref4$env.name;
      var remove = _ref4$env.remove;

      if (name === 'card-b') {
        removeHook = remove;
      }
      return $('<h1>' + name + '</h1>')[0];
    };
    editor = buildFromText(['[card-a]', '[card-b]|'], editorOpts);
    editor.disableEditing();

    var card = editor.post.sections.tail;
    editor.run(function (postEditor) {
      // In order to recreate the problematic scenario, we must explicitly set the range
      // here to the moved section's tail position
      var movedSection = postEditor.moveSectionUp(card);
      postEditor.setRange(movedSection.tailPosition());
    });

    assert.hasElement('h1:contains(card-a)');
    assert.hasElement('h1:contains(card-b)');
    var text = $(editorElement).text();
    assert.ok(text.indexOf('card-b') < text.indexOf('card-a'), 'card b is moved up');

    removeHook();

    assert.hasNoElement('h1:contains(card-b)');
  });
});
define('tests/acceptance/editor-copy-paste-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/utils/parse-utils', 'mobiledoc-kit/utils/keycodes'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitUtilsParseUtils, _mobiledocKitUtilsKeycodes) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var cards = [{
    name: 'my-card',
    type: 'dom',
    render: function render() {},
    edit: function edit() {}
  }];

  var editor = undefined,
      editorElement = undefined;

  _module('Acceptance: editor: copy-paste', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
      _testHelpers['default'].dom.clearCopyData();
    }
  });

  // TODO: Modify these tests to use IE's nonstandard clipboard access pattern
  // See: https://remysharp.com/2015/10/14/the-art-of-debugging
  test('simple copy-paste at end of section works', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'abc', editorElement);
    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var textNode = $('#editor p')[0].childNodes[0];
    assert.equal(textNode.textContent, 'abc'); //precond
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, textNode.length);

    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
  });

  test('paste plain text', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var textNode = $('#editor p')[0].childNodes[0];
    assert.equal(textNode.textContent, 'abc'); //precond
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, textNode.length);

    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, 'abc');
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
  });

  test('paste plain text with line breaks', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var textNode = $('#editor p')[0].childNodes[0];
    assert.equal(textNode.textContent, 'abc'); //precond
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, textNode.length);

    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, ['abc', 'def'].join('\n'));
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
    assert.hasElement('#editor p:contains(def)', 'second section is pasted');
    assert.equal($('#editor p').length, 2, 'adds a second section');
  });

  test('paste plain text with list items', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var textNode = $('#editor p')[0].childNodes[0];
    assert.equal(textNode.textContent, 'abc'); //precond
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, textNode.length);

    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, ['* abc', '* def'].join('\n'));
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(abcabc)', 'pastes the text');
    assert.hasElement('#editor ul li:contains(def)', 'list item is pasted');
  });

  test('paste plain text into an empty Mobiledoc', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref5) {
      var post = _ref5.post;

      return post();
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, 'abc');
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(abc)', 'pastes the text');
  });

  test('can cut and then paste content', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    assert.hasElement('#editor p:contains(abc)', 'precond - has p');

    _testHelpers['default'].dom.selectText(editor, 'abc', editorElement);
    _testHelpers['default'].dom.triggerCutEvent(editor);

    assert.hasNoElement('#editor p:contains(abc)', 'content removed after cutting');

    var textNode = $('#editor p')[0].childNodes[0];
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, textNode.length);

    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(abc)', 'pastes the text');
  });

  test('paste when text is selected replaces that text', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    assert.hasElement('#editor p:contains(abc)', 'precond - has p');

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement);
    _testHelpers['default'].dom.triggerCopyEvent(editor);

    _testHelpers['default'].dom.selectText(editor, 'a', editorElement);

    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(bcbc)', 'pastes, replacing the selection');
  });

  test('simple copy-paste with markup at end of section works', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;
      var markup = _ref8.markup;

      return post([markupSection('p', [marker('a', [markup('strong')]), marker('bc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'a', editorElement, 'b', editorElement);
    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var textNode = $('#editor p')[0].childNodes[1];
    assert.equal(textNode.textContent, 'bc'); //precond
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, textNode.length);

    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(abcab)', 'pastes the text');
    assert.equal($('#editor p strong:contains(a)').length, 2, 'two bold As');
  });

  test('simple copy-paste in middle of section works', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      return post([markupSection('p', [marker('abcd')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'c', editorElement);
    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var textNode = $('#editor p')[0].childNodes[0];
    assert.equal(textNode.textContent, 'abcd'); //precond
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 1);

    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(acbcd)', 'pastes the text');
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor p:contains(acXbcd)', 'inserts text in right spot');
  });

  test('simple copy-paste at start of section works', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;

      return post([markupSection('p', [marker('abcd')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'c', editorElement);
    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var textNode = $('#editor p')[0].childNodes[0];
    assert.equal(textNode.textContent, 'abcd'); //precond
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 0);

    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor p:contains(cabcd)', 'pastes the text');
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor p:contains(cXabcd)', 'inserts text in right spot');
  });

  test('copy-paste can copy cards', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;
      var cardSection = _ref11.cardSection;

      return post([markupSection('p', [marker('abc')]), cardSection('test-card', { foo: 'bar' }), markupSection('p', [marker('123')])]);
    });
    var cards = [{
      name: 'test-card',
      type: 'dom',
      render: function render(_ref12) {
        var payload = _ref12.payload;

        return $('<div class=\'' + payload.foo + '\'>' + payload.foo + '</div>')[0];
      }
    }];
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    assert.hasElement('#editor .bar', 'precond - renders card');

    var startEl = $('#editor p:eq(0)')[0],
        endEl = $('#editor p:eq(1)')[0];
    assert.equal(endEl.textContent, '123', 'precond - endEl has correct text');
    _testHelpers['default'].dom.selectText(editor, 'c', startEl, '1', endEl);

    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var textNode = $('#editor p')[1].childNodes[0];
    assert.equal(textNode.textContent, '123', 'precond - correct textNode');

    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 2); // '3'
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.equal($('#editor .bar').length, 2, 'renders a second card');
  });

  test('copy-paste can copy list sections', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref13) {
      var post = _ref13.post;
      var markupSection = _ref13.markupSection;
      var marker = _ref13.marker;
      var listSection = _ref13.listSection;
      var listItem = _ref13.listItem;

      return post([markupSection('p', [marker('abc')]), listSection('ul', [listItem([marker('list')])]), markupSection('p', [marker('123')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'c', editor.element, '1', editor.element);

    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var textNode = $('#editor p')[1].childNodes[0];
    assert.equal(textNode.textContent, '123', 'precond - correct textNode');

    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 3); // end of node
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.equal($('#editor ul').length, 2, 'pastes the list');
    assert.hasElement($('#editor ul:eq(0) li:contains(list)'));
  });

  test('copy-paste can copy card following list section', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref14) {
      var post = _ref14.post;
      var markupSection = _ref14.markupSection;
      var marker = _ref14.marker;
      var listSection = _ref14.listSection;
      var listItem = _ref14.listItem;
      var cardSection = _ref14.cardSection;

      return post([markupSection('p', [marker('abc')]), listSection('ul', [listItem([marker('list')])]), cardSection('test-card', { foo: 'bar' }), markupSection('p', [marker('123')])]);
    });
    var cards = [{
      name: 'test-card',
      type: 'dom',
      render: function render(_ref15) {
        var payload = _ref15.payload;

        return $('<div class=\'' + payload.foo + '\'>' + payload.foo + '</div>')[0];
      }
    }];
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    assert.hasElement('#editor .bar', 'precond - renders card');

    _testHelpers['default'].dom.selectText(editor, 'c', editor.element, '3', editor.element);

    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var textNode = $('#editor p')[1].childNodes[0];
    assert.equal(textNode.textContent, '123', 'precond - correct textNode');

    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 3); // end of node
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.equal($('#editor ul').length, 2, 'pastes the list');
    assert.hasElement('#editor ul:eq(1) li:contains(list)');

    assert.equal($('#editor .bar').length, 2, 'renders a second card');
  });

  test('copy sets html & text for pasting externally', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref16) {
      var post = _ref16.post;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;

      return post([markupSection('h1', [marker('h1 heading')]), markupSection('h2', [marker('h2 subheader')]), markupSection('p', [marker('The text')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'heading', editor.element, 'The text', editor.element);

    _testHelpers['default'].dom.triggerCopyEvent(editor);

    var html = _testHelpers['default'].dom.getCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_HTML);
    var text = _testHelpers['default'].dom.getCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN);
    assert.equal(text, ["heading", "h2 subheader", "The text"].join('\n'), 'gets plain text');

    assert.ok(html.indexOf("<h1>heading") !== -1, 'html has h1');
    assert.ok(html.indexOf("<h2>h2 subheader") !== -1, 'html has h2');
    assert.ok(html.indexOf("<p>The text") !== -1, 'html has p');
  });

  test('pasting when cursor is on left/right side of card adds content before/after card', function (assert) {
    var expected1 = undefined,
        expected2 = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var cardSection = _ref17.cardSection;
      var marker = _ref17.marker;

      expected1 = post([markupSection('p', [marker('abc')]), cardSection('my-card')]);

      expected2 = post([markupSection('p', [marker('abc')]), cardSection('my-card'), markupSection('p', [marker('123')])]);

      return post([cardSection('my-card')]);
    }, { cards: cards });

    var card = editor.post.sections.objectAt(0);
    assert.ok(card.isCardSection, 'precond - get card');

    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, 'abc');
    editor.selectRange(card.headPosition());
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.postIsSimilar(editor.post, expected1, 'content pasted before card');

    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, '123');
    editor.selectRange(card.tailPosition());
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.postIsSimilar(editor.post, expected2, 'content pasted after card');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/249
  test('pasting when replacing a list item works', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref18) {
      var post = _ref18.post;
      var listSection = _ref18.listSection;
      var listItem = _ref18.listItem;
      var markupSection = _ref18.markupSection;
      var marker = _ref18.marker;

      return post([markupSection('p', [marker('X')]), listSection('ul', [listItem([marker('Y')])])]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    assert.hasElement('#editor li:contains(Y)', 'precond: has li with Y');

    _testHelpers['default'].dom.selectText(editor, 'X', editorElement);
    _testHelpers['default'].dom.triggerCopyEvent(editor);

    _testHelpers['default'].dom.selectText(editor, 'Y', editorElement);
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.hasElement('#editor li:contains(X)', 'replaces Y with X in li');
    assert.hasNoElement('#editor li:contains(Y)', 'li with Y is gone');
  });

  test('paste with shift key pastes plain text', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref19) {
      var post = _ref19.post;
      var markupSection = _ref19.markupSection;
      var marker = _ref19.marker;
      var markup = _ref19.markup;

      expected = post([markupSection('p', [marker('a'), marker('b', [markup('b')]), marker('cabc')])]);
      return post([markupSection('p', [marker('a'), marker('b', [markup('b')]), marker('c')])]);
    });

    editor.selectRange(editor.post.toRange());
    _testHelpers['default'].dom.triggerCopyEvent(editor);
    editor.selectRange(editor.post.tailPosition());

    _testHelpers['default'].dom.triggerKeyEvent(editor, 'keydown', { keyCode: _mobiledocKitUtilsKeycodes['default'].SHIFT });
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.postIsSimilar(editor.post, expected);
  });

  test('paste with html that parses to blank doc doesn\'t error', function (assert) {
    var expected = undefined;
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref20) {
      var post = _ref20.post;
      var markupSection = _ref20.markupSection;
      var marker = _ref20.marker;

      expected = post([markupSection('p', [])]);

      return post([markupSection('p', [marker('abcd')])]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    _testHelpers['default'].dom.setCopyData('text/html', '<div></div>');
    editor.selectRange(editor.post.toRange());
    _testHelpers['default'].dom.triggerPasteEvent(editor);

    assert.postIsSimilar(editor.post, expected);
  });
});
define('tests/acceptance/editor-disable-editing-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/utils/characters', 'mobiledoc-kit/utils/parse-utils'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitUtilsCharacters, _mobiledocKitUtilsParseUtils) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var cards = [{
    name: 'my-card',
    type: 'dom',
    render: function render() {},
    edit: function edit() {}
  }];

  var editor = undefined,
      editorElement = undefined;

  _module('Acceptance: editor: #disableEditing', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('#disableEditing before render is meaningful', function (assert) {
    editor = new _mobiledocKit.Editor();
    editor.disableEditing();
    editor.render(editorElement);

    assert.equal(editorElement.getAttribute('contenteditable'), 'false', 'element is not contenteditable');
    editor.enableEditing();
    assert.equal(editorElement.getAttribute('contenteditable'), 'true', 'element is contenteditable');
  });

  test('when editing is disabled, the placeholder is not shown', function (assert) {
    editor = new _mobiledocKit.Editor({ placeholder: 'the placeholder' });
    editor.disableEditing();
    editor.render(editorElement);

    assert.isBlank(_testHelpers['default'].dom.getData(editorElement, 'placeholder'), 'no placeholder when disabled');
    editor.enableEditing();
    assert.equal(_testHelpers['default'].dom.getData(editorElement, 'placeholder'), 'the placeholder', 'placeholder is shown when editable');
  });

  test('#disableEditing and #enableEditing toggle contenteditable', function (assert) {
    editor = new _mobiledocKit.Editor();
    editor.render(editorElement);

    assert.equal(editorElement.getAttribute('contenteditable'), 'true', 'element is contenteditable');
    editor.disableEditing();
    assert.equal(editorElement.getAttribute('contenteditable'), 'false', 'element is not contenteditable');
    editor.enableEditing();
    assert.equal(editorElement.getAttribute('contenteditable'), 'true', 'element is contenteditable');
  });

  // https://github.com/bustle/mobiledoc-kit/issues/572
  test('pasting after #disableEditing does not insert text', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('abc|', { element: editorElement });

    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, 'def');
    _testHelpers['default'].dom.triggerPasteEvent(editor);
    assert.hasElement('#editor:contains(abcdef)', 'precond - text is pasted');

    editor.disableEditing();

    _testHelpers['default'].dom.selectText(editor, 'def');
    _testHelpers['default'].dom.setCopyData(_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, 'ghi');
    _testHelpers['default'].dom.triggerPasteEvent(editor);
    assert.hasNoElement('#editor:contains(ghi)', 'text is not pasted after #disableEditing');
  });
});
define('tests/acceptance/editor-drag-drop-test', ['exports', '../test-helpers'], function (exports, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  function findCenterPointOfTextNode(node) {
    var range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, node.textContent.length);

    var _range$getBoundingClientRect = range.getBoundingClientRect();

    var left = _range$getBoundingClientRect.left;
    var top = _range$getBoundingClientRect.top;
    var width = _range$getBoundingClientRect.width;
    var height = _range$getBoundingClientRect.height;

    var clientX = left + width / 2;
    var clientY = top + height / 2;

    return { clientX: clientX, clientY: clientY };
  }

  _module('Acceptance: editor: drag-drop', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];

      /**
       * `document.elementFromPoint` return `null` if the element is outside the
       * viewport, so force the editor element to be in the viewport for this test suite
       */
      $(editorElement).css({
        position: 'fixed',
        top: '100px',
        left: '100px'
      });
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('inserts dropped HTML content at the drop position', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      expected = post([markupSection('h2', [marker('--->some text<---')])]);
      return post([markupSection('h2', [marker('---><---')])]);
    });

    var html = '<p>some text</p>';
    var node = _testHelpers['default'].dom.findTextNode(editorElement, '---><---');

    var _findCenterPointOfTextNode = findCenterPointOfTextNode(node);

    var clientX = _findCenterPointOfTextNode.clientX;
    var clientY = _findCenterPointOfTextNode.clientY;

    _testHelpers['default'].dom.triggerDropEvent(editor, { html: html, clientX: clientX, clientY: clientY });

    assert.postIsSimilar(editor.post, expected);
  });

  test('inserts dropped text content at the drop position if no html data', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      expected = post([markupSection('h2', [marker('--->some text<---')])]);
      return post([markupSection('h2', [marker('---><---')])]);
    });

    var text = 'some text';
    var node = _testHelpers['default'].dom.findTextNode(editorElement, '---><---');

    var _findCenterPointOfTextNode2 = findCenterPointOfTextNode(node);

    var clientX = _findCenterPointOfTextNode2.clientX;
    var clientY = _findCenterPointOfTextNode2.clientY;

    _testHelpers['default'].dom.triggerDropEvent(editor, { text: text, clientX: clientX, clientY: clientY });

    assert.postIsSimilar(editor.post, expected);
  });
});
define('tests/acceptance/editor-input-handlers-test', ['exports', '../test-helpers', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/utils/characters', 'mobiledoc-kit/utils/key'], function (exports, _testHelpers, _mobiledocKitUtilsCursorRange, _mobiledocKitRenderersEditorDom, _mobiledocKitUtilsCharacters, _mobiledocKitUtilsKey) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;
  var buildFromText = _testHelpers['default'].editor.buildFromText;
  var DEFAULT_ATOM_NAME = _testHelpers['default'].postAbstract.DEFAULT_ATOM_NAME;

  var editor = undefined,
      editorElement = undefined;

  function renderEditor() {
    var _Helpers$mobiledoc;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    editor = (_Helpers$mobiledoc = _testHelpers['default'].mobiledoc).renderInto.apply(_Helpers$mobiledoc, [editorElement].concat(args));
    editor.selectRange(editor.post.tailPosition());
    return editor;
  }

  var atom = {
    name: DEFAULT_ATOM_NAME,
    type: 'dom',
    render: function render() {}
  };

  _module('Acceptance: Editor: Text Input Handlers', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  var headerTests = [{
    text: '#',
    toInsert: ' ',
    headerTagName: 'h1'
  }, {
    text: '##',
    toInsert: ' ',
    headerTagName: 'h2'
  }, {
    text: '###',
    toInsert: ' ',
    headerTagName: 'h3'
  }, {
    text: '####',
    toInsert: ' ',
    headerTagName: 'h4'
  }, {
    text: '#####',
    toInsert: ' ',
    headerTagName: 'h5'
  }, {
    text: '######',
    toInsert: ' ',
    headerTagName: 'h6'
  }];

  headerTests.forEach(function (_ref) {
    var text = _ref.text;
    var toInsert = _ref.toInsert;
    var headerTagName = _ref.headerTagName;

    test('typing "' + text + toInsert + '" converts to ' + headerTagName, function (assert) {
      renderEditor(function (_ref2) {
        var post = _ref2.post;
        var markupSection = _ref2.markupSection;
        var marker = _ref2.marker;

        return post([markupSection('p', [marker(text)])]);
      });
      assert.hasElement('#editor p', 'precond - has p');
      _testHelpers['default'].dom.insertText(editor, toInsert);
      assert.hasNoElement('#editor p', 'p is gone');
      assert.hasElement('#editor ' + headerTagName, 'p -> ' + headerTagName);

      // Different browsers report different selections, so we grab the selection
      // here and then set it to what we expect it to be, and compare what
      // window.getSelection() reports.
      // E.g., in Firefox getSelection() reports that the anchorNode is the "br",
      // but Safari and Chrome report that the anchorNode is the header element
      var selection = window.getSelection();

      var cursorElement = $('#editor ' + headerTagName + ' br')[0];
      assert.ok(cursorElement, 'has cursorElement');
      _testHelpers['default'].dom.selectRange(cursorElement, 0, cursorElement, 0);

      var newSelection = window.getSelection();
      assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
      assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
      assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
      assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');

      _testHelpers['default'].dom.insertText(editor, 'X');
      assert.hasElement('#editor ' + headerTagName + ':contains(X)', 'text is inserted correctly');
    });

    test('typing "' + text + '" but not "' + toInsert + '" does not convert to ' + headerTagName, function (assert) {
      editor = buildFromText(text, { element: editorElement });
      assert.hasElement('#editor p', 'precond - has p');
      _testHelpers['default'].dom.insertText(editor, 'X');

      assert.hasElement('#editor p', 'still has p');
      assert.hasNoElement('#editor ' + headerTagName, 'does not change to ' + headerTagName);
    });
  });

  test('typing "* " converts to ul > li', function (assert) {
    renderEditor(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      return post([markupSection('p', [marker('*')])]);
    });

    _testHelpers['default'].dom.insertText(editor, ' ');
    assert.hasNoElement('#editor p', 'p is gone');
    assert.hasElement('#editor ul > li', 'p -> "ul > li"');

    // Store the selection so we can compare later
    var selection = window.getSelection();
    var cursorElement = $('#editor ul > li > br')[0];
    assert.ok(cursorElement, 'has cursorElement for cursor position');
    _testHelpers['default'].dom.selectRange(cursorElement, 0, cursorElement, 0);

    var newSelection = window.getSelection();
    assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
    assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
    assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
    assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');

    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor ul > li:contains(X)', 'text is inserted correctly');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/280
  test('typing "* " at start of markup section does not remove it', function (assert) {
    renderEditor(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      return post([markupSection('p', [marker('*abc')])]);
    });

    editor.selectRange(editor.post.sections.head.toPosition(1));

    _testHelpers['default'].dom.insertText(editor, ' ');
    assert.hasElement('#editor p:contains(* abc)', 'p is still there');
  });

  test('typing "* " inside of a list section does not create a new list section', function (assert) {
    renderEditor(function (_ref5) {
      var post = _ref5.post;
      var listSection = _ref5.listSection;
      var listItem = _ref5.listItem;
      var marker = _ref5.marker;

      return post([listSection('ul', [listItem([marker('*')])])]);
    });
    var position = editor.post.sections.head.items.head.tailPosition();
    editor.selectRange(position);

    assert.hasElement('#editor ul > li:contains(*)', 'precond - has li');

    _testHelpers['default'].dom.insertText(editor, ' ');
    // note: the actual text is "*&nbsp;", so only check that the "*" is there,
    assert.hasElement('#editor ul > li', 'still has li');
    var el = $('#editor ul > li')[0];
    assert.equal(el.textContent, '*' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE);
  });

  test('typing "1 " converts to ol > li', function (assert) {
    editor = buildFromText(['1|'], { element: editorElement });
    _testHelpers['default'].dom.insertText(editor, ' ');
    assert.hasNoElement('#editor p', 'p is gone');
    assert.hasElement('#editor ol > li', 'p -> "ol > li"');

    // Store the selection so we can compare later
    var selection = window.getSelection();
    var cursorElement = $('#editor ol > li > br')[0];
    assert.ok(cursorElement, 'has cursorElement for cursor position');
    _testHelpers['default'].dom.selectRange(cursorElement, 0, cursorElement, 0);

    var newSelection = window.getSelection();
    assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
    assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
    assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
    assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
  });

  test('typing "1. " converts to ol > li', function (assert) {
    editor = buildFromText('1.|', { element: editorElement });
    _testHelpers['default'].dom.insertText(editor, ' ');
    assert.hasNoElement('#editor p', 'p is gone');
    assert.hasElement('#editor ol > li', 'p -> "ol > li"');
    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(X)', 'text is inserted correctly');
  });

  test('an input handler will trigger anywhere in the text', function (assert) {
    editor = buildFromText('@abc@', { element: editorElement, atoms: [atom] });

    var expandCount = 0;
    var lastMatches = undefined;
    editor.onTextInput({
      name: 'at',
      text: '@',
      run: function run(editor, matches) {
        expandCount++;
        lastMatches = matches;
      }
    });

    // at start
    editor.selectRange(editor.post.headPosition());
    _testHelpers['default'].dom.insertText(editor, '@');
    assert.equal(expandCount, 1, 'expansion was run at start');
    assert.deepEqual(lastMatches, ['@'], 'correct match at start');

    // middle
    editor.selectRange(editor.post.sections.head.toPosition('@'.length + 1 + 'ab'.length));
    _testHelpers['default'].dom.insertText(editor, '@');
    assert.equal(expandCount, 2, 'expansion was run at middle');
    assert.deepEqual(lastMatches, ['@'], 'correct match at middle');

    // end
    editor.selectRange(editor.post.tailPosition());
    _testHelpers['default'].dom.insertText(editor, '@');
    assert.equal(expandCount, 3, 'expansion was run at end');
    assert.deepEqual(lastMatches, ['@'], 'correct match at end');
  });

  test('an input handler can provide a `match` instead of `text`', function (assert) {
    editor = buildFromText('@abc@', { element: editorElement, atoms: [atom] });

    var expandCount = 0;
    var lastMatches = undefined;
    var regex = /.(.)X$/;
    editor.onTextInput({
      name: 'test',
      match: regex,
      run: function run(editor, matches) {
        expandCount++;
        lastMatches = matches;
      }
    });

    // at start
    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition()));
    _testHelpers['default'].dom.insertText(editor, 'abX');
    assert.equal(expandCount, 1, 'expansion was run at start');
    assert.deepEqual(lastMatches, regex.exec('abX'), 'correct match at start');

    // middle
    editor.selectRange(editor.post.sections.head.toPosition('abX'.length + 1 + 'ab'.length));
    _testHelpers['default'].dom.insertText(editor, '..X');
    assert.equal(expandCount, 2, 'expansion was run at middle');
    assert.deepEqual(lastMatches, regex.exec('..X'), 'correct match at middle');

    // end
    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
    _testHelpers['default'].dom.insertText(editor, '**X');
    assert.equal(expandCount, 3, 'expansion was run at end');
    assert.deepEqual(lastMatches, regex.exec('**X'), 'correct match at end');
  });

  test('an input handler can provide a `match` that matches at start and end', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText(['@abc@'], { element: editorElement, atoms: [atom] });

    var expandCount = 0;
    var lastMatches = undefined;
    var regex = /^\d\d\d$/;
    editor.onTextInput({
      name: 'test',
      match: regex,
      run: function run(editor, matches) {
        expandCount++;
        lastMatches = matches;
      }
    });

    // at start
    editor.selectRange(editor.post.headPosition());
    _testHelpers['default'].dom.insertText(editor, '123');
    assert.equal(expandCount, 1, 'expansion was run at start');
    assert.deepEqual(lastMatches, regex.exec('123'), 'correct match at start');

    // middle
    editor.selectRange(editor.post.sections.head.toPosition('123'.length + 2));
    _testHelpers['default'].dom.insertText(editor, '123');
    assert.equal(expandCount, 1, 'expansion was not run at middle');

    // end
    editor.selectRange(editor.post.tailPosition());
    _testHelpers['default'].dom.insertText(editor, '123');
    assert.equal(expandCount, 1, 'expansion was not run at end');
  });

  // See https://github.com/bustle/mobiledoc-kit/issues/400
  test('input handler can be triggered by TAB', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('abc|', { element: editorElement });

    var didMatch = undefined;
    editor.onTextInput({
      name: 'test',
      match: /abc\t/,
      run: function run() {
        didMatch = true;
      }
    });

    _testHelpers['default'].dom.insertText(editor, _mobiledocKitUtilsCharacters.TAB);

    assert.ok(didMatch);
  });

  test('input handler can be triggered by ENTER', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('abc|', { element: editorElement });

    var didMatch = undefined;
    editor.onTextInput({
      name: 'test',
      match: /abc\n/,
      run: function run() {
        didMatch = true;
      }
    });

    _testHelpers['default'].dom.insertText(editor, _mobiledocKitUtilsCharacters.ENTER);

    assert.ok(didMatch);
  });

  // See https://github.com/bustle/mobiledoc-kit/issues/565
  test('typing ctrl-TAB does not insert TAB text', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('abc|', { element: editorElement });

    _testHelpers['default'].dom.triggerKeyCommand(editor, _mobiledocKitUtilsCharacters.TAB, [_mobiledocKitUtilsKey.MODIFIERS.CTRL]);

    assert.equal(editorElement.textContent, 'abc', 'no TAB is inserted');
  });

  test('can unregister all handlers', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('');
    // there are 3 default helpers
    assert.equal(editor._eventManager._textInputHandler._handlers.length, 3);
    editor.onTextInput({
      name: 'first',
      match: /abc\t/,
      run: function run() {}
    });
    editor.onTextInput({
      name: 'second',
      match: /abc\t/,
      run: function run() {}
    });
    assert.equal(editor._eventManager._textInputHandler._handlers.length, 5);
    editor.unregisterAllTextInputHandlers();
    assert.equal(editor._eventManager._textInputHandler._handlers.length, 0);
  });

  test('can unregister handler by name', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('');
    var handlerName = 'ul';
    var handlers = editor._eventManager._textInputHandler._handlers;
    assert.ok(handlers.filter(function (handler) {
      return handler.name === handlerName;
    }).length);
    editor.unregisterTextInputHandler(handlerName);
    assert.notOk(handlers.filter(function (handler) {
      return handler.name === handlerName;
    }).length);
  });

  test('can unregister handlers by duplicate name', function (assert) {
    editor = _testHelpers['default'].editor.buildFromText('');
    var handlerName = 'ul';
    editor.onTextInput({
      name: handlerName,
      match: /abc/,
      run: function run() {}
    });
    var handlers = editor._eventManager._textInputHandler._handlers;
    assert.equal(handlers.length, 4); // 3 default + 1 custom handlers
    editor.unregisterTextInputHandler(handlerName);
    assert.equal(handlers.length, 2);
    assert.notOk(handlers.filter(function (handler) {
      return handler.name === handlerName;
    }).length);
  });
});
define('tests/acceptance/editor-key-commands-test', ['exports', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/keycodes', '../test-helpers', 'mobiledoc-kit/utils/browser', 'mobiledoc-kit/editor/ui'], function (exports, _mobiledocKitUtilsKey, _mobiledocKitUtilsKeycodes, _testHelpers, _mobiledocKitUtilsBrowser, _mobiledocKitEditorUi) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;
  var skip = _testHelpers['default'].skip;

  var editor = undefined,
      editorElement = undefined;

  function labelForModifier(key) {
    switch (key) {
      case _mobiledocKitUtilsKey.MODIFIERS.META:
        return 'META';
      case _mobiledocKitUtilsKey.MODIFIERS.CTRL:
        return 'CTRL';
    }
  }

  _module('Acceptance: Editor: Key Commands', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  function testStatefulCommand(_ref) {
    var modifierName = _ref.modifierName;
    var key = _ref.key;
    var command = _ref.command;
    var markupName = _ref.markupName;

    test(command + ' applies markup ' + markupName + ' to highlighted text', function (assert) {
      assert.expect(3);
      var done = assert.async();

      var modifier = _mobiledocKitUtilsKey.MODIFIERS[modifierName];
      var modifierKeyCode = _mobiledocKitUtilsKeycodes['default'][modifierName];
      var initialText = 'something';
      editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref2) {
        var post = _ref2.post;
        var markupSection = _ref2.markupSection;
        var marker = _ref2.marker;
        return post([markupSection('p', [marker(initialText)])]);
      });

      assert.ok(editor.hasCursor(), 'precond - editor should have cursor');

      assert.hasNoElement('#editor ' + markupName, 'precond - no ' + markupName + ' text');
      _testHelpers['default'].dom.selectText(editor, initialText, editorElement);
      _testHelpers['default'].dom.triggerKeyCommand(editor, key, modifier);
      _testHelpers['default'].dom.triggerKeyEvent(editor, 'keyup', { charCode: 0, keyCode: modifierKeyCode });

      _testHelpers['default'].wait(function () {
        assert.hasElement('#editor ' + markupName + ':contains(' + initialText + ')', 'text wrapped in ' + markupName);
        done();
      });
    });

    test(command + ' toggles ' + markupName + ' for next entered text', function (assert) {
      var done = assert.async();
      assert.expect(8);

      var modifier = _mobiledocKitUtilsKey.MODIFIERS[modifierName];
      var modifierKeyCode = _mobiledocKitUtilsKeycodes['default'][modifierName];
      var initialText = 'something';

      editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref3) {
        var post = _ref3.post;
        var markupSection = _ref3.markupSection;
        var marker = _ref3.marker;
        return post([markupSection('p', [marker(initialText)])]);
      });

      assert.ok(editor.hasCursor(), 'has cursor');

      assert.hasNoElement('#editor ' + markupName, 'precond - no ' + markupName + ' text');
      _testHelpers['default'].dom.moveCursorTo(editor, editor.post.sections.head.markers.head.renderNode.element, initialText.length);

      _testHelpers['default'].wait(function () {
        _testHelpers['default'].dom.triggerKeyCommand(editor, key, modifier);
        // simulate meta/ctrl keyup
        _testHelpers['default'].dom.triggerKeyEvent(editor, 'keyup', { charCode: 0, keyCode: modifierKeyCode });

        _testHelpers['default'].wait(function () {
          _testHelpers['default'].dom.insertText(editor, 'z');

          var expected1 = _testHelpers['default'].postAbstract.build(function (_ref4) {
            var post = _ref4.post;
            var markupSection = _ref4.markupSection;
            var marker = _ref4.marker;
            var markup = _ref4.markup;

            return post([markupSection('p', [marker(initialText), marker('z', [markup(markupName)])])]);
          });
          var expected2 = _testHelpers['default'].postAbstract.build(function (_ref5) {
            var post = _ref5.post;
            var markupSection = _ref5.markupSection;
            var marker = _ref5.marker;
            var markup = _ref5.markup;

            return post([markupSection('p', [marker(initialText), marker('z', [markup(markupName)]), marker('x')])]);
          });

          assert.postIsSimilar(editor.post, expected1);
          assert.renderTreeIsEqual(editor._renderTree, expected1);
          assert.positionIsEqual(editor.range.head, editor.post.tailPosition());

          _testHelpers['default'].wait(function () {
            // un-toggles markup
            _testHelpers['default'].dom.triggerKeyCommand(editor, key, modifier);
            _testHelpers['default'].dom.triggerKeyEvent(editor, 'keyup', { charCode: 0, keyCode: modifierKeyCode });

            _testHelpers['default'].wait(function () {
              _testHelpers['default'].dom.insertText(editor, 'x');

              assert.postIsSimilar(editor.post, expected2);
              assert.renderTreeIsEqual(editor._renderTree, expected2);
              assert.positionIsEqual(editor.range.head, editor.post.tailPosition());

              done();
            });
          });
        });
      });
    });
  }

  testStatefulCommand({
    modifierName: 'META',
    key: 'B',
    command: 'command-B',
    markupName: 'strong'
  });

  testStatefulCommand({
    modifierName: 'CTRL',
    key: 'B',
    command: 'ctrl-B',
    markupName: 'strong'
  });

  testStatefulCommand({
    modifierName: 'META',
    key: 'I',
    command: 'command-I',
    markupName: 'em'
  });

  testStatefulCommand({
    modifierName: 'CTRL',
    key: 'I',
    command: 'ctrl-I',
    markupName: 'em'
  });

  testStatefulCommand({
    modifierName: 'META',
    key: 'U',
    command: 'command-U',
    markupName: 'u'
  });

  testStatefulCommand({
    modifierName: 'CTRL',
    key: 'U',
    command: 'ctrl-U',
    markupName: 'u'
  });

  if (_mobiledocKitUtilsBrowser['default'].isMac()) {
    test('[Mac] ctrl-k clears to the end of a line', function (assert) {
      var initialText = 'something';
      editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref6) {
        var post = _ref6.post;
        var markupSection = _ref6.markupSection;
        var marker = _ref6.marker;
        return post([markupSection('p', [marker(initialText)])]);
      });

      assert.ok(editor.hasCursor(), 'has cursor');

      var textElement = editor.post.sections.head.markers.head.renderNode.element;
      _testHelpers['default'].dom.moveCursorTo(editor, textElement, 4);
      _testHelpers['default'].dom.triggerKeyCommand(editor, 'K', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

      var changedMobiledoc = editor.serialize();
      var expectedMobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref7) {
        var post = _ref7.post;
        var markupSection = _ref7.markupSection;
        var marker = _ref7.marker;

        return post([markupSection('p', [marker('some')])]);
      });
      assert.deepEqual(changedMobiledoc, expectedMobiledoc, 'mobiledoc updated appropriately');
    });

    test('[Mac] ctrl-k clears selected text', function (assert) {
      var initialText = 'something';
      editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref8) {
        var post = _ref8.post;
        var markupSection = _ref8.markupSection;
        var marker = _ref8.marker;
        return post([markupSection('p', [marker(initialText)])]);
      });

      assert.ok(editor.hasCursor(), 'has cursor');

      var textElement = editor.post.sections.head.markers.head.renderNode.element;
      _testHelpers['default'].dom.moveCursorTo(editor, textElement, 4, textElement, 8);
      _testHelpers['default'].dom.triggerKeyCommand(editor, 'K', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

      var changedMobiledoc = editor.serialize();
      var expectedMobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref9) {
        var post = _ref9.post;
        var markupSection = _ref9.markupSection;
        var marker = _ref9.marker;

        return post([markupSection('p', [marker('someg')])]);
      });
      assert.deepEqual(changedMobiledoc, expectedMobiledoc, 'mobiledoc updated appropriately');
    });
  }

  var toggleLinkTest = function toggleLinkTest(assert, modifier) {
    assert.expect(3);

    var url = 'http://bustle.com';
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    editor.registerKeyCommand({
      str: labelForModifier(modifier) + '+K',
      run: function run(editor) {
        (0, _mobiledocKitEditorUi.toggleLink)(editor, function (prompt, defaultUrl, callback) {
          assert.ok(true, 'calls showPrompt');
          callback(url);
        });
      }
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    _testHelpers['default'].dom.selectText(editor, 'something', editorElement);
    _testHelpers['default'].dom.triggerKeyCommand(editor, 'K', modifier);

    assert.hasElement('#editor a[href="' + url + '"]:contains(something)');
  };

  var toggleLinkUnlinkTest = function toggleLinkUnlinkTest(assert, modifier) {
    assert.expect(4);

    var url = 'http://bustle.com';
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;
      var markup = _ref11.markup;
      return post([markupSection('p', [marker('something', [markup('a', { href: url })])])]);
    });

    editor.registerKeyCommand({
      str: labelForModifier(modifier) + '+K',
      run: function run(editor) {
        (0, _mobiledocKitEditorUi.toggleLink)(editor, function (prompt, defaultUrl, callback) {
          assert.ok(false, 'should not call showPrompt');
          callback(url);
        });
      }
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    assert.hasElement('#editor a[href="' + url + '"]:contains(something)', 'precond -- has link');

    _testHelpers['default'].dom.selectText(editor, 'something', editorElement);
    _testHelpers['default'].dom.triggerKeyCommand(editor, 'K', modifier);

    assert.hasNoElement('#editor a[href="' + url + '"]:contains(something)', 'removes linked text');
    assert.hasElement('#editor p:contains(something)', 'unlinked text remains');
  };

  var toggleTests = [{
    precondition: function precondition() {
      return _mobiledocKitUtilsBrowser['default'].isMac();
    },
    msg: '[Mac] cmd-k links selected text',
    testFn: toggleLinkTest,
    modifier: _mobiledocKitUtilsKey.MODIFIERS.META
  }, {
    precondition: function precondition() {
      return _mobiledocKitUtilsBrowser['default'].isMac();
    },
    msg: '[Mac] cmd-k unlinks selected text if it was already linked',
    testFn: toggleLinkUnlinkTest,
    modifier: _mobiledocKitUtilsKey.MODIFIERS.META
  }, {
    precondition: function precondition() {
      return _mobiledocKitUtilsBrowser['default'].isWin();
    },
    msg: '[Windows] ctrl-k links selected text',
    testFn: toggleLinkTest,
    modifier: _mobiledocKitUtilsKey.MODIFIERS.CTRL
  }, {
    precondition: function precondition() {
      return _mobiledocKitUtilsBrowser['default'].isWin();
    },
    msg: '[Windows] ctrl-k unlinks selected text if it was already linked',
    testFn: toggleLinkUnlinkTest,
    modifier: _mobiledocKitUtilsKey.MODIFIERS.CTRL
  }];

  toggleTests.forEach(function (_ref12) {
    var precondition = _ref12.precondition;
    var msg = _ref12.msg;
    var testFn = _ref12.testFn;
    var modifier = _ref12.modifier;

    if (!precondition()) {
      skip(msg);
    } else {
      test(msg, function (assert) {
        testFn(assert, modifier);
      });
    }
  });

  test('new key commands can be registered', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref13) {
      var post = _ref13.post;
      var markupSection = _ref13.markupSection;
      var marker = _ref13.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    var passedEditor = undefined;
    editor.registerKeyCommand({
      str: 'ctrl+x',
      run: function run(editor) {
        passedEditor = editor;
      }
    });

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'Y', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'X', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
  });

  test('new key commands can be registered without modifiers', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref14) {
      var post = _ref14.post;
      var markupSection = _ref14.markupSection;
      var marker = _ref14.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    var passedEditor = undefined;
    editor.registerKeyCommand({
      str: 'X',
      run: function run(editor) {
        passedEditor = editor;
      }
    });

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'Y', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(!passedEditor, 'incorrect key combo does not trigger key command');

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'X', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(!passedEditor, 'key with modifier combo does not trigger key command');

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'X');

    assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
  });

  test('duplicate key commands can be registered with the last registered winning', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref15) {
      var post = _ref15.post;
      var markupSection = _ref15.markupSection;
      var marker = _ref15.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    var firstCommandRan = undefined,
        secondCommandRan = undefined;

    editor.registerKeyCommand({
      str: 'ctrl+x',
      run: function run() {
        firstCommandRan = true;
      }
    });
    editor.registerKeyCommand({
      str: 'ctrl+x',
      run: function run() {
        secondCommandRan = true;
      }
    });

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'X', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(!firstCommandRan, 'first registered method not called');
    assert.ok(!!secondCommandRan, 'last registered method is called');
  });

  test('returning false from key command causes next match to run', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref16) {
      var post = _ref16.post;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    var firstCommandRan = undefined,
        secondCommandRan = undefined;

    editor.registerKeyCommand({
      str: 'ctrl+x',
      run: function run() {
        firstCommandRan = true;
      }
    });
    editor.registerKeyCommand({
      str: 'ctrl+x',
      run: function run() {
        secondCommandRan = true;
        return false;
      }
    });

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'X', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(!!secondCommandRan, 'last registered method is called');
    assert.ok(!!firstCommandRan, 'first registered method is called');
  });

  test('key commands can override built-in functionality', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var marker = _ref17.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    var passedEditor = undefined;
    editor.registerKeyCommand({
      str: 'enter',
      run: function run(editor) {
        passedEditor = editor;
      }
    });

    assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');

    assert.equal($('#editor p').length, 1, 'still has just one paragraph');
  });

  test('returning false from key command still runs built-in functionality', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref18) {
      var post = _ref18.post;
      var markupSection = _ref18.markupSection;
      var marker = _ref18.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    assert.ok(editor.hasCursor(), 'has cursor');

    var passedEditor = undefined;
    editor.registerKeyCommand({
      str: 'enter',
      run: function run(editor) {
        passedEditor = editor;
        return false;
      }
    });

    assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');

    assert.equal($('#editor p').length, 2, 'has added a new paragraph');
  });

  test('new key commands can be registered and then unregistered', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref19) {
      var post = _ref19.post;
      var markupSection = _ref19.markupSection;
      var marker = _ref19.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    assert.ok(editor.hasCursor(), 'has cursor');
    var passedEditorCount = 0;
    var passedEditor = undefined;
    editor.registerKeyCommand({
      name: 'cut',
      str: 'ctrl+x',
      run: function run(editor) {
        passedEditor = editor;passedEditorCount++;
      }
    });

    editor.registerKeyCommand({
      name: 'cut',
      str: 'ctrl+d',
      run: function run(editor) {
        passedEditor = editor;passedEditorCount++;
      }
    });

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'x', _mobiledocKitUtilsKey.MODIFIERS.CTRL);
    _testHelpers['default'].dom.triggerKeyCommand(editor, 'd', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(!!passedEditor && passedEditor === editor, 'run method is called');
    assert.ok(passedEditorCount === 2, 'the passedEditor has been called twice');

    editor.unregisterKeyCommands('cut');

    _testHelpers['default'].dom.triggerKeyCommand(editor, 'x', _mobiledocKitUtilsKey.MODIFIERS.CTRL);
    _testHelpers['default'].dom.triggerKeyCommand(editor, 'd', _mobiledocKitUtilsKey.MODIFIERS.CTRL);

    assert.ok(passedEditorCount === 2, 'the passedEditor has still only been called twice');
  });
});
define('tests/acceptance/editor-list-test', ['exports', 'mobiledoc-kit', '../test-helpers'], function (exports, _mobiledocKit, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  function listMobileDoc() {
    return _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var listSection = _ref.listSection;
      var listItem = _ref.listItem;
      var marker = _ref.marker;
      return post([listSection('ul', [listItem([marker('first item')]), listItem([marker('second item')])])]);
    });
  }

  function createEditorWithMobiledoc(mobiledoc) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);
  }

  function createEditorWithListMobiledoc() {
    createEditorWithMobiledoc(listMobileDoc());
  }

  _module('Acceptance: Editor: Lists', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('can type in middle of a list item', function (assert) {
    createEditorWithListMobiledoc();

    var listItem = $('#editor li:contains(first item)')[0];
    assert.ok(!!listItem, 'precond - has li');

    _testHelpers['default'].dom.moveCursorTo(editor, listItem.childNodes[0], 'first'.length);
    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(firstX item)', 'inserts text at right spot');
  });

  test('can type at end of a list item', function (assert) {
    createEditorWithListMobiledoc();

    var listItem = $('#editor li:contains(first item)')[0];
    assert.ok(!!listItem, 'precond - has li');

    _testHelpers['default'].dom.moveCursorTo(editor, listItem.childNodes[0], 'first item'.length);
    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(first itemX)', 'inserts text at right spot');
  });

  test('can type at start of a list item', function (assert) {
    createEditorWithListMobiledoc();

    var listItem = $('#editor li:contains(first item)')[0];
    assert.ok(!!listItem, 'precond - has li');

    _testHelpers['default'].dom.moveCursorTo(editor, listItem.childNodes[0], 0);
    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(Xfirst item)', 'inserts text at right spot');
  });

  test('can delete selection across list items', function (assert) {
    createEditorWithListMobiledoc();

    var listItem = $('#editor li:contains(first item)')[0];
    assert.ok(!!listItem, 'precond - has li1');

    var listItem2 = $('#editor li:contains(second item)')[0];
    assert.ok(!!listItem2, 'precond - has li2');

    _testHelpers['default'].dom.selectText(editor, ' item', listItem, 'secon', listItem2);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor li:contains(d item)', 'results in correct text');
    assert.equal($('#editor li').length, 1, 'only 1 remaining li');
  });

  test('can exit list section altogether by deleting', function (assert) {
    createEditorWithListMobiledoc();

    var listItem2 = $('#editor li:contains(second item)')[0];
    assert.ok(!!listItem2, 'precond - has listItem2');

    _testHelpers['default'].dom.moveCursorTo(editor, listItem2.childNodes[0], 0);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor li:contains(first item)', 'still has first item');
    assert.hasNoElement('#editor li:contains(second item)', 'second li is gone');
    assert.hasElement('#editor p:contains(second item)', 'second li becomes p');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor p:contains(Xsecond item)', 'new text is in right spot');
  });

  test('can split list item with <enter>', function (assert) {
    createEditorWithListMobiledoc();

    var li = $('#editor li:contains(first item)')[0];
    assert.ok(!!li, 'precond');

    _testHelpers['default'].dom.moveCursorTo(editor, li.childNodes[0], 'fir'.length);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.hasNoElement('#editor li:contains(first item)', 'first item is split');
    assert.hasElement('#editor li:contains(fir)', 'has split "fir" li');
    assert.hasElement('#editor li:contains(st item)', 'has split "st item" li');
    assert.hasElement('#editor li:contains(second item)', 'has unchanged last li');
    assert.equal($('#editor li').length, 3, 'has 3 lis');

    // hitting enter can create the right DOM but put the AT out of sync with the
    // renderTree, so we must hit enter once more to fully test this

    li = $('#editor li:contains(fir)')[0];
    assert.ok(!!li, 'precond - has "fir"');
    _testHelpers['default'].dom.moveCursorTo(editor, li.childNodes[0], 'fi'.length);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.hasNoElement('#editor li:contains(fir)');
    assert.hasElement('#editor li:contains(fi)', 'has split "fi" li');
    assert.hasElement('#editor li:contains(r)', 'has split "r" li');
    assert.equal($('#editor li').length, 4, 'has 4 lis');
  });

  test('can hit enter at end of list item to add new item', function (assert) {
    var done = assert.async();
    createEditorWithListMobiledoc();

    var li = $('#editor li:contains(first item)')[0];
    assert.ok(!!li, 'precond');

    _testHelpers['default'].dom.moveCursorTo(editor, li.childNodes[0], 'first item'.length);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor li').length, 3, 'adds a new li');
    var newLi = $('#editor li:eq(1)');
    assert.equal(newLi.text(), '', 'new li has no text');

    _testHelpers['default'].dom.insertText(editor, 'X');
    _testHelpers['default'].wait(function () {
      assert.hasElement('#editor li:contains(X)', 'text goes in right spot');

      var liCount = $('#editor li').length;
      _testHelpers['default'].dom.triggerEnter(editor);
      _testHelpers['default'].dom.triggerEnter(editor);

      assert.equal($('#editor li').length, liCount + 2, 'adds two new empty list items');
      done();
    });
  });

  test('hitting enter to add list item, deleting to remove it, adding new list item, exiting list and typing', function (assert) {
    createEditorWithListMobiledoc();

    var li = $('#editor li:contains(first item)')[0];
    assert.ok(!!li, 'precond');

    _testHelpers['default'].dom.moveCursorTo(editor, li.childNodes[0], 'first item'.length);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor li').length, 3, 'adds a new li');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor li').length, 2, 'removes middle, empty li after delete');
    assert.equal($('#editor p').length, 1, 'adds a new paragraph section where delete happened');

    li = $('#editor li:contains(first item)')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, li.childNodes[0], 'first item'.length);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor li').length, 3, 'adds a new li after enter again');

    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor li').length, 2, 'removes newly added li after enter on last list item');
    assert.equal($('#editor p').length, 2, 'adds a second p section');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor p:eq(0):contains(X)', 'inserts text in right spot');
  });

  test('hitting enter at empty last list item exists list', function (assert) {
    createEditorWithListMobiledoc();

    assert.equal($('#editor p').length, 0, 'precond - no ps');

    var li = $('#editor li:contains(second item)')[0];
    assert.ok(!!li, 'precond');

    _testHelpers['default'].dom.moveCursorTo(editor, li.childNodes[0], 'second item'.length);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor li').length, 3, 'precond - adds a third li');

    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor li').length, 2, 'removes empty li');
    assert.equal($('#editor p').length, 1, 'adds 1 new p');
    assert.equal($('#editor p').text(), '', 'p has no text');
    assert.hasNoElement('#editor ul p', 'does not nest p under ul');

    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor p:contains(X)', 'text goes in right spot');
  });

  // https://github.com/bustle/mobiledoc-kit/issues/117
  test('deleting at start of non-empty section after list item joins it with list item', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var markupSection = builder.markupSection;
      var marker = builder.marker;
      var listSection = builder.listSection;
      var listItem = builder.listItem;

      return post([listSection('ul', [listItem([marker('abc')])]), markupSection('p', [marker('def')])]);
    });
    createEditorWithMobiledoc(mobiledoc);

    var p = $('#editor p:contains(def)')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, p.childNodes[0], 0);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasNoElement('#editor p');
    assert.hasElement('#editor li:contains(abcdef)');
  });

  // https://github.com/bustle/mobiledoc-kit/issues/117
  test('deleting at start of empty section after list item joins it with list item', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var markupSection = builder.markupSection;
      var marker = builder.marker;
      var listSection = builder.listSection;
      var listItem = builder.listItem;

      return post([listSection('ul', [listItem([marker('abc')])]), markupSection('p')]);
    });
    createEditorWithMobiledoc(mobiledoc);

    assert.hasElement('#editor p br', 'precond - br');
    var node = $('#editor p br')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, node, 0);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasNoElement('#editor p', 'removes p');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(abcX)', 'inserts text at right spot');
  });

  test('forward-delete in empty list item with nothing after it does nothing', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var listSection = builder.listSection;
      var listItem = builder.listItem;

      return post([listSection('ul', [listItem()])]);
    });
    createEditorWithMobiledoc(mobiledoc);

    assert.hasElement('#editor li br', 'precond - br');
    var node = $('#editor li br')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, node, 0);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.hasElement('#editor li', 'li remains');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(X)', 'inserts text at right spot');
  });

  test('forward-delete in empty li with li after it joins with li', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var listSection = builder.listSection;
      var listItem = builder.listItem;
      var marker = builder.marker;

      return post([listSection('ul', [listItem(), listItem([marker('abc')])])]);
    });
    createEditorWithMobiledoc(mobiledoc);

    assert.equal($('#editor li').length, 2, 'precond - 2 lis');
    assert.hasElement('#editor li br', 'precond - br');
    var node = $('#editor li br')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, node, 0);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.equal($('#editor li').length, 1, '1 li remains');
    assert.hasElement('#editor li:contains(abc)', 'correct li remains');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(Xabc)', 'inserts text at right spot');
  });

  test('forward-delete in empty li with markup section after it joins markup section', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var listSection = builder.listSection;
      var listItem = builder.listItem;
      var markupSection = builder.markupSection;
      var marker = builder.marker;

      return post([listSection('ul', [listItem()]), markupSection('p', [marker('abc')])]);
    });
    createEditorWithMobiledoc(mobiledoc);

    assert.hasElement('#editor li br', 'precond - br');
    var node = $('#editor li br')[0];
    _testHelpers['default'].dom.moveCursorTo(editor, node, 0);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.hasElement('#editor li:contains(abc)', 'joins markup section');
    assert.hasNoElement('#editor p', 'p is removed');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor li:contains(Xabc)', 'inserts text at right spot');
  });

  test('forward-delete end of li with nothing after', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var listSection = builder.listSection;
      var listItem = builder.listItem;
      var marker = builder.marker;

      return post([listSection('ul', [listItem([marker('abc')])])]);
    });
    createEditorWithMobiledoc(mobiledoc);

    var node = $('#editor li')[0].childNodes[0];
    _testHelpers['default'].dom.moveCursorTo(editor, node, 'abc'.length);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.hasElement('#editor li:contains(abc)', 'li remains');
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor li:contains(abcX)', 'inserts text at right spot');
  });

  test('forward-delete end of li with li after', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var listSection = builder.listSection;
      var listItem = builder.listItem;
      var marker = builder.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')])])]);
    });
    createEditorWithMobiledoc(mobiledoc);

    assert.equal($('#editor li').length, 2, 'precond - 2 lis');
    var node = $('#editor li')[0].childNodes[0];
    _testHelpers['default'].dom.moveCursorTo(editor, node, 'abc'.length);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.hasElement('#editor li:contains(abcdef)', 'li is joined');
    assert.equal($('#editor li').length, 1, 'only 1 li');
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor li:contains(abcXdef)', 'inserts text at right spot');
  });

  test('forward-delete end of li with markup section after', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var listSection = builder.listSection;
      var listItem = builder.listItem;
      var marker = builder.marker;
      var markupSection = builder.markupSection;

      return post([listSection('ul', [listItem([marker('abc')])]), markupSection('p', [marker('def')])]);
    });
    createEditorWithMobiledoc(mobiledoc);

    var node = $('#editor li')[0].childNodes[0];
    _testHelpers['default'].dom.moveCursorTo(editor, node, 'abc'.length);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.hasElement('#editor li:contains(abcdef)', 'li is joined');
    assert.equal($('#editor li').length, 1, 'only 1 li');
    assert.hasNoElement('#editor p', 'p is removed');
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor li:contains(abcXdef)', 'inserts text at right spot');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/130
  test('selecting empty list items does not cause error', function (assert) {
    var done = assert.async();
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var listSection = builder.listSection;
      var listItem = builder.listItem;
      var marker = builder.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem(), listItem([marker('def')])])]);
    });

    createEditorWithMobiledoc(mobiledoc);

    assert.equal($('#editor li').length, 3, 'precond - 3 lis');
    _testHelpers['default'].dom.moveCursorTo(editor, $('#editor li:eq(1)')[0], 0, $('#editor li:eq(2)')[0], 0);
    _testHelpers['default'].dom.triggerEvent(editor.element, 'click');
    _testHelpers['default'].wait(function () {
      assert.ok(true, 'no error');

      _testHelpers['default'].dom.insertText(editor, 'X');
      assert.hasElement('#editor li:contains(Xdef)', 'insert text');
      assert.equal($('#editor li').length, 2, 'inserting text deletes selected li');
      done();
    });
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/128
  test('selecting list item and deleting leaves following section intact', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (builder) {
      var post = builder.post;
      var markupSection = builder.markupSection;
      var listSection = builder.listSection;
      var listItem = builder.listItem;
      var marker = builder.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem()]), markupSection('p', [marker('123')])]);
    });

    createEditorWithMobiledoc(mobiledoc);

    // precond
    assert.hasElement('#editor p:contains(123)');
    assert.hasElement('#editor li:contains(abc)');

    var liTextNode = $('#editor li:eq(0)')[0].childNodes[0];
    var emptyLiNode = $('#editor li:eq(1)')[0];
    assert.equal(liTextNode.textContent, 'abc'); // precond
    _testHelpers['default'].dom.moveCursorTo(editor, liTextNode, 0, emptyLiNode, 0);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor p', 'does not delete p');
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasNoElement('#editor li:contains(abc)', 'li text is removed');
    assert.hasElement('#editor li:contains(X)', 'text is inserted');
  });

  test('list sections may contain attributes', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var listSection = _ref2.listSection;
      var listItem = _ref2.listItem;
      var marker = _ref2.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem()], { 'data-md-text-align': 'center' })]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    assert.hasElement('#editor ul[data-md-text-align="center"]');
  });
});
define('tests/acceptance/editor-post-editor-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/utils/cursor/range'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitUtilsCursorRange) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  _module('Acceptance: Editor - PostEditor', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('#insertSectionAtEnd inserts the section at the end', function (assert) {
    var newSection = undefined;
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      newSection = markupSection('p', [marker('123')]);
      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    //precond
    assert.hasElement('#editor p:contains(abc)');
    assert.hasNoElement('#editor p:contains(123)');

    editor.run(function (postEditor) {
      return postEditor.insertSectionAtEnd(newSection);
    });
    assert.hasElement('#editor p:eq(1):contains(123)', 'new section added at end');
  });

  test('#insertSection inserts after the cursor active section', function (assert) {
    var newSection = undefined;
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      newSection = markupSection('p', [marker('123')]);
      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('def')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    //precond
    assert.hasElement('#editor p:eq(0):contains(abc)');
    assert.hasElement('#editor p:eq(1):contains(def)');
    assert.hasNoElement('#editor p:contains(123)');

    _testHelpers['default'].dom.selectText(editor, 'b', editorElement);

    editor.run(function (postEditor) {
      return postEditor.insertSection(newSection);
    });
    assert.hasElement('#editor p:eq(0):contains(abc)', 'still has 1st section');
    assert.hasElement('#editor p:eq(1):contains(123)', 'new section added after active section');
    assert.hasElement('#editor p:eq(2):contains(def)', '2nd section -> 3rd spot');
  });

  test('#insertSection inserts at end when no active cursor section', function (assert) {
    var newSection = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      newSection = markupSection('p', [marker('123')]);
      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('def')])]);
    }, { autofocus: false });

    //precond
    assert.ok(!editor.hasCursor(), 'editor has no cursor');
    assert.ok(editor.range.isBlank, 'editor has no cursor');
    assert.hasElement('#editor p:eq(0):contains(abc)');
    assert.hasElement('#editor p:eq(1):contains(def)');
    assert.hasNoElement('#editor p:contains(123)');

    _testHelpers['default'].dom.clearSelection();
    editor.run(function (postEditor) {
      return postEditor.insertSection(newSection);
    });
    assert.hasElement('#editor p:eq(0):contains(abc)', 'still has 1st section');
    assert.hasElement('#editor p:eq(2):contains(123)', 'new section added at end');
    assert.hasElement('#editor p:eq(1):contains(def)', '2nd section -> same spot');
  });

  test('#insertSection can insert card, render it in display mode', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    var displayedCard = undefined,
        editedCard = undefined;
    var cards = [{
      name: 'sample-card',
      type: 'dom',
      render: function render() {
        displayedCard = true;
      },
      edit: function edit() {
        editedCard = true;
      }
    }];

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    editor.run(function (postEditor) {
      var cardSection = postEditor.builder.createCardSection('sample-card');
      postEditor.insertSection(cardSection);
    });

    assert.ok(displayedCard, 'rendered card in display mode');
  });

  test('#insertSection inserts card, can render it in edit mode using #editCard', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    var displayedCard = undefined,
        editedCard = undefined;
    var cards = [{
      name: 'sample-card',
      type: 'dom',
      render: function render() {
        displayedCard = true;
      },
      edit: function edit() {
        editedCard = true;
      }
    }];

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    editor.run(function (postEditor) {
      var cardSection = postEditor.builder.createCardSection('sample-card');
      postEditor.insertSection(cardSection);
      editor.editCard(cardSection);
    });

    assert.ok(editedCard, 'rendered card in edit mode');
    assert.ok(!displayedCard, 'did not render in display mode');
  });

  test('after inserting a section, can use editor#editCard to switch it to edit mode', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref6) {
      var post = _ref6.post;
      var cardSection = _ref6.cardSection;

      return post([cardSection('sample-card')]);
    });

    var displayedCard = undefined,
        editedCard = undefined;
    var cards = [{
      name: 'sample-card',
      type: 'dom',
      render: function render() {
        displayedCard = true;
      },
      edit: function edit() {
        editedCard = true;
      }
    }];

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);
    assert.ok(displayedCard, 'called display#setup');
    assert.ok(!editedCard, 'did not call edit#setup yet');

    displayedCard = false;
    var card = editor.post.sections.head;
    editor.editCard(card);

    assert.ok(editedCard, 'called edit#setup');
    assert.ok(!displayedCard, 'did not call display#setup again');
  });

  test('can call editor#displayCard to switch card into display mode', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref7) {
      var post = _ref7.post;
      var cardSection = _ref7.cardSection;

      return post([cardSection('sample-card')]);
    });

    var displayedCard = undefined,
        editedCard = undefined;
    var cards = [{
      name: 'sample-card',
      type: 'dom',
      render: function render() {
        displayedCard = true;
      },
      edit: function edit() {
        editedCard = true;
      }
    }];

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    assert.ok(displayedCard, 'precond - called display#setup');
    assert.ok(!editedCard, 'precond - did not call edit#setup yet');

    displayedCard = false;
    var card = editor.post.sections.head;
    editor.editCard(card);

    assert.ok(!displayedCard, 'card not in display mode');
    assert.ok(editedCard, 'card in edit mode');

    editedCard = false;

    editor.displayCard(card);

    assert.ok(displayedCard, 'card back in display mode');
    assert.ok(!editedCard, 'card not in edit mode');
  });

  test('#toggleMarkup adds markup by tag name', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;

      return post([markupSection('p', [marker('abc'), marker('def')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    //precond
    assert.hasNoElement('#editor strong');

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement, 'd', editorElement);
    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });
    assert.hasElement('#editor strong:contains(bcd)');
  });

  test('#toggleMarkup removes markup by tag name', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;
      var markup = _ref9.markup;

      var strong = markup('strong');
      return post([markupSection('p', [marker('a'), marker('bcde', [strong]), marker('f')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    //precond
    assert.hasElement('#editor strong:contains(bcde)');

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement, 'd', editorElement);
    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });
    assert.hasNoElement('#editor strong:contains(bcd)', 'markup removed from selection');
    assert.hasElement('#editor strong:contains(e)', 'unselected text still bold');
  });

  test('#toggleMarkup does nothing with an empty selection', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;

      return post([markupSection('p', [marker('a')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });

    assert.hasNoElement('#editor strong', 'strong not added, nothing selected');
  });

  test('postEditor reads editor range, sets it with #setRange', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var _editor = editor;
    var post = _editor.post;

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement);
    var range = editor.range;
    var expectedRange = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 'a'.length, post.sections.head, 'abc'.length);
    assert.ok(range.isEqual(expectedRange), 'precond - editor.range is correct');

    var newRange = undefined;
    editor.run(function (postEditor) {
      newRange = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0, post.sections.head, 1);
      postEditor.setRange(newRange);
    });

    assert.ok(editor.range.isEqual(newRange), 'newRange is rendered after run');
  });

  test('markup sections may contain attributes', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref12) {
      var post = _ref12.post;
      var markupSection = _ref12.markupSection;
      var marker = _ref12.marker;

      return post([markupSection('p', [marker('123')], false, { 'data-md-text-align': 'center' })]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    assert.hasElement('#editor p[data-md-text-align="center"]');
  });
});
define('tests/acceptance/editor-reparse-test', ['exports', '../test-helpers', 'mobiledoc-kit/renderers/editor-dom'], function (exports, _testHelpers, _mobiledocKitRenderersEditorDom) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var simpleAtom = {
    name: 'simple-atom',
    type: 'dom',
    render: function render(_ref) {
      var value = _ref.value;

      var element = document.createElement('span');
      element.setAttribute('id', 'simple-atom');
      element.appendChild(document.createTextNode(value));
      return element;
    }
  };

  var editor = undefined,
      editorElement = undefined;
  var editorOptions = { atoms: [simpleAtom] };

  _module('Acceptance: Editor: Reparsing', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('changing text node content causes reparse of section', function (assert) {
    var done = assert.async();
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      expected = post([markupSection('p', [marker('def')])]);

      return post([markupSection('p', [marker('abc')])]);
    });

    var section = editor.post.sections.head;
    var node = section.markers.head.renderNode.element;

    assert.equal(node.textContent, 'abc', 'precond - correct text node');
    assert.equal(section.text, 'abc', 'precond - correct section');

    node.textContent = 'def';

    _testHelpers['default'].wait(function () {
      assert.equal(section.text, 'def', 'section reparsed correctly');
      assert.postIsSimilar(editor.post, expected);
      done();
    });
  });

  test('removing text node causes reparse of section', function (assert) {
    var done = assert.async();
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      expected = post([markupSection('p', [marker('def')])]);

      return post([markupSection('p', [marker('abc'), marker('def')])]);
    });

    var section = editor.post.sections.head;
    var node = section.markers.head.renderNode.element;

    assert.equal(node.textContent, 'abc', 'precond - correct text node');
    assert.equal(section.text, 'abcdef', 'precond - correct section');

    node.parentNode.removeChild(node);

    _testHelpers['default'].wait(function () {
      assert.equal(section.text, 'def', 'section reparsed correctly');
      assert.postIsSimilar(editor.post, expected);
      done();
    });
  });

  test('removing section node causes reparse of post', function (assert) {
    var done = assert.async();
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      expected = post([markupSection('p', [marker('123')])]);

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('123')])]);
    });

    var node = editor.post.sections.head.renderNode.element;
    assert.equal(node.innerHTML, 'abc', 'precond - correct node');

    node.parentNode.removeChild(node);

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      done();
    });
  });

  test('inserting styled span in section causes section reparse', function (assert) {
    var done = assert.async();
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;

      expected = post([markupSection('p', [marker('abc'), marker('def')])]);

      return post([markupSection('p', [marker('abc')])]);
    });

    var node = editor.post.sections.head.renderNode.element;
    assert.equal(node.innerHTML, 'abc', 'precond - correct node');

    var span = document.createElement('span');
    span.setAttribute('style', 'font-size: 24px; font-color: blue');
    span.appendChild(document.createTextNode('def'));
    node.appendChild(span);

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      done();
    });
  });

  test('inserting new top-level node causes reparse of post', function (assert) {
    var done = assert.async();
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;

      expected = post([markupSection('p', [marker('abc')]), markupSection('p', [marker('123')])]);

      return post([markupSection('p', [marker('abc')])]);
    });

    var span = document.createElement('span');
    span.appendChild(document.createTextNode('123'));
    editorElement.appendChild(span);

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      done();
    });
  });

  test('inserting node into blank post causes reparse', function (assert) {
    var done = assert.async();
    var expected = undefined;

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      expected = post([markupSection('p', [marker('123')])]);
      return post();
    });

    var span = document.createElement('span');
    span.appendChild(document.createTextNode('123'));
    editorElement.appendChild(span);

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      done();
    });
  });

  test('after reparsing post, mutations still handled properly', function (assert) {
    var done = assert.async();
    var expected1 = undefined,
        expected2 = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;

      expected1 = post([markupSection('p', [marker('abc')]), markupSection('p', [marker('123')])]);

      expected2 = post([markupSection('p', [marker('def')]), markupSection('p', [marker('123')])]);

      return post([markupSection('p', [marker('abc')])]);
    });

    var span = document.createElement('span');
    span.appendChild(document.createTextNode('123'));
    editorElement.appendChild(span);

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected1);

      var node = editorElement.firstChild.firstChild;
      assert.equal(node.textContent, 'abc', 'precond - correct node');

      node.textContent = 'def';

      _testHelpers['default'].wait(function () {
        assert.postIsSimilar(editor.post, expected2);

        done();
      });
    });
  });

  test('inserting text into text node on left/right of atom is reparsed correctly', function (assert) {
    var done = assert.async();
    var expected1 = undefined,
        expected2 = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;
      var atom = _ref9.atom;

      expected1 = post([markupSection('p', [atom('simple-atom', 'first'), marker('Z')])]);

      expected2 = post([markupSection('p', [marker('A'), atom('simple-atom', 'first'), marker('Z')])]);

      return post([markupSection('p', [atom('simple-atom', 'first')])]);
    }, editorOptions);

    var atom = editor.post.sections.head.markers.head;
    var rightCursorNode = atom.renderNode.tailTextNode;

    assert.ok(rightCursorNode && rightCursorNode.textContent === _mobiledocKitRenderersEditorDom.ZWNJ, 'precond - correct right cursor node');

    rightCursorNode.textContent = 'Z';
    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected1);
      assert.renderTreeIsEqual(editor._renderTree, expected1);

      var leftCursorNode = atom.renderNode.headTextNode;
      assert.ok(leftCursorNode && leftCursorNode.textContent === _mobiledocKitRenderersEditorDom.ZWNJ, 'precond - correct left cursor node');
      leftCursorNode.textContent = 'A';

      _testHelpers['default'].wait(function () {
        assert.postIsSimilar(editor.post, expected2);
        assert.renderTreeIsEqual(editor._renderTree, expected2);

        done();
      });
    });
  });

  test('mutation inside card element does not cause reparse', function (assert) {
    var done = assert.async();
    var parseCount = 0;
    var myCard = {
      name: 'my-card',
      type: 'dom',
      render: function render() {
        return document.createTextNode('howdy');
      }
    };

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref10) {
      var post = _ref10.post;
      var cardSection = _ref10.cardSection;

      return post([cardSection('my-card', {})]);
    }, {
      cards: [myCard]
    });

    editor.didUpdatePost(function () {
      parseCount++;
    });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'howdy');
    textNode.textContent = 'adios';

    // Allow the mutation observer to fire then...
    _testHelpers['default'].wait(function () {
      assert.equal(0, parseCount);
      done();
    });
  });
});
define('tests/acceptance/editor-sections-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/keycodes', 'mobiledoc-kit/utils/browser', 'mobiledoc-kit/utils/key'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitRenderersMobiledoc02, _mobiledocKitRenderersEditorDom, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsKeycodes, _mobiledocKitUtilsBrowser, _mobiledocKitUtilsKey) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var editor = undefined,
      editorElement = undefined;
  var mobileDocWith1Section = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[], [[1, "P", [[[], 0, "only section"]]]]]
  };
  var mobileDocWith2Sections = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[], [[1, "P", [[[], 0, "first section"]]], [1, "P", [[[], 0, "second section"]]]]]
  };
  var mobileDocWith3Sections = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[], [[1, "P", [[[], 0, "first section"]]], [1, "P", [[[], 0, "second section"]]], [1, "P", [[[], 0, "third section"]]]]]
  };

  var mobileDocWith2Markers = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[['b']], [[1, "P", [[[0], 1, "bold"], [[], 0, "plain"]]]]]
  };

  var mobileDocWith1Character = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[], [[1, "P", [[[], 0, "c"]]]]]
  };

  var mobileDocWithNoCharacter = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[], [[1, "P", [[[], 0, ""]]]]]
  };

  _module('Acceptance: Editor sections', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('typing enter inserts new section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith1Section });
    editor.render(editorElement);
    assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 5);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');
    assert.hasElement('#editor p:contains(only)', 'has correct first pargraph text');
    assert.hasElement('#editor p:contains(section)', 'has correct second paragraph text');
  });

  test('typing enter inserts new section from blank section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWithNoCharacter });
    editor.render(editorElement);
    assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 0);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');
  });

  test('hitting enter in first section splits it correctly', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);
    assert.equal($('#editor p').length, 2, 'precond - has 2 paragraphs');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 3);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 3, 'has 3 paragraphs after typing return');

    assert.equal($('#editor p:eq(0)').text(), 'fir', 'first para has correct text');
    assert.equal($('#editor p:eq(1)').text(), 'st section', 'second para has correct text');
    assert.equal($('#editor p:eq(2)').text(), 'second section', 'third para still has correct text');

    assert.deepEqual(_testHelpers['default'].dom.getCursorPosition(), { node: editorElement.childNodes[1].childNodes[0],
      offset: 0 });
  });

  test('hitting enter at start of a section creates empty section where cursor was', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith1Section });
    editor.render(editorElement);
    assert.equal($('#editor p').length, 1, 'has 1 paragraph to start');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 0);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');

    var firstP = $('#editor p:eq(0)');
    assert.equal(firstP.text(), '', 'first para has no text');
    assert.hasElement('#editor p:eq(1):contains(only section)', 'has correct second paragraph text');

    assert.deepEqual(_testHelpers['default'].dom.getCursorPosition(), { node: editorElement.childNodes[1].childNodes[0],
      offset: 0 });
  });

  test('hitting enter at end of a section creates new empty section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith1Section });
    editor.render(editorElement);
    assert.equal($('#editor p').length, 1, 'has 1 section to start');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 'only section'.length);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 2, 'has 2 sections after typing return');
    assert.hasElement('#editor p:eq(0):contains(only section)', 'has same first section text');
    assert.hasElement('#editor p:eq(1):contains()', 'second section has no text');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor p:eq(1):contains(X)', 'text is inserted in the new section');
  });

  test('hitting enter in a section creates a new basic section', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      return post([markupSection('h2', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);
    assert.hasElement('#editor h2:contains(abc)', 'precond - h2 is there');
    assert.hasNoElement('#editor p', 'precond - no p tag');

    _testHelpers['default'].dom.moveCursorTo(editor, $('#editor h2')[0].childNodes[0], 'abc'.length);
    _testHelpers['default'].dom.triggerEnter(editor);
    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor h2:contains(abc)', 'h2 still there');
    assert.hasElement('#editor p:contains(X)', 'p tag instead of h2 generated');
  });

  test('deleting across 2 sections does nothing if editing is disabled', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);
    editor.disableEditing();
    assert.equal($('#editor p').length, 2, 'precond - has 2 sections to start');

    var p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0];

    _testHelpers['default'].dom.selectText(editor, 'tion', p0, 'sec', p1);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p').length, 2, 'still has 2 sections');
  });

  test('deleting across 2 sections merges them', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);
    assert.equal($('#editor p').length, 2, 'precond - has 2 sections to start');

    var p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0];

    _testHelpers['default'].dom.selectText(editor, 'tion', p0, 'sec', p1);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p').length, 1, 'has only 1 paragraph after deletion');
    assert.hasElement('#editor p:contains(first second section)', 'remaining paragraph has correct text');
  });

  test('deleting across 1 section removes it, joins the 2 boundary sections', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith3Sections });
    editor.render(editorElement);
    assert.equal($('#editor p').length, 3, 'precond - has 3 paragraphs to start');

    var p0 = $('#editor p:eq(0)')[0],
        p1 = $('#editor p:eq(1)')[0],
        p2 = $('#editor p:eq(2)')[0];
    assert.ok(p0 && p1 && p2, 'precond - paragraphs exist');

    _testHelpers['default'].dom.selectText(editor, 'section', p0, 'third ', p2);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p').length, 1, 'has only 1 paragraph after deletion');
    assert.hasElement('#editor p:contains(first section)', 'remaining paragraph has correct text');
  });

  test('failing to delete will not trigger deleting hooks', function (assert) {
    assert.expect(0);
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.willDelete(function () {
      assert.ok(false, 'willDelete should not be triggered');
    });
    editor.didDelete(function () {
      assert.ok(false, 'didDelete should not be triggered');
    });

    editor.render(editorElement);
    editor.disableEditing();
    _testHelpers['default'].dom.triggerDelete(editor);
  });

  test('deleting chracter triggers deleting hooks', function (assert) {
    assert.expect(9);
    var lifeCycles = [];

    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.willDelete(function (range, direction, unit) {
      assert.ok(range, 'range is not empty');
      assert.equal(direction, -1, 'direction defaults to -1');
      assert.equal(unit, 'char', 'unit defaults to char');
      assert.ok(true, 'willDelete is triggered');
      lifeCycles.push('willDelete');
    });
    editor.didDelete(function (range, direction, unit) {
      assert.ok(range, 'range is not empty');
      assert.equal(direction, -1, 'direction defaults to -1');
      assert.equal(unit, 'char', 'unit defaults to char');
      assert.ok(true, 'didDelete is triggered');
      lifeCycles.push('didDelete');
    });
    editor.render(editorElement);

    _testHelpers['default'].dom.triggerDelete(editor);
    assert.deepEqual(lifeCycles, ['willDelete', 'didDelete'], 'hooks are triggered in order');
  });

  test('keystroke of delete removes that character', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith3Sections });
    editor.render(editorElement);
    var getFirstTextNode = function getFirstTextNode() {
      return editor.element.firstChild. // section
      firstChild; // marker
    };
    var textNode = getFirstTextNode();
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 1);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p:eq(0)').html(), 'irst section', 'deletes first character');

    var newTextNode = getFirstTextNode();
    assert.deepEqual(_testHelpers['default'].dom.getCursorPosition(), { node: newTextNode, offset: 0 }, 'cursor is at start of new text node');
  });

  test('keystroke of delete removes emoji character', function (assert) {
    var monkey = 'monkey🙈';
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      return post([markupSection('p', [marker(monkey)])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);
    var textNode = editorElement.firstChild. // section
    firstChild; // marker
    assert.equal(textNode.textContent, monkey, 'precond - correct text');

    _testHelpers['default'].dom.moveCursorTo(editor, textNode, monkey.length);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p:eq(0)').text(), 'monkey', 'deletes the emoji');
  });

  test('keystroke of forward delete removes emoji character', function (assert) {
    var monkey = 'monkey🙈';
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      return post([markupSection('p', [marker(monkey)])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);
    var textNode = editorElement.firstChild. // section
    firstChild; // marker
    assert.equal(textNode.textContent, monkey, 'precond - correct text');

    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'monkey'.length);
    _testHelpers['default'].dom.triggerForwardDelete(editor);

    assert.equal($('#editor p:eq(0)').text(), 'monkey', 'deletes the emoji');
  });

  test('keystroke of delete when cursor is at beginning of marker removes character from previous marker', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Markers });
    editor.render(editorElement);
    var textNode = editor.element.firstChild. // section
    childNodes[1]; // plain marker

    assert.ok(!!textNode, 'gets text node');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 0);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p:eq(0)').html(), '<b>bol</b>plain', 'deletes last character of previous marker');

    var boldNode = editor.element.firstChild. // section
    firstChild; // bold marker
    var boldTextNode = boldNode.firstChild;

    assert.deepEqual(_testHelpers['default'].dom.getCursorPosition(), { node: boldTextNode, offset: 3 }, 'cursor moves to end of previous text node');
  });

  test('keystroke of delete when cursor is after only char in only marker of section removes character', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith1Character });
    editor.render(editorElement);
    var getTextNode = function getTextNode() {
      return editor.element.firstChild. // section
      firstChild;
    }; // c marker

    var textNode = getTextNode();
    assert.ok(!!textNode, 'gets text node');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 1);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor p:eq(0):contains()', 'first p is empty');

    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('#editor p:eq(0):contains(X)', 'text is added back to section');
  });

  test('keystroke of character in empty section adds character, moves cursor', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWithNoCharacter });
    editor.render(editorElement);

    assert.hasElement('#editor p br', 'precond - br tag rendered for empty section');
    var pNode = $('#editor p')[0];

    // Firefox requires that the cursor be placed explicitly for this test to pass
    _testHelpers['default'].dom.moveCursorTo(editor, pNode, 0);

    var letter = 'M';
    _testHelpers['default'].dom.insertText(editor, letter);

    assert.hasElement('#editor p:contains(' + letter + ')', 'adds char');

    var otherLetter = 'X';
    _testHelpers['default'].dom.insertText(editor, otherLetter);

    assert.hasElement('#editor p:contains(' + letter + otherLetter + ')', 'adds char in correct spot');
  });

  test('keystroke of delete at start of section joins with previous section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var secondSectionTextNode = editor.element.childNodes[1].firstChild;

    assert.equal(secondSectionTextNode.textContent, 'second section', 'precond - section section text node');

    _testHelpers['default'].dom.moveCursorTo(editor, secondSectionTextNode, 0);
    //editor.range = null;
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal(editor.element.childNodes.length, 1, 'only 1 section remaining');

    var secondSectionNode = editor.element.firstChild;
    secondSectionTextNode = secondSectionNode.firstChild;
    assert.equal(secondSectionNode.textContent, 'first sectionsecond section', 'joins two sections');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor p:contains(first sectionXsecond section)', 'inserts text at correct spot');
  });

  test('keystroke of delete at start of first section does nothing', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var firstSectionTextNode = editor.element.childNodes[0].firstChild;

    assert.equal(firstSectionTextNode.textContent, 'first section', 'finds first section text node');

    _testHelpers['default'].dom.moveCursorTo(editor, firstSectionTextNode, 0);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal(editor.element.childNodes.length, 2, 'still 2 sections');
    firstSectionTextNode = editor.element.childNodes[0].firstChild;
    assert.equal(firstSectionTextNode.textContent, 'first section', 'first section still has same text content');

    assert.deepEqual(_testHelpers['default'].dom.getCursorPosition(), { node: firstSectionTextNode,
      offset: 0 }, 'cursor stays at start of first section');
  });

  test('when selection incorrectly contains P end tag, editor reports correct selection', function (assert) {
    var done = assert.async();

    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var secondSectionTextNode = editor.element.childNodes[1].firstChild;
    var firstSectionPNode = editor.element.childNodes[0];

    _testHelpers['default'].dom.moveCursorTo(editor, firstSectionPNode, 0, secondSectionTextNode, 0);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    _testHelpers['default'].wait(function () {
      assert.ok(true, 'No error should occur');

      var _editor$range = editor.range;
      var headSection = _editor$range.headSection;
      var tailSection = _editor$range.tailSection;
      var headMarker = _editor$range.headMarker;
      var tailMarker = _editor$range.tailMarker;
      var headSectionOffset = _editor$range.headSectionOffset;
      var tailSectionOffset = _editor$range.tailSectionOffset;
      var headMarkerOffset = _editor$range.headMarkerOffset;
      var tailMarkerOffset = _editor$range.tailMarkerOffset;

      assert.ok(headSection === editor.post.sections.objectAt(0), 'returns first section head');
      assert.ok(tailSection === editor.post.sections.objectAt(1), 'returns second section tail');
      assert.ok(headMarker === editor.post.sections.objectAt(0).markers.head, 'returns first section marker head');
      assert.ok(tailMarker === editor.post.sections.objectAt(1).markers.head, 'returns second section marker tail');
      assert.equal(headMarkerOffset, 0, 'headMarkerOffset correct');
      assert.equal(tailMarkerOffset, 0, 'tailMarkerOffset correct');
      assert.equal(headSectionOffset, 0, 'headSectionOffset correct');
      assert.equal(tailSectionOffset, 0, 'tailSectionOffset correct');

      done();
    });
  });

  test('when selection incorrectly contains P start tag, editor reports correct selection', function (assert) {
    var done = assert.async();

    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var firstSectionTextNode = editor.element.childNodes[0].firstChild;
    var secondSectionPNode = editor.element.childNodes[1];

    _testHelpers['default'].dom.moveCursorTo(editor, firstSectionTextNode, 0, secondSectionPNode, 0);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    _testHelpers['default'].wait(function () {
      assert.ok(true, 'No error should occur');

      var _editor$range2 = editor.range;
      var headSection = _editor$range2.headSection;
      var tailSection = _editor$range2.tailSection;
      var headMarker = _editor$range2.headMarker;
      var tailMarker = _editor$range2.tailMarker;
      var headSectionOffset = _editor$range2.headSectionOffset;
      var tailSectionOffset = _editor$range2.tailSectionOffset;
      var headMarkerOffset = _editor$range2.headMarkerOffset;
      var tailMarkerOffset = _editor$range2.tailMarkerOffset;

      assert.equal(headSection, editor.post.sections.objectAt(0), 'returns first section head');
      assert.equal(tailSection, editor.post.sections.objectAt(1), 'returns second section tail');
      assert.equal(headMarker, editor.post.sections.objectAt(0).markers.head, 'returns first section marker head');
      assert.equal(tailMarker, editor.post.sections.objectAt(1).markers.head, 'returns second section marker tail');
      assert.equal(headMarkerOffset, 0, 'headMarkerOffset correct');
      assert.equal(tailMarkerOffset, 0, 'tailMarkerOffset correct');
      assert.equal(headSectionOffset, 0, 'headSectionOffset correct');
      assert.equal(tailSectionOffset, 0, 'tailSectionOffset correct');

      done();
    });
  });

  test('deleting when after deletion there is a trailing space positions cursor at end of selection', function (assert) {
    var done = assert.async();

    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var firstSectionTextNode = editor.element.childNodes[0].firstChild;
    _testHelpers['default'].dom.moveCursorTo(editor, firstSectionTextNode, 'first section'.length);

    var count = 'ection'.length;
    while (count--) {
      _testHelpers['default'].dom.triggerDelete(editor);
    }

    assert.equal($('#editor p:eq(0)').text(), 'first s', 'precond - correct section text after initial deletions');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p:eq(0)').text(), 'first' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE, 'precond - correct text after deleting last char before space');

    var text = 'e';
    _testHelpers['default'].dom.insertText(editor, text);

    _testHelpers['default'].wait(function () {
      assert.equal(editor.post.sections.head.text, 'first ' + text, 'character is placed after space');

      done();
    });
  });

  test('deleting when after deletion there is a leading space positions cursor at start of selection', function (assert) {
    var done = assert.async();

    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'second', editorElement);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p:eq(1)').text(), _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + 'section', 'correct text after deletion');
    var text = 'e';
    _testHelpers['default'].dom.insertText(editor, text);

    _testHelpers['default'].wait(function () {
      assert.equal(editor.post.sections.tail.text, text + ' section', 'correct text after insertion');
      done();
    });
  });

  test('inserting multiple spaces renders them with nbsps', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;

      return post([markupSection()]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    // Tests on FF fail if the editor doesn't have a cursor, we must
    // render it explicitly
    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));

    assert.ok(editor.hasCursor(), 'precond - has cursor');

    var sp = ' ',
        nbsp = _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE;
    _testHelpers['default'].dom.insertText(editor, sp + sp + sp);
    assert.equal($('#editor p:eq(0)').text(), nbsp + nbsp + nbsp, 'correct nbsps in text');
  });

  test('deleting when the previous section is also blank', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWithNoCharacter });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement.childNodes[0].childNodes[0], 0);
    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 2, 'has 2 paragraphs after typing return');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal($('#editor p').length, 1, 'has 1 paragraphs after typing delete');
  });

  test('deleting from head of section when previous section is non-markerable', function (assert) {
    var card = {
      name: 'some-card',
      type: 'dom',
      render: function render() {}
    };

    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;
      var cardSection = _ref5.cardSection;

      expected = post([cardSection('some-card'), markupSection('p', [marker('abc')])]);
      return post([cardSection('some-card'), markupSection('p', [marker('abc')])]);
    }, { cards: [card] });

    var node = _testHelpers['default'].dom.findTextNode(editorElement, 'abc');
    _testHelpers['default'].dom.moveCursorTo(editor, node, 0);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition(), 'moves cursor to end of card section');
    assert.postIsSimilar(editor.post, expected, 'post is not changed');
  });

  test('delete with option (Mac) or control (Win)  key deletes full word', function (assert) {
    assert.expect(1);
    if (!_mobiledocKitUtilsBrowser['default'].isMac() && !_mobiledocKitUtilsBrowser['default'].isWin()) {
      assert.ok(true, 'SKIP on non-mac non-win');
      return;
    }

    var done = assert.async();

    var _Helpers$postAbstract$buildFromText = _testHelpers['default'].postAbstract.buildFromText("abc def");

    var post = _Helpers$postAbstract$buildFromText.post;

    var _Helpers$postAbstract$buildFromText2 = _testHelpers['default'].postAbstract.buildFromText("abc ");

    var expected = _Helpers$postAbstract$buildFromText2.post;

    editor = _testHelpers['default'].mobiledoc.renderPostInto(editorElement, post);

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));

    var altKey = undefined,
        ctrlKey = undefined;
    if (_mobiledocKitUtilsBrowser['default'].isMac()) {
      /* Mac key codes for navigation by word */
      altKey = true;
      ctrlKey = false;
    } else {
      /* PC key codes for navigation by word */
      altKey = false;
      ctrlKey = true;
    }

    _testHelpers['default'].wait(function () {
      _testHelpers['default'].dom.triggerDelete(editor, _mobiledocKitUtilsKey.DIRECTION.BACKWARD, { altKey: altKey, ctrlKey: ctrlKey });

      _testHelpers['default'].wait(function () {
        assert.postIsSimilar(editor.post, expected);
        done();
      });
    });
  });
});
define('tests/acceptance/editor-selections-test', ['exports', 'mobiledoc-kit', '../test-helpers', 'mobiledoc-kit/renderers/mobiledoc/0-2'], function (exports, _mobiledocKit, _testHelpers, _mobiledocKitRenderersMobiledoc02) {
  'use strict';

  var test = _testHelpers['default'].test;
  var _module = _testHelpers['default'].module;

  var editor = undefined,
      editorElement = undefined;

  var mobileDocWithSection = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[], [[1, "P", [[[], 0, "one trick pony"]]]]]
  };

  var mobileDocWith2Sections = {
    version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
    sections: [[], [[1, "P", [[[], 0, "first section"]]], [1, "P", [[[], 0, "second section"]]]]]
  };

  _module('Acceptance: Editor Selections', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
      }
    }
  });

  test('selecting across sections is possible', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var firstSection = $('p:contains(first section)')[0];
    var secondSection = $('p:contains(second section)')[0];

    _testHelpers['default'].dom.selectText(editor, 'section', firstSection, 'second', secondSection);

    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');
    assert.equal(editor.activeSections.length, 2, 'selects 2 sections');
  });

  test('when editing is disabled, the selection detection code is disabled', function (assert) {
    var done = assert.async();
    $('#qunit-fixture').append('<p>outside section 1</p>');
    $('#qunit-fixture').append('<p>outside section 2</p>');

    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWithSection });
    editor.render(editorElement);
    editor.disableEditing();

    var outside1 = $('p:contains(outside section 1)')[0];
    var outside2 = $('p:contains(outside section 2)')[0];

    _testHelpers['default'].wait(function () {
      _testHelpers['default'].dom.selectText(editor, 'outside', outside1, 'section 2', outside2);

      _testHelpers['default'].wait(function () {
        assert.equal(editor.activeSections.length, 0, 'no selection inside the editor');
        var selectedText = _testHelpers['default'].dom.getSelectedText();
        assert.ok(selectedText.indexOf('outside section 1') !== -1 && selectedText.indexOf('outside section 2') !== -1, 'selects the text');

        done();
      });
    });
  });

  test('selecting an entire section and deleting removes it', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'second section', editorElement);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor p:contains(first section)');
    assert.hasNoElement('#editor p:contains(second section)', 'deletes contents of second section');
    assert.equal($('#editor p').length, 2, 'still has 2 sections');

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.hasElement('#editor p:eq(1):contains(X)', 'inserts text in correct spot');
  });

  test('selecting text in a section and deleting deletes it', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'cond sec', editorElement);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor p:contains(first section)', 'first section unchanged');
    assert.hasNoElement('#editor p:contains(second section)', 'second section is no longer there');
    assert.hasElement('#editor p:contains(setion)', 'second section has correct text');

    _testHelpers['default'].dom.insertText(editor, 'Z');
    assert.hasElement('#editor p:contains(seZtion)', 'text inserted correctly');
  });

  test('selecting text across sections and deleting joins sections', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var firstSection = $('#editor p')[0],
        secondSection = $('#editor p')[1];

    _testHelpers['default'].dom.selectText(editor, 't section', firstSection, 'second s', secondSection);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('p:contains(firsection)');
    assert.hasNoElement('p:contains(first section)');
    assert.hasNoElement('p:contains(second section)');
    assert.equal($('#editor p').length, 1, 'only 1 section after deleting to join');
  });

  test('selecting text across markers and deleting joins markers', function (assert) {

    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'rst sect', editorElement);
    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });

    var firstTextNode = editorElement.childNodes[0] // p
    .childNodes[1] // b
    .childNodes[0]; // textNode containing "rst sect"
    var secondTextNode = editorElement.childNodes[0] // p
    .childNodes[2]; // textNode containing "ion"

    assert.equal(firstTextNode.textContent, 'rst sect', 'correct first text node');
    assert.equal(secondTextNode.textContent, 'ion', 'correct second text node');
    _testHelpers['default'].dom.selectText(editor, 't sect', firstTextNode, 'ion', secondTextNode);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('p:contains(firs)', 'deletes across markers');
    assert.hasElement('strong:contains(rs)', 'maintains bold text');

    firstTextNode = editorElement.childNodes[0] // p
    .childNodes[1] // b
    .childNodes[0]; // textNode now containing "rs"

    assert.deepEqual(_testHelpers['default'].dom.getCursorPosition(), { node: firstTextNode, offset: 2 });
  });

  test('select text and apply markup multiple times', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 't sect', editorElement);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });

    _testHelpers['default'].dom.selectText(editor, 'fir', editorElement);
    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });

    assert.hasElement('p:contains(first section)', 'correct first section');
    assert.hasElement('strong:contains(fir)', 'strong "fir"');
    assert.hasElement('strong:contains(t sect)', 'strong "t sect"');
  });

  test('selecting text across markers deletes intermediary markers', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      var markup = _ref.markup;

      return post([markupSection('p', [marker('abc'), marker('123', [markup('strong')]), marker('def')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var textNode1 = editorElement.childNodes[0].childNodes[0],
        textNode2 = editorElement.childNodes[0].childNodes[2];

    assert.equal(textNode1.textContent, 'abc', 'precond - text node 1');
    assert.equal(textNode2.textContent, 'def', 'precond - text node 2');
    _testHelpers['default'].dom.selectText(editor, 'b', textNode1, 'e', textNode2);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('p:contains(af)', 'has remaining first section');

    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.hasElement('p:contains(aXf)', 'inserts text at correct place');
  });

  test('deleting text across markers preserves node after', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;
      var markup = _ref2.markup;

      return post([markupSection('p', [marker('abc'), marker('123', [markup('strong')]), marker('def')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var textNode1 = editorElement.childNodes[0].childNodes[0],
        textNode2 = editorElement.childNodes[0].childNodes[1];
    assert.equal(textNode1.textContent, 'abc', 'precond -text node 1');
    assert.equal(textNode2.textContent, '123', 'precond -text node 2');

    _testHelpers['default'].dom.selectText(editor, 'b', editorElement, '2', editorElement);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal(editorElement.childNodes[0].textContent, 'a3def', 'has remaining first section');
    _testHelpers['default'].dom.insertText(editor, 'X');
    assert.equal(editorElement.childNodes[0].textContent, 'aX3def', 'inserts text at correct spot');
  });

  test('selecting text across sections and hitting enter deletes and moves cursor to last selected section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var firstSection = $('#editor p:eq(0)')[0],
        secondSection = $('#editor p:eq(1)')[0];

    _testHelpers['default'].dom.selectText(editor, ' section', firstSection, 'second ', secondSection);

    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 2, 'still 2 sections');
    assert.equal($('#editor p:eq(0)').text(), 'first', 'correct text in 1st section');
    assert.equal($('#editor p:eq(1)').text(), 'section', 'correct text in 2nd section');

    var secondSectionTextNode = editor.element.childNodes[1].childNodes[0];
    assert.deepEqual(_testHelpers['default'].dom.getCursorPosition(), { node: secondSectionTextNode, offset: 0 }, 'cursor is at start of second section');
  });

  test('keystroke of printable character while text is selected deletes the text', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'first section', editorElement);

    editor.run(function (postEditor) {
      editor.activeSections.forEach(function (section) {
        postEditor.changeSectionTagName(section, 'h2');
      });
    });

    assert.ok($('#editor h2:contains(first section)').length, 'first section is a heading');

    var firstSectionTextNode = editorElement.childNodes[0].childNodes[0];
    var secondSectionTextNode = editorElement.childNodes[1].childNodes[0];
    _testHelpers['default'].dom.selectText(editor, 'section', firstSectionTextNode, 'secon', secondSectionTextNode);

    _testHelpers['default'].dom.insertText(editor, 'X');

    assert.ok($('#editor h2:contains(first Xd section)').length, 'updates the section');
  });

  test('selecting text bounded by space and typing replaces it', function (assert) {
    var done = assert.async();
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWithSection });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'trick', editorElement);
    _testHelpers['default'].dom.insertText(editor, 'X');
    _testHelpers['default'].wait(function () {
      assert.equal(editor.post.sections.head.text, 'one X pony', 'new text present');

      _testHelpers['default'].dom.insertText(editor, 'Y');
      _testHelpers['default'].wait(function () {
        assert.equal(editor.post.sections.head.text, 'one XY pony', 'further new text present');
        done();
      });
    });
  });

  test('selecting all text across sections and hitting enter deletes and moves cursor to empty section', function (assert) {
    editor = new _mobiledocKit.Editor({ mobiledoc: mobileDocWith2Sections });
    editor.render(editorElement);

    var firstSection = $('#editor p:eq(0)')[0],
        secondSection = $('#editor p:eq(1)')[0];

    _testHelpers['default'].dom.selectText(editor, 'first section', firstSection, 'second section', secondSection);

    _testHelpers['default'].dom.triggerEnter(editor);

    assert.equal($('#editor p').length, 1, 'single section');
    assert.equal($('#editor p:eq(0)').text(), '', 'blank text');

    // Firefox reports that the cursor is on the "<br>", but Safari and Chrome do not.
    // Grab the selection here, then set it to the expected value, and compare again
    // the window's selection
    var selection = window.getSelection();
    var cursorElement = $('#editor p br')[0];
    assert.ok(cursorElement, 'has cursor element');
    _testHelpers['default'].dom.selectRange(cursorElement, 0, cursorElement, 0);
    var newSelection = window.getSelection();
    assert.equal(selection.anchorNode, newSelection.anchorNode, 'correct anchorNode');
    assert.equal(selection.focusNode, newSelection.focusNode, 'correct focusNode');
    assert.equal(selection.anchorOffset, newSelection.anchorOffset, 'correct anchorOffset');
    assert.equal(selection.focusOffset, newSelection.focusOffset, 'correct focusOffset');
  });

  test('selecting text across markup and list sections', function (assert) {
    var build = _testHelpers['default'].mobiledoc.build;
    var mobiledoc = build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var listSection = _ref3.listSection;
      var listItem = _ref3.listItem;
      var marker = _ref3.marker;
      return post([markupSection('p', [marker('abc')]), listSection('ul', [listItem([marker('123')]), listItem([marker('456')])])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement, '12', editorElement);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor p:contains(a3)', 'combines partially-selected list item onto markup section');

    assert.hasNoElement('#editor p:contains(bc)', 'deletes selected text "bc"');
    assert.hasNoElement('#editor p:contains(12)', 'deletes selected text "12"');

    assert.hasElement('#editor li:contains(6)', 'leaves remaining text in list item');
  });

  test('selecting text that covers a list section', function (assert) {
    var build = _testHelpers['default'].mobiledoc.build;
    var mobiledoc = build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var listSection = _ref4.listSection;
      var listItem = _ref4.listItem;
      var marker = _ref4.marker;
      return post([markupSection('p', [marker('abc')]), listSection('ul', [listItem([marker('123')]), listItem([marker('456')])]), markupSection('p', [marker('def')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement, 'de', editorElement);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor p:contains(af)', 'combines sides of selection');

    assert.hasNoElement('#editor li:contains(123)', 'deletes li 1');
    assert.hasNoElement('#editor li:contains(456)', 'deletes li 2');
    assert.hasNoElement('#editor ul', 'removes ul');
  });

  test('selecting text that starts in a list item and ends in a markup section', function (assert) {
    var build = _testHelpers['default'].mobiledoc.build;
    var mobiledoc = build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var listSection = _ref5.listSection;
      var listItem = _ref5.listItem;
      var marker = _ref5.marker;
      return post([listSection('ul', [listItem([marker('123')]), listItem([marker('456')])]), markupSection('p', [marker('def')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, '23', editorElement, 'de', editorElement);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor li:contains(1f)', 'combines sides of selection');

    assert.hasNoElement('#editor li:contains(123)', 'deletes li 1');
    assert.hasNoElement('#editor li:contains(456)', 'deletes li 2');
    assert.hasNoElement('#editor p:contains(def)', 'deletes p content');
    assert.hasNoElement('#editor p', 'removes p entirely');
  });

  test('selecting text that includes a card section and deleting deletes card section', function (assert) {
    var build = _testHelpers['default'].mobiledoc.build;
    var mobiledoc = build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var cardSection = _ref6.cardSection;
      var marker = _ref6.marker;
      return post([markupSection('p', [marker('abc')]), cardSection('simple-card'), markupSection('p', [marker('def')])]);
    });
    var cards = [{
      name: 'simple-card',
      type: 'dom',
      render: function render() {
        return $('<span id="card-el"></span>')[0];
      }
    }];
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: cards });
    editor.render(editorElement);

    assert.hasElement('#card-el', 'precond - card el is rendered');

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement, 'de', editorElement);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor p:contains(af)', 'combines sides of selection');

    assert.hasNoElement('#editor span#card-el', 'card el is removed');
    assert.hasNoElement('#editor p:contains(abc)', 'previous section 1 is removed');
    assert.hasNoElement('#editor p:contains(def)', 'previous section 2 is removed');
  });

  test('selecting text that touches bold text should not be considered bold', function (assert) {

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.selectText(editor, 'b', editorElement);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });

    assert.hasElement('#editor strong:contains(b)', 'precond - bold text');

    _testHelpers['default'].dom.selectText(editor, 'c', editorElement);
    _testHelpers['default'].dom.triggerEvent(document, 'mouseup');

    var bold = editor.builder.createMarkup('strong');
    assert.ok(editor.activeMarkups.indexOf(bold) === -1, 'strong is not in selection');
  });

  // https://github.com/bustle/mobiledoc-kit/issues/121
  test('selecting text that includes a 1-character marker and unbolding it', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;
      var markup = _ref8.markup;

      var b = markup('strong');
      return post([markupSection('p', [marker('a'), marker('b', [b]), marker('c')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    assert.hasElement('#editor strong:contains(b)', 'precond - bold');

    _testHelpers['default'].dom.selectText(editor, 'b', editorElement, 'c', editorElement);

    var bold = editor.builder.createMarkup('strong');
    assert.ok(editor.activeMarkups.indexOf(bold) !== -1, 'strong is in selection');

    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });

    assert.hasNoElement('#editor strong', 'bold text is unboldened');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/128
  test('selecting text that includes an empty section and applying markup to it', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    // precond
    assert.hasElement('#editor p:contains(abc)');
    assert.ok($('#editor p:eq(1)').text() === '', 'no text in second p');
    var t1 = $('#editor p:eq(0)')[0].childNodes[0];
    assert.equal(t1.textContent, 'abc', 'correct text node');
    var p2 = $('#editor p:eq(1)')[0];

    _testHelpers['default'].dom.moveCursorTo(editor, t1, 0, p2, 0);

    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('strong');
    });

    assert.hasElement('#editor p strong:contains(abc)', 'bold is applied to text');
  });

  test('placing cursor inside a strong section should cause activeMarkups to contain "strong"', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;
      var markup = _ref10.markup;

      var b = markup('strong');
      return post([markupSection('p', [marker('before'), marker('loud', [b]), marker('after')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, $('#editor strong')[0].firstChild, 1);

    var bold = editor.builder.createMarkup('strong');
    assert.ok(editor.activeMarkups.indexOf(bold) !== -1, 'strong is in selection');

    _testHelpers['default'].dom.moveCursorTo(editor, $('#editor')[0].childNodes[0], 1);
    delete editor._activeMarkups;

    assert.ok(editor.activeMarkups.indexOf(bold) === -1, 'strong is not in selection');
  });
});
define('tests/acceptance/editor-undo-redo-test', ['exports', 'mobiledoc-kit/utils/key', '../test-helpers'], function (exports, _mobiledocKitUtilsKey, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var undoBlockTimeout = 2000;

  var editor = undefined,
      editorElement = undefined,
      oldDateNow = undefined;

  function undo(editor) {
    _testHelpers['default'].dom.triggerKeyCommand(editor, 'Z', [_mobiledocKitUtilsKey.MODIFIERS.META]);
  }

  function redo(editor) {
    _testHelpers['default'].dom.triggerKeyCommand(editor, 'Z', [_mobiledocKitUtilsKey.MODIFIERS.META, _mobiledocKitUtilsKey.MODIFIERS.SHIFT]);
  }

  _module('Acceptance: Editor: Undo/Redo', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
      oldDateNow = Date.now;
    },
    afterEach: function afterEach() {
      Date.now = oldDateNow;
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('undo/redo the insertion of a character', function (assert) {
    var done = assert.async();
    var expectedBeforeUndo = undefined,
        expectedAfterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      expectedBeforeUndo = post([markupSection('p', [marker('abcD')])]);
      expectedAfterUndo = post([markupSection('p', [marker('abc')])]);
      return expectedAfterUndo;
    });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'abc');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'abc'.length);

    _testHelpers['default'].dom.insertText(editor, 'D');

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond
      undo(editor);
      assert.postIsSimilar(editor.post, expectedAfterUndo);
      assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);

      var position = editor.range.head;
      assert.positionIsEqual(position, editor.post.sections.head.tailPosition());

      redo(editor);

      assert.postIsSimilar(editor.post, expectedBeforeUndo);
      assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);

      position = editor.range.head;
      assert.positionIsEqual(position, editor.post.sections.head.tailPosition());

      done();
    });
  });

  // Test to ensure that we don't push empty snapshots on the undo stack
  // when typing characters
  test('undo/redo the insertion of multiple characters', function (assert) {
    var done = assert.async();
    var beforeUndo = undefined,
        afterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      beforeUndo = post([markupSection('p', [marker('abcDE')])]);
      afterUndo = post([markupSection('p', [marker('abc')])]);
      return afterUndo;
    });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'abc');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'abc'.length);

    _testHelpers['default'].dom.insertText(editor, 'D');

    _testHelpers['default'].wait(function () {
      _testHelpers['default'].dom.insertText(editor, 'E');

      _testHelpers['default'].wait(function () {
        assert.postIsSimilar(editor.post, beforeUndo, 'precond - post was updated with new characters');

        undo(editor);
        assert.postIsSimilar(editor.post, afterUndo, 'ensure undo grouped to include both characters');

        redo(editor);
        assert.postIsSimilar(editor.post, beforeUndo, 'ensure redo grouped to include both characters');
        done();
      });
    });
  });

  // Test to ensure that undo events group after a timeout
  test('make sure undo/redo events group when adding text', function (assert) {
    var done = assert.async();
    var beforeUndo = undefined,
        afterUndo1 = undefined,
        afterUndo2 = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      beforeUndo = post([markupSection('p', [marker('123456789')])]);
      afterUndo1 = post([markupSection('p', [marker('123456')])]);
      afterUndo2 = post([markupSection('p', [marker('123')])]);
      return afterUndo2;
    }, { undoBlockTimeout: undoBlockTimeout });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, '123');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, '123'.length);

    _testHelpers['default'].dom.insertText(editor, '4');

    _testHelpers['default'].wait(function () {
      _testHelpers['default'].dom.insertText(editor, '5');
      _testHelpers['default'].wait(function () {
        _testHelpers['default'].dom.insertText(editor, '6');
        _testHelpers['default'].wait(function () {
          Date.now = function () {
            return oldDateNow.call(Date) + undoBlockTimeout + 1;
          };
          _testHelpers['default'].dom.insertText(editor, '7');
          _testHelpers['default'].wait(function () {
            _testHelpers['default'].dom.insertText(editor, '8');
            _testHelpers['default'].wait(function () {
              _testHelpers['default'].dom.insertText(editor, '9');
              assert.postIsSimilar(editor.post, beforeUndo);

              undo(editor);
              assert.postIsSimilar(editor.post, afterUndo1);

              undo(editor);
              assert.postIsSimilar(editor.post, afterUndo2);

              redo(editor);
              assert.postIsSimilar(editor.post, afterUndo1);
              done();
            });
          });
        });
      });
    });
  });

  test('make sure undo/redo events group when deleting text', function (assert) {
    var done = assert.async();
    var beforeUndo = undefined,
        afterUndo1 = undefined,
        afterUndo2 = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      beforeUndo = post([markupSection('p', [marker('123')])]);
      afterUndo1 = post([markupSection('p', [marker('123456')])]);
      afterUndo2 = post([markupSection('p', [marker('123456789')])]);
      return afterUndo2;
    }, { undoBlockTimeout: undoBlockTimeout });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, '123456789');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, '123456789'.length);

    _testHelpers['default'].dom.triggerDelete(editor);
    _testHelpers['default'].dom.triggerDelete(editor);
    _testHelpers['default'].dom.triggerDelete(editor);

    _testHelpers['default'].wait(function () {
      Date.now = function () {
        return oldDateNow.call(Date) + undoBlockTimeout + 1;
      };

      _testHelpers['default'].dom.triggerDelete(editor);
      _testHelpers['default'].dom.triggerDelete(editor);
      _testHelpers['default'].dom.triggerDelete(editor);

      assert.postIsSimilar(editor.post, beforeUndo);

      undo(editor);
      assert.postIsSimilar(editor.post, afterUndo1);

      undo(editor);
      assert.postIsSimilar(editor.post, afterUndo2);

      redo(editor);
      assert.postIsSimilar(editor.post, afterUndo1);
      done();
    });
  });

  test('adding and deleting characters break the undo group/run', function (assert) {
    var beforeUndo = undefined,
        afterUndo1 = undefined,
        afterUndo2 = undefined;
    var done = assert.async();
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;

      beforeUndo = post([markupSection('p', [marker('abcXY')])]);
      afterUndo1 = post([markupSection('p', [marker('abc')])]);
      afterUndo2 = post([markupSection('p', [marker('abcDE')])]);
      return afterUndo2;
    });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'abcDE');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'abcDE'.length);

    _testHelpers['default'].dom.triggerDelete(editor);
    _testHelpers['default'].dom.triggerDelete(editor);

    _testHelpers['default'].dom.insertText(editor, 'X');

    _testHelpers['default'].wait(function () {
      _testHelpers['default'].dom.insertText(editor, 'Y');

      _testHelpers['default'].wait(function () {
        assert.postIsSimilar(editor.post, beforeUndo); // precond

        undo(editor);
        assert.postIsSimilar(editor.post, afterUndo1);

        undo(editor);
        assert.postIsSimilar(editor.post, afterUndo2);

        redo(editor);
        assert.postIsSimilar(editor.post, afterUndo1);

        redo(editor);
        assert.postIsSimilar(editor.post, beforeUndo);
        done();
      });
    });
  });

  test('undo the deletion of a character', function (assert) {
    var expectedBeforeUndo = undefined,
        expectedAfterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;

      expectedBeforeUndo = post([markupSection('p', [marker('abc')])]);
      expectedAfterUndo = post([markupSection('p', [marker('abcD')])]);
      return expectedAfterUndo;
    });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'abcD');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'abcD'.length);

    _testHelpers['default'].dom.triggerDelete(editor);

    assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond

    undo(editor);
    assert.postIsSimilar(editor.post, expectedAfterUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);
    var position = editor.range.head;
    assert.positionIsEqual(position, editor.post.sections.head.tailPosition());

    redo(editor);
    assert.postIsSimilar(editor.post, expectedBeforeUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);
    position = editor.range.head;
    assert.positionIsEqual(position, editor.post.sections.head.tailPosition());
  });

  test('undo the deletion of a range', function (assert) {
    var expectedBeforeUndo = undefined,
        expectedAfterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      expectedBeforeUndo = post([markupSection('p', [marker('ad')])]);
      expectedAfterUndo = post([markupSection('p', [marker('abcd')])]);
      return expectedAfterUndo;
    });

    _testHelpers['default'].dom.selectText(editor, 'bc', editorElement);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond

    undo(editor);
    assert.postIsSimilar(editor.post, expectedAfterUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);
    var _editor$range = editor.range;
    var head = _editor$range.head;
    var tail = _editor$range.tail;

    var section = editor.post.sections.head;
    assert.positionIsEqual(head, section.toPosition('a'.length));
    assert.positionIsEqual(tail, section.toPosition('abc'.length));

    redo(editor);
    assert.postIsSimilar(editor.post, expectedBeforeUndo);
    assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);
    head = editor.range.head;
    tail = editor.range.tail;
    section = editor.post.sections.head;
    assert.positionIsEqual(head, section.toPosition('a'.length));
    assert.positionIsEqual(tail, section.toPosition('a'.length));
  });

  test('undo insertion of character to a list item', function (assert) {
    var done = assert.async();
    var expectedBeforeUndo = undefined,
        expectedAfterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref8) {
      var post = _ref8.post;
      var listSection = _ref8.listSection;
      var listItem = _ref8.listItem;
      var marker = _ref8.marker;

      expectedBeforeUndo = post([listSection('ul', [listItem([marker('abcD')])])]);
      expectedAfterUndo = post([listSection('ul', [listItem([marker('abc')])])]);
      return expectedAfterUndo;
    });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'abc');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'abc'.length);
    _testHelpers['default'].dom.insertText(editor, 'D');

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expectedBeforeUndo); // precond

      undo(editor);
      assert.postIsSimilar(editor.post, expectedAfterUndo);
      assert.renderTreeIsEqual(editor._renderTree, expectedAfterUndo);
      var _editor$range2 = editor.range;
      var head = _editor$range2.head;
      var tail = _editor$range2.tail;

      var section = editor.post.sections.head.items.head;
      assert.positionIsEqual(head, section.toPosition('abc'.length));
      assert.positionIsEqual(tail, section.toPosition('abc'.length));

      redo(editor);
      assert.postIsSimilar(editor.post, expectedBeforeUndo);
      assert.renderTreeIsEqual(editor._renderTree, expectedBeforeUndo);
      head = editor.range.head;
      tail = editor.range.tail;
      section = editor.post.sections.head.items.head;
      assert.positionIsEqual(head, section.toPosition('abcD'.length));
      assert.positionIsEqual(tail, section.toPosition('abcD'.length));

      done();
    });
  });

  test('undo stack length can be configured (depth 1)', function (assert) {
    var done = assert.async();
    var editorOptions = { undoDepth: 1 };

    var beforeUndo = undefined,
        afterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      beforeUndo = post([markupSection('p', [marker('abcDE')])]);
      afterUndo = post([markupSection('p', [marker('abc')])]);
      return post([markupSection('p', [marker('abc')])]);
    }, editorOptions);

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'abc');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'abc'.length);
    _testHelpers['default'].dom.insertText(editor, 'D');

    _testHelpers['default'].wait(function () {
      _testHelpers['default'].dom.insertText(editor, 'E');

      _testHelpers['default'].wait(function () {
        assert.postIsSimilar(editor.post, beforeUndo); // precond

        undo(editor);
        assert.postIsSimilar(editor.post, afterUndo);
        assert.renderTreeIsEqual(editor._renderTree, afterUndo);
        assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());

        undo(editor);
        assert.postIsSimilar(editor.post, afterUndo, 'second undo does not change post');
        assert.renderTreeIsEqual(editor._renderTree, afterUndo);
        assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());

        done();
      });
    });
  });

  test('undo stack length can be configured (depth 0)', function (assert) {
    var done = assert.async();
    var editorOptions = { undoDepth: 0 };

    var beforeUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;

      beforeUndo = post([markupSection('p', [marker('abcDE')])]);
      return post([markupSection('p', [marker('abc')])]);
    }, editorOptions);

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'abc');
    _testHelpers['default'].dom.moveCursorTo(editor, textNode, 'abc'.length);
    _testHelpers['default'].dom.insertText(editor, 'D');

    _testHelpers['default'].wait(function () {
      _testHelpers['default'].dom.insertText(editor, 'E');

      _testHelpers['default'].wait(function () {
        assert.postIsSimilar(editor.post, beforeUndo); // precond

        undo(editor);
        assert.postIsSimilar(editor.post, beforeUndo, 'nothing is undone');
        assert.renderTreeIsEqual(editor._renderTree, beforeUndo);
        assert.positionIsEqual(editor.range.head, editor.post.sections.head.tailPosition());

        done();
      });
    });
  });

  test('taking and restoring a snapshot with no cursor', function (assert) {
    var beforeUndo = undefined,
        afterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;

      beforeUndo = post([markupSection('p', [marker('abc')])]);
      afterUndo = post([markupSection('p', [])]);
      return afterUndo;
    }, { autofocus: false });

    assert.ok(!editor.cursor.hasCursor(), 'precond - no cursor');
    editor.run(function (postEditor) {
      postEditor.insertText(editor.post.headPosition(), 'abc');
    });
    assert.postIsSimilar(editor.post, beforeUndo, 'precond - text is added');

    undo(editor);
    assert.postIsSimilar(editor.post, afterUndo, 'text is removed');
  });

  test('take and undo a snapshot based on drag/dropping of text', function (assert) {
    var done = assert.async();
    var text = 'abc';
    var beforeUndo = undefined,
        afterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref12) {
      var post = _ref12.post;
      var markupSection = _ref12.markupSection;
      var marker = _ref12.marker;

      beforeUndo = post([markupSection('p', [marker(text)])]);
      afterUndo = post([markupSection('p', [marker('a')])]);
      return afterUndo;
    });

    var textNode = _testHelpers['default'].dom.findTextNode(editorElement, 'a');
    textNode.textContent = text;

    // Allow the mutation observer to fire, then...
    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, beforeUndo, 'precond - text is added');
      undo(editor);
      assert.postIsSimilar(editor.post, afterUndo, 'text is removed');
      done();
    });
  });

  test('take and undo a snapshot when adding a card', function (assert) {
    var text = 'abc';
    var myCard = {
      name: 'my-card',
      type: 'dom',
      render: function render() {
        return document.createTextNode('card contents');
      }
    };

    var beforeUndo = undefined,
        afterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref13) {
      var post = _ref13.post;
      var markupSection = _ref13.markupSection;
      var marker = _ref13.marker;
      var cardSection = _ref13.cardSection;

      beforeUndo = post([markupSection('p', [marker(text)]), cardSection('my-card', {})]);
      afterUndo = post([markupSection('p', [marker(text)])]);
      return afterUndo;
    }, {
      cards: [myCard]
    });

    editor.run(function (postEditor) {
      var card = editor.builder.createCardSection('my-card', {});
      postEditor.insertSectionBefore(editor.post.sections, card, null);
    });

    assert.postIsSimilar(editor.post, beforeUndo, 'precond - card is added');
    undo(editor);
    assert.postIsSimilar(editor.post, afterUndo, 'card is removed');
  });

  test('take and undo a snapshot when removing an atom', function (assert) {
    var text = 'abc';
    var myAtom = {
      name: 'my-atom',
      type: 'dom',
      render: function render() {
        return document.createTextNode('atom contents');
      }
    };

    var beforeUndo = undefined,
        afterUndo = undefined;
    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref14) {
      var post = _ref14.post;
      var markupSection = _ref14.markupSection;
      var marker = _ref14.marker;
      var atom = _ref14.atom;

      beforeUndo = post([markupSection('p', [marker(text)])]);
      afterUndo = post([markupSection('p', [marker(text), atom('my-atom', 'content', {})])]);
      return afterUndo;
    }, {
      atoms: [myAtom]
    });

    editor.run(function (postEditor) {
      postEditor.removeMarker(editor.post.sections.head.markers.tail);
    });

    assert.postIsSimilar(editor.post, beforeUndo, 'precond - atom is removed');
    undo(editor);
    assert.postIsSimilar(editor.post, afterUndo, 'atom is restored');
  });
});
QUnit.module('ESLint | tests/eslint/acceptance/basic-editor-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/basic-editor-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/cursor-movement-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/cursor-movement-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/cursor-position-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/cursor-position-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-atoms-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-atoms-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-attributes-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-attributes-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-cards-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-cards-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-copy-paste-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-copy-paste-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-disable-editing-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-disable-editing-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-drag-drop-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-drag-drop-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-input-handlers-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-input-handlers-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-key-commands-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-key-commands-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-list-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-list-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-post-editor-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-post-editor-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-reparse-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-reparse-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-sections-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-sections-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-selections-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-selections-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/acceptance/editor-undo-redo-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/acceptance/editor-undo-redo-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/fixtures/google-docs.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/fixtures/google-docs.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/assertions.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/assertions.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/browsers.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/browsers.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/dom.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/dom.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/editor.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/editor.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/mobiledoc.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/mobiledoc.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/mock-editor.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/mock-editor.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/module-load-failure.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/module-load-failure.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/post-abstract.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/post-abstract.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/post-editor-run.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/post-editor-run.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/render-built-abstract.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/render-built-abstract.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/sections.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/sections.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/helpers/wait.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/helpers/wait.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/cards/image.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/cards/image.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/edit-history.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/edit-history.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/edit-state.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/edit-state.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/editor.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/editor.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/event-manager.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/event-manager.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/key-commands.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/key-commands.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/mutation-handler.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/mutation-handler.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/post.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/post.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/post/post-inserter.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/post/post-inserter.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/selection-change-observer.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/selection-change-observer.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/selection-manager.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/selection-manager.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/text-input-handler.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/text-input-handler.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/text-input-handlers.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/text-input-handlers.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/editor/ui.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/editor/ui.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/index.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/index.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/_attributable.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/_attributable.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/_markerable.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/_markerable.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/_section.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/_section.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/atom-node.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/atom-node.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/atom.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/atom.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/card-node.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/card-node.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/card.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/card.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/image.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/image.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/lifecycle-callbacks.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/lifecycle-callbacks.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/list-item.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/list-item.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/list-section.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/list-section.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/marker.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/marker.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/markup-section.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/markup-section.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/markup.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/markup.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/post-node-builder.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/post-node-builder.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/post.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/post.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/render-node.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/render-node.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/render-tree.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/render-tree.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/models/types.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/models/types.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/dom.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/dom.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/html.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/html.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/mobiledoc/0-2.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/mobiledoc/0-2.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/mobiledoc/0-3-1.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/mobiledoc/0-3-1.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/mobiledoc/0-3-2.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/mobiledoc/0-3-2.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/mobiledoc/0-3.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/mobiledoc/0-3.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/mobiledoc/index.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/mobiledoc/index.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/section.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/section.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/parsers/text.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/parsers/text.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/renderers/editor-dom.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/renderers/editor-dom.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/renderers/mobiledoc/0-2.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/renderers/mobiledoc/0-2.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/renderers/mobiledoc/0-3-1.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/renderers/mobiledoc/0-3-1.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/renderers/mobiledoc/0-3-2.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/renderers/mobiledoc/0-3-2.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/renderers/mobiledoc/0-3.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/renderers/mobiledoc/0-3.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/renderers/mobiledoc/index.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/renderers/mobiledoc/index.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/array-utils.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/array-utils.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/assert.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/assert.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/browser.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/browser.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/characters.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/characters.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/compiler.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/compiler.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/copy.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/copy.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/cursor.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/cursor.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/cursor/position.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/cursor/position.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/cursor/range.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/cursor/range.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/deprecate.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/deprecate.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/dom-utils.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/dom-utils.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/element-map.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/element-map.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/element-utils.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/element-utils.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/environment.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/environment.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/fixed-queue.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/fixed-queue.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/key.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/key.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/keycodes.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/keycodes.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/keys.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/keys.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/linked-item.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/linked-item.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/linked-list.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/linked-list.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/log-manager.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/log-manager.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/markuperable.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/markuperable.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/merge.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/merge.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/mixin.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/mixin.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/mobiledoc-error.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/mobiledoc-error.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/object-utils.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/object-utils.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/parse-utils.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/parse-utils.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/placeholder-image-src.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/placeholder-image-src.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/selection-utils.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/selection-utils.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/set.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/set.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/string-utils.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/string-utils.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/utils/to-range.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/utils/to-range.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/version.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/version.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/views/tooltip.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/views/tooltip.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/js/views/view.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/js/views/view.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/test-helpers.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/test-helpers.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/atom-lifecycle-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/atom-lifecycle-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/card-lifecycle-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/card-lifecycle-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/editor-events-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/editor-events-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/editor-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/editor-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/key-commands-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/key-commands-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/post-delete-at-position-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/post-delete-at-position-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/post-delete-range-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/post-delete-range-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/post-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/post-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/post/insert-post-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/post/insert-post-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/editor/ui-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/editor/ui-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/atom-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/atom-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/card-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/card-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/lifecycle-callbacks-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/lifecycle-callbacks-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/list-section-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/list-section-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/marker-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/marker-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/markup-section-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/markup-section-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/post-node-builder-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/post-node-builder-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/models/post-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/models/post-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/dom-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/dom-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/html-google-docs-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/html-google-docs-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/html-google-sheets-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/html-google-sheets-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/html-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/html-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/mobiledoc-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/mobiledoc-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/mobiledoc/0-2-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/mobiledoc/0-2-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/mobiledoc/0-3-2-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/mobiledoc/0-3-2-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/mobiledoc/0-3-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/mobiledoc/0-3-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/section-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/section-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/parsers/text-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/parsers/text-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/renderers/editor-dom-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/renderers/editor-dom-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/renderers/mobiledoc-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/renderers/mobiledoc-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/renderers/mobiledoc/0-2-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/renderers/mobiledoc/0-2-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/renderers/mobiledoc/0-3-2-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/renderers/mobiledoc/0-3-2-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/renderers/mobiledoc/0-3-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/renderers/mobiledoc/0-3-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/array-utils-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/array-utils-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/assert-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/assert-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/copy-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/copy-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/cursor-position-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/cursor-position-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/cursor-range-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/cursor-range-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/fixed-queue-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/fixed-queue-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/key-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/key-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/linked-list-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/linked-list-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/object-utils-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/object-utils-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/parse-utils-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/parse-utils-test.js should pass ESLint\n\n');
});

QUnit.module('ESLint | tests/eslint/unit/utils/selection-utils-test.js');
QUnit.test('should pass ESLint', function(assert) {
  assert.expect(1);
  assert.ok(true, 'tests/eslint/unit/utils/selection-utils-test.js should pass ESLint\n\n');
});

define('tests/fixtures/google-docs', ['exports'], function (exports) {
  'use strict';

  exports['default'] = {
    'simple paragraph as span': {
      expected: "<p>simple paragraph</p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c07-deca-96cb-4b79c9ad7a7f"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">simple paragraph</span></b>'
    },
    'simple paragraph as span (Chrome - Windows)': {
      expected: "<p>simple paragraph</p>",
      raw: '<html><body><!--StartFragment--><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-af1f8f2c-cacc-6998-07a1-89da38d9c501"><span style="font-size:14.666666666666666px;font-family:Arial;color:#222222;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">simple paragraph</span></b><!--EndFragment--></body></html>'
    },

    // when selecting a line without including the end of the line, the html represention
    // includes a <span> or series of <span>s
    'paragraph with bold as span': {
      expected: "<p>paragraph with <strong>bold</strong></p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c09-8dc9-fb2f-f7eb880e143d"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">paragraph with </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span></b>'
    },
    'paragraph with bold as span (Chrome - Windows)': {
      expected: "<p>paragraph with <strong>bold</strong></p>",
      raw: '<html><body><!--StartFragment--><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-af1f8f2c-cacd-c884-b763-ee9510747969"><span style="font-size:14.666666666666666px;font-family:Arial;color:#222222;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">paragraph with </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#222222;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span></b><!--EndFragment--></body></html>'
    },

    // when selecting a line that includes the end (using, e.g., shift+up to selection the entire line),
    // the html representation includes a <p> tag
    'paragraph with bold as p': {
      expected: "<p>A <strong>bold</strong> paragraph.<p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-9031-bb09-1958-dcc3dd34c237"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">A </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> paragraph.</span></p></b><br class="Apple-interchange-newline">'
    },
    'paragraph with italic as span': {
      expected: "<p>paragraph with <em>italic</em></p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c15-20cb-c8cd-59f592dc8402"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">paragraph with </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">italic</span></b>'
    },
    'paragraph with bold + italic as p': {
      expected: "<p>And a second <strong>bold</strong> <em>italic</em> paragraph.",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-9038-f59a-421c-1c5303efdaf6"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">And a second </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">bold</span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> </span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">italic</span><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"> paragraph.</span></p></b><br class="Apple-interchange-newline">'
    },
    '2 paragraphs as p': {
      expected: "<p>Paragraph 1</p><p>Paragraph 2</p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d75a90f6-8c66-10b0-1c99-0210f64abe05"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Paragraph 1</span></p><br><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">Paragraph 2</span></b>'
    },
    'h1 with h1 tag': {
      expected: "<h1>h1 text</h1>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-2f095724-903a-1280-b377-a2b08d38ffaa"><h1 dir="ltr" style="line-height:1.38;margin-top:20pt;margin-bottom:6pt;"><span style="font-size:26.666666666666664px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">h1 text</span></h1></b>'
    },
    'paragraph with link as span': {
      expected: "<p>link to <a href='http://bustle.com'>bustle</a></p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-903c-08a3-cc9c-7841d9aa3871"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">link to </span><a href="http://bustle.com" style="text-decoration:none;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">bustle</span></a></b>'
    },
    'paragraph with link as p': {
      expected: "<p>link to <a href='http://bustle.com'>bustle</a></p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-e8f29cd6-903b-12a4-6455-23c68a9eae95"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;">link to </span><a href="http://bustle.com" style="text-decoration:none;"><span style="font-size:14.666666666666666px;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;vertical-align:baseline;white-space:pre-wrap;">bustle</span></a></p></b><br class="Apple-interchange-newline">'
    },
    'img in span': {
      expected: "<p><img src='https://placehold.it/100x100'></p>",
      raw: '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-7a3c9f90-a5c3-d3b6-425c-75b28c50bd7e"><span style="font-size:14.666666666666666px;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre-wrap;"><img src="https://placehold.it/100x100" width="500px;" height="374px;" style="border: none; transform: rotate(0.00rad); -webkit-transform: rotate(0.00rad);"/></span></b>'
    }
  };
});
define('tests/helpers/assertions', ['exports', './dom', 'mobiledoc-kit/renderers/mobiledoc', 'mobiledoc-kit/models/types'], function (exports, _dom, _mobiledocKitRenderersMobiledoc, _mobiledocKitModelsTypes) {
  /* global QUnit, $ */

  'use strict';

  exports['default'] = registerAssertions;

  function compareMarkers(actual, expected, assert, path, deepCompare) {
    if (actual.value !== expected.value) {
      assert.equal(actual.value, expected.value, 'wrong value at ' + path);
    }
    if (actual.markups.length !== expected.markups.length) {
      assert.equal(actual.markups.length, expected.markups.length, 'wrong markups at ' + path);
    }
    if (deepCompare) {
      actual.markups.forEach(function (markup, index) {
        comparePostNode(markup, expected.markups[index], assert, path + ':' + index, deepCompare);
      });
    }
  }

  /* eslint-disable complexity */
  function comparePostNode(actual, expected, assert) {
    var path = arguments.length <= 3 || arguments[3] === undefined ? 'root' : arguments[3];
    var deepCompare = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

    if (!actual || !expected) {
      assert.ok(!!actual, 'missing actual post node at ' + path);
      assert.ok(!!expected, 'missing expected post node at ' + path);
      return;
    }
    if (actual.type !== expected.type) {
      assert.pushResult({
        result: false,
        actual: actual.type,
        expected: expected.type,
        message: 'wrong type at ' + path
      });
    }

    switch (actual.type) {
      case _mobiledocKitModelsTypes.POST_TYPE:
        if (actual.sections.length !== expected.sections.length) {
          assert.equal(actual.sections.length, expected.sections.length, 'wrong sections for post');
        }
        if (deepCompare) {
          actual.sections.forEach(function (section, index) {
            comparePostNode(section, expected.sections.objectAt(index), assert, path + ':' + index, deepCompare);
          });
        }
        break;
      case _mobiledocKitModelsTypes.ATOM_TYPE:
        if (actual.name !== expected.name) {
          assert.equal(actual.name, expected.name, 'wrong atom name at ' + path);
        }
        compareMarkers(actual, expected, assert, path, deepCompare);
        break;
      case _mobiledocKitModelsTypes.MARKER_TYPE:
        compareMarkers(actual, expected, assert, path, deepCompare);
        break;
      case _mobiledocKitModelsTypes.MARKUP_SECTION_TYPE:
      case _mobiledocKitModelsTypes.LIST_ITEM_TYPE:
        if (actual.tagName !== expected.tagName) {
          assert.equal(actual.tagName, expected.tagName, 'wrong tagName at ' + path);
        }
        if (actual.markers.length !== expected.markers.length) {
          assert.equal(actual.markers.length, expected.markers.length, 'wrong markers at ' + path);
        }
        if (deepCompare) {
          actual.markers.forEach(function (marker, index) {
            comparePostNode(marker, expected.markers.objectAt(index), assert, path + ':' + index, deepCompare);
          });
        }
        break;
      case _mobiledocKitModelsTypes.CARD_TYPE:
        if (actual.name !== expected.name) {
          assert.equal(actual.name, expected.name, 'wrong card name at ' + path);
        }
        if (!QUnit.equiv(actual.payload, expected.payload)) {
          assert.deepEqual(actual.payload, expected.payload, 'wrong card payload at ' + path);
        }
        break;
      case _mobiledocKitModelsTypes.LIST_SECTION_TYPE:
        if (actual.items.length !== expected.items.length) {
          assert.equal(actual.items.length, expected.items.length, 'wrong items at ' + path);
        }
        if (deepCompare) {
          actual.items.forEach(function (item, index) {
            comparePostNode(item, expected.items.objectAt(index), assert, path + ':' + index, deepCompare);
          });
        }
        break;
      case _mobiledocKitModelsTypes.IMAGE_SECTION_TYPE:
        if (actual.src !== expected.src) {
          assert.equal(actual.src, expected.src, 'wrong image src at ' + path);
        }
        break;
      case _mobiledocKitModelsTypes.MARKUP_TYPE:
        if (actual.tagName !== expected.tagName) {
          assert.equal(actual.tagName, expected.tagName, 'wrong tagName at ' + path);
        }
        if (!QUnit.equiv(actual.attributes, expected.attributes)) {
          assert.deepEqual(actual.attributes, expected.attributes, 'wrong attributes at ' + path);
        }
        break;
      default:
        throw new Error('wrong type :' + actual.type);
    }
  }
  /* eslint-enable complexity */

  function registerAssertions(QUnit) {
    QUnit.assert.isBlank = function (val) {
      var message = arguments.length <= 1 || arguments[1] === undefined ? 'value is blank' : arguments[1];

      this.pushResult({
        result: val === null || val === undefined || val === '' || val === false,
        actual: val + ' (typeof ' + typeof val + ')',
        expected: 'null|undefined|\'\'|false',
        message: message
      });
    };

    QUnit.assert.hasElement = function (selector) {
      var message = arguments.length <= 1 || arguments[1] === undefined ? 'hasElement "' + selector + '"' : arguments[1];
      return (function () {
        var found = $(selector);
        this.pushResult({
          result: found.length > 0,
          actual: found.length + ' matches for \'' + selector + '\'',
          expected: '>0 matches for \'' + selector + '\'',
          message: message
        });
        return found;
      }).apply(this, arguments);
    };

    QUnit.assert.hasNoElement = function (selector) {
      var message = arguments.length <= 1 || arguments[1] === undefined ? 'hasNoElement "' + selector + '"' : arguments[1];
      return (function () {
        var found = $(selector);
        this.pushResult({
          result: found.length === 0,
          actual: found.length + ' matches for \'' + selector + '\'',
          expected: '0 matches for \'' + selector + '\'',
          message: message
        });
        return found;
      }).apply(this, arguments);
    };

    QUnit.assert.hasClass = function (element, className) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? 'element has class "' + className + '"' : arguments[2];
      return (function () {
        this.pushResult({
          result: element.classList.contains(className),
          actual: element.classList,
          expected: className,
          message: message
        });
      }).apply(this, arguments);
    };

    QUnit.assert.notHasClass = function (element, className) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? 'element has class "' + className + '"' : arguments[2];
      return (function () {
        this.pushResult({
          result: !element.classList.contains(className),
          actual: element.classList,
          expected: className,
          message: message
        });
      }).apply(this, arguments);
    };

    QUnit.assert.selectedText = function (text) {
      var message = arguments.length <= 1 || arguments[1] === undefined ? 'selectedText "' + text + '"' : arguments[1];
      return (function () {
        var selected = _dom['default'].getSelectedText();
        this.pushResult({
          result: selected === text,
          actual: selected,
          expected: text,
          message: message
        });
      }).apply(this, arguments);
    };

    QUnit.assert.inArray = function (element, array) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? 'has "' + element + '" in "' + array + '"' : arguments[2];
      return (function () {
        QUnit.assert.ok(array.indexOf(element) !== -1, message);
      })();
    };

    QUnit.assert.postIsSimilar = function (post, expected) {
      var postName = arguments.length <= 2 || arguments[2] === undefined ? 'post' : arguments[2];

      comparePostNode(post, expected, this, postName, true);
      var mobiledoc = _mobiledocKitRenderersMobiledoc['default'].render(post),
          expectedMobiledoc = _mobiledocKitRenderersMobiledoc['default'].render(expected);
      this.deepEqual(mobiledoc, expectedMobiledoc, postName + ' is similar to expected');
    };

    QUnit.assert.renderTreeIsEqual = function (renderTree, expectedPost) {
      var _this = this;

      if (renderTree.rootNode.isDirty) {
        this.ok(false, 'renderTree is dirty');
        return;
      }

      expectedPost.sections.forEach(function (section, index) {
        var renderNode = renderTree.rootNode.childNodes.objectAt(index);
        var path = 'post:' + index;

        var compareChildren = function compareChildren(parentPostNode, parentRenderNode, path) {
          var children = parentPostNode.markers || parentPostNode.items || [];

          if (children.length !== parentRenderNode.childNodes.length) {
            _this.equal(parentRenderNode.childNodes.length, children.length, 'wrong child render nodes at ' + path);
            return;
          }

          children.forEach(function (child, index) {
            var renderNode = parentRenderNode.childNodes.objectAt(index);

            comparePostNode(child, renderNode && renderNode.postNode, _this, path + ':' + index, false);
            compareChildren(child, renderNode, path + ':' + index);
          });
        };

        comparePostNode(section, renderNode.postNode, _this, path, false);
        compareChildren(section, renderNode, path);
      });

      this.ok(true, 'renderNode is similar');
    };

    QUnit.assert.positionIsEqual = function (position, expected) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? 'position is equal' : arguments[2];

      if (position.section !== expected.section) {
        this.pushResult({
          result: false,
          actual: position.section.type + ':' + position.section.tagName,
          expected: expected.section.type + ':' + expected.section.tagName,
          message: 'incorrect position section (' + message + ')'
        });
      } else if (position.offset !== expected.offset) {
        this.pushResult({
          result: false,
          actual: position.offset,
          expected: expected.offset,
          message: 'incorrect position offset (' + message + ')'
        });
      } else {
        this.pushResult({
          result: true,
          actual: position,
          expected: expected,
          message: message
        });
      }
    };

    QUnit.assert.rangeIsEqual = function (range, expected) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? 'range is equal' : arguments[2];
      var head = range.head;
      var tail = range.tail;
      var isCollapsed = range.isCollapsed;
      var direction = range.direction;
      var expectedHead = expected.head;
      var expectedTail = expected.tail;
      var expectedIsCollapsed = expected.isCollapsed;
      var expectedDirection = expected.direction;

      var failed = false;

      if (!head.isEqual(expectedHead)) {
        failed = true;
        this.pushResult({
          result: false,
          actual: head.section.type + ':' + head.section.tagName,
          expected: expectedHead.section.type + ':' + expectedHead.section.tagName,
          message: 'incorrect head position'
        });
      }

      if (!tail.isEqual(expectedTail)) {
        failed = true;
        this.pushResult({
          result: false,
          actual: tail.section.type + ':' + tail.section.tagName,
          expected: expectedTail.section.type + ':' + expectedTail.section.tagName,
          message: 'incorrect tail position'
        });
      }

      if (isCollapsed !== expectedIsCollapsed) {
        failed = true;
        this.pushResult({
          result: false,
          actual: isCollapsed,
          expected: expectedIsCollapsed,
          message: 'wrong value for isCollapsed'
        });
      }

      if (direction !== expectedDirection) {
        failed = true;
        this.pushResult({
          result: false,
          actual: direction,
          expected: expectedDirection,
          message: 'wrong value for direction'
        });
      }

      if (!failed) {
        this.pushResult({
          result: true,
          actual: range,
          expected: expected,
          message: message
        });
      }
    };
  }
});
define("tests/helpers/browsers", ["exports"], function (exports) {
  "use strict";

  exports.detectIE = detectIE;
  exports.detectIE11 = detectIE11;
  exports.supportsSelectionExtend = supportsSelectionExtend;

  function detectIE() {
    var userAgent = navigator.userAgent;
    return userAgent.indexOf("MSIE ") !== -1 || userAgent.indexOf("Trident/") !== -1 || userAgent.indexOf('Edge/') !== -1;
  }

  function detectIE11() {
    return detectIE() && navigator.userAgent.indexOf("rv:11.0") !== -1;
  }

  function supportsSelectionExtend() {
    var selection = window.getSelection();
    return !!selection.extend;
  }
});
define('tests/helpers/dom', ['exports', 'mobiledoc-kit/utils/selection-utils', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/utils/keycodes', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/utils/merge', 'mobiledoc-kit', 'mobiledoc-kit/utils/parse-utils', 'mobiledoc-kit/utils/string-utils'], function (exports, _mobiledocKitUtilsSelectionUtils, _mobiledocKitUtilsArrayUtils, _mobiledocKitUtilsKeycodes, _mobiledocKitUtilsKey, _mobiledocKitUtilsDomUtils, _mobiledocKitUtilsMerge, _mobiledocKit, _mobiledocKitUtilsParseUtils, _mobiledocKitUtilsStringUtils) {
  'use strict';

  function assertEditor(editor) {
    if (!(editor instanceof _mobiledocKit.Editor)) {
      throw new Error('Must pass editor as first argument');
    }
  }

  // walks DOWN the dom from node to childNodes, returning the element
  // for which `conditionFn(element)` is true
  function walkDOMUntil(topNode) {
    var conditionFn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    if (!topNode) {
      throw new Error('Cannot call walkDOMUntil without a node');
    }
    var stack = [topNode];
    var currentElement = undefined;

    while (stack.length) {
      currentElement = stack.pop();

      if (conditionFn(currentElement)) {
        return currentElement;
      }

      (0, _mobiledocKitUtilsArrayUtils.forEach)(currentElement.childNodes, function (el) {
        return stack.push(el);
      });
    }
  }

  function findTextNode(parentElement, text) {
    return walkDOMUntil(parentElement, function (node) {
      return (0, _mobiledocKitUtilsDomUtils.isTextNode)(node) && node.textContent.indexOf(text) !== -1;
    });
  }

  function selectRange(startNode, startOffset, endNode, endOffset) {
    (0, _mobiledocKitUtilsSelectionUtils.clearSelection)();

    var range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    var selection = window.getSelection();
    selection.addRange(range);
  }

  function selectText(editor, startText) {
    var startContainingElement = arguments.length <= 2 || arguments[2] === undefined ? editor.element : arguments[2];
    var endText = arguments.length <= 3 || arguments[3] === undefined ? startText : arguments[3];
    var endContainingElement = arguments.length <= 4 || arguments[4] === undefined ? startContainingElement : arguments[4];
    return (function () {

      assertEditor(editor);
      var startTextNode = findTextNode(startContainingElement, startText);
      var endTextNode = findTextNode(endContainingElement, endText);

      if (!startTextNode) {
        throw new Error('Could not find a starting textNode containing "' + startText + '"');
      }
      if (!endTextNode) {
        throw new Error('Could not find an ending textNode containing "' + endText + '"');
      }

      var startOffset = startTextNode.textContent.indexOf(startText),
          endOffset = endTextNode.textContent.indexOf(endText) + endText.length;
      selectRange(startTextNode, startOffset, endTextNode, endOffset);
      editor._readRangeFromDOM();
    })();
  }

  function moveCursorWithoutNotifyingEditorTo(editor, node) {
    var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var endNode = arguments.length <= 3 || arguments[3] === undefined ? node : arguments[3];
    var endOffset = arguments.length <= 4 || arguments[4] === undefined ? offset : arguments[4];
    return (function () {
      selectRange(node, offset, endNode, endOffset);
    })();
  }

  function moveCursorTo(editor, node) {
    var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var endNode = arguments.length <= 3 || arguments[3] === undefined ? node : arguments[3];
    var endOffset = arguments.length <= 4 || arguments[4] === undefined ? offset : arguments[4];
    return (function () {
      assertEditor(editor);
      if (!node) {
        throw new Error('Cannot moveCursorTo node without node');
      }
      moveCursorWithoutNotifyingEditorTo(editor, node, offset, endNode, endOffset);
      editor._readRangeFromDOM();
    })();
  }

  function triggerEvent(node, eventType) {
    if (!node) {
      throw new Error('Attempted to trigger event "' + eventType + '" on undefined node');
    }

    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    return node.dispatchEvent(clickEvent);
  }

  function _triggerEditorEvent(editor, event) {
    editor.triggerEvent(editor.element, event.type, event);
  }

  function _buildDOM(tagName) {
    var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var children = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    var el = document.createElement(tagName);
    Object.keys(attributes).forEach(function (k) {
      return el.setAttribute(k, attributes[k]);
    });
    children.forEach(function (child) {
      return el.appendChild(child);
    });
    return el;
  }

  _buildDOM.text = function (string) {
    return document.createTextNode(string);
  };

  /**
   * Usage:
   * build(t =>
   *   t('div', attributes={}, children=[
   *     t('b', {}, [
   *       t.text('I am a bold text node')
   *     ])
   *   ])
   * );
   */
  function build(tree) {
    return tree(_buildDOM);
  }

  function getSelectedText() {
    var selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    } else if (selection.rangeCount > 1) {
      // FIXME?
      throw new Error('Unable to get selected text for multiple ranges');
    } else {
      return selection.toString();
    }
  }

  // returns the node and the offset that the cursor is on
  function getCursorPosition() {
    var selection = window.getSelection();
    return {
      node: selection.anchorNode,
      offset: selection.anchorOffset
    };
  }

  function createMockEvent(eventName, element) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var event = {
      type: eventName,
      preventDefault: function preventDefault() {},
      target: element
    };
    (0, _mobiledocKitUtilsMerge.merge)(event, options);
    return event;
  }

  // options is merged into the mocked `KeyboardEvent` data.
  // Useful for simulating modifier keys, eg:
  // triggerDelete(editor, DIRECTION.BACKWARD, {altKey: true})
  function triggerDelete(editor) {
    var direction = arguments.length <= 1 || arguments[1] === undefined ? _mobiledocKitUtilsKey.DIRECTION.BACKWARD : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    assertEditor(editor);
    var keyCode = direction === _mobiledocKitUtilsKey.DIRECTION.BACKWARD ? _mobiledocKitUtilsKeycodes['default'].BACKSPACE : _mobiledocKitUtilsKeycodes['default'].DELETE;
    var eventOptions = (0, _mobiledocKitUtilsMerge.merge)({ keyCode: keyCode }, options);
    var event = createMockEvent('keydown', editor.element, eventOptions);
    _triggerEditorEvent(editor, event);
  }

  function triggerForwardDelete(editor, options) {
    return triggerDelete(editor, _mobiledocKitUtilsKey.DIRECTION.FORWARD, options);
  }

  function triggerEnter(editor) {
    assertEditor(editor);
    var event = createMockEvent('keydown', editor.element, { keyCode: _mobiledocKitUtilsKeycodes['default'].ENTER });
    _triggerEditorEvent(editor, event);
  }

  // keyCodes and charCodes are similar but not the same.
  function keyCodeForChar(letter) {
    var keyCode = undefined;
    switch (letter) {
      case '.':
        keyCode = _mobiledocKitUtilsKeycodes['default']['.'];
        break;
      case '\n':
        keyCode = _mobiledocKitUtilsKeycodes['default'].ENTER;
        break;
      default:
        keyCode = letter.charCodeAt(0);
    }
    return keyCode;
  }

  function insertText(editor, string) {
    if (!string && editor) {
      throw new Error('Must pass `editor` to `insertText`');
    }

    string.split('').forEach(function (letter) {
      var stop = false;
      var keyCode = keyCodeForChar(letter);
      var charCode = letter.charCodeAt(0);
      var preventDefault = function preventDefault() {
        return stop = true;
      };
      var keydown = createMockEvent('keydown', editor.element, {
        keyCode: keyCode,
        charCode: charCode,
        preventDefault: preventDefault
      });
      var keypress = createMockEvent('keypress', editor.element, {
        keyCode: keyCode,
        charCode: charCode
      });
      var keyup = createMockEvent('keyup', editor.element, {
        keyCode: keyCode,
        charCode: charCode,
        preventDefault: preventDefault
      });

      _triggerEditorEvent(editor, keydown);
      if (stop) {
        return;
      }
      _triggerEditorEvent(editor, keypress);
      if (stop) {
        return;
      }
      _triggerEditorEvent(editor, keyup);
    });
  }

  function triggerKeyEvent(editor, type, options) {
    var event = createMockEvent(type, editor.element, options);
    _triggerEditorEvent(editor, event);
  }

  // triggers a key sequence like cmd-B on the editor, to test out
  // registered keyCommands
  function triggerKeyCommand(editor, string) {
    var modifiers = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    if (typeof modifiers === "number") {
      modifiers = [modifiers]; // convert singular to array
    }
    var charCode = _mobiledocKitUtilsKeycodes['default'][string] || string.toUpperCase().charCodeAt(0);
    var keyCode = charCode;
    var keyEvent = createMockEvent('keydown', editor.element, {
      charCode: charCode,
      keyCode: keyCode,
      shiftKey: (0, _mobiledocKitUtilsArrayUtils.contains)(modifiers, _mobiledocKitUtilsKey.MODIFIERS.SHIFT),
      metaKey: (0, _mobiledocKitUtilsArrayUtils.contains)(modifiers, _mobiledocKitUtilsKey.MODIFIERS.META),
      ctrlKey: (0, _mobiledocKitUtilsArrayUtils.contains)(modifiers, _mobiledocKitUtilsKey.MODIFIERS.CTRL)
    });
    _triggerEditorEvent(editor, keyEvent);
  }

  function triggerRightArrowKey(editor, modifier) {
    if (!(editor instanceof _mobiledocKit.Editor)) {
      throw new Error('Must pass editor to triggerRightArrowKey');
    }
    var keydown = createMockEvent('keydown', editor.element, {
      keyCode: _mobiledocKitUtilsKeycodes['default'].RIGHT,
      shiftKey: modifier === _mobiledocKitUtilsKey.MODIFIERS.SHIFT
    });
    var keyup = createMockEvent('keyup', editor.element, {
      keyCode: _mobiledocKitUtilsKeycodes['default'].RIGHT,
      shiftKey: modifier === _mobiledocKitUtilsKey.MODIFIERS.SHIFT
    });
    _triggerEditorEvent(editor, keydown);
    _triggerEditorEvent(editor, keyup);
  }

  function triggerLeftArrowKey(editor, modifier) {
    assertEditor(editor);
    var keydown = createMockEvent('keydown', editor.element, {
      keyCode: _mobiledocKitUtilsKeycodes['default'].LEFT,
      shiftKey: modifier === _mobiledocKitUtilsKey.MODIFIERS.SHIFT
    });
    var keyup = createMockEvent('keyup', editor.element, {
      keyCode: _mobiledocKitUtilsKeycodes['default'].LEFT,
      shiftKey: modifier === _mobiledocKitUtilsKey.MODIFIERS.SHIFT
    });
    _triggerEditorEvent(editor, keydown);
    _triggerEditorEvent(editor, keyup);
  }

  // Allows our fake copy and paste events to communicate with each other.
  var lastCopyData = {};
  function triggerCopyEvent(editor) {
    var eventData = {
      clipboardData: {
        setData: function setData(type, value) {
          lastCopyData[type] = value;
        }
      }
    };

    var event = createMockEvent('copy', editor.element, eventData);
    _triggerEditorEvent(editor, event);
  }

  function triggerCutEvent(editor) {
    var event = createMockEvent('cut', editor.element, {
      clipboardData: {
        setData: function setData(type, value) {
          lastCopyData[type] = value;
        }
      }
    });
    _triggerEditorEvent(editor, event);
  }

  function triggerPasteEvent(editor) {
    var eventData = {
      clipboardData: {
        getData: function getData(type) {
          return lastCopyData[type];
        }
      }
    };

    var event = createMockEvent('paste', editor.element, eventData);
    _triggerEditorEvent(editor, event);
  }

  function triggerDropEvent(editor, _ref) {
    var html = _ref.html;
    var text = _ref.text;
    var clientX = _ref.clientX;
    var clientY = _ref.clientY;

    if (!clientX || !clientY) {
      throw new Error('Must pass clientX, clientY');
    }
    var event = createMockEvent('drop', editor.element, {
      clientX: clientX,
      clientY: clientY,
      dataTransfer: {
        getData: function getData(mimeType) {
          switch (mimeType) {
            case _mobiledocKitUtilsParseUtils.MIME_TEXT_HTML:
              return html;
            case _mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN:
              return text;
            default:
              throw new Error('invalid mime type ' + mimeType);
          }
        }
      }
    });

    _triggerEditorEvent(editor, event);
  }

  function getCopyData(type) {
    return lastCopyData[type];
  }

  function setCopyData(type, value) {
    lastCopyData[type] = value;
  }

  function clearCopyData() {
    Object.keys(lastCopyData).forEach(function (key) {
      delete lastCopyData[key];
    });
  }

  function fromHTML(html) {
    html = $.trim(html);
    var div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }

  /**
   * Tests fail in IE when using `element.blur`, so remove focus by refocusing
   * on another item instead of blurring the editor element
   */
  function blur() {
    var input = $('<input>');
    input.appendTo('#qunit-fixture');
    input.focus();
  }

  function getData(element, name) {
    if (element.dataset) {
      return element.dataset[name];
    } else {
      return element.getAttribute((0, _mobiledocKitUtilsStringUtils.dasherize)(name));
    }
  }

  var DOMHelper = {
    moveCursorTo: moveCursorTo,
    moveCursorWithoutNotifyingEditorTo: moveCursorWithoutNotifyingEditorTo,
    selectRange: selectRange,
    selectText: selectText,
    clearSelection: _mobiledocKitUtilsSelectionUtils.clearSelection,
    triggerEvent: triggerEvent,
    build: build,
    fromHTML: fromHTML,
    KEY_CODES: _mobiledocKitUtilsKeycodes['default'],
    getCursorPosition: getCursorPosition,
    getSelectedText: getSelectedText,
    triggerDelete: triggerDelete,
    triggerForwardDelete: triggerForwardDelete,
    triggerEnter: triggerEnter,
    insertText: insertText,
    triggerKeyEvent: triggerKeyEvent,
    triggerKeyCommand: triggerKeyCommand,
    triggerRightArrowKey: triggerRightArrowKey,
    triggerLeftArrowKey: triggerLeftArrowKey,
    triggerCopyEvent: triggerCopyEvent,
    triggerCutEvent: triggerCutEvent,
    triggerPasteEvent: triggerPasteEvent,
    triggerDropEvent: triggerDropEvent,
    getCopyData: getCopyData,
    setCopyData: setCopyData,
    clearCopyData: clearCopyData,
    createMockEvent: createMockEvent,
    findTextNode: findTextNode,
    blur: blur,
    getData: getData
  };

  exports.triggerEvent = triggerEvent;
  exports['default'] = DOMHelper;
});
define('tests/helpers/editor', ['exports', './post-abstract', 'mobiledoc-kit/editor/editor', 'mobiledoc-kit/renderers/mobiledoc/0-3-1'], function (exports, _postAbstract, _mobiledocKitEditorEditor, _mobiledocKitRenderersMobiledoc031) {
  'use strict';

  function retargetPosition(position, toPost) {
    var fromPost = position.section.post;
    var sectionIndex = undefined;
    var retargetedPosition = undefined;
    fromPost.walkAllLeafSections(function (section, index) {
      if (sectionIndex !== undefined) {
        return;
      }
      if (section === position.section) {
        sectionIndex = index;
      }
    });
    if (sectionIndex === undefined) {
      throw new Error('`retargetPosition` could not find section index');
    }
    toPost.walkAllLeafSections(function (section, index) {
      if (retargetedPosition) {
        return;
      }
      if (index === sectionIndex) {
        retargetedPosition = section.toPosition(position.offset);
      }
    });
    if (!retargetedPosition) {
      throw new Error('`retargetPosition` could not find target section');
    }
    return retargetedPosition;
  }

  function retargetRange(range, toPost) {
    var newHead = retargetPosition(range.head, toPost);
    var newTail = retargetPosition(range.tail, toPost);

    return newHead.toRange(newTail);
  }

  function buildFromText(texts) {
    var editorOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var renderElement = editorOptions.element;
    delete editorOptions.element;

    var beforeRender = editorOptions.beforeRender || function () {};
    delete editorOptions.beforeRender;

    var _PostAbstractHelpers$buildFromText = _postAbstract['default'].buildFromText(texts);

    var post = _PostAbstractHelpers$buildFromText.post;
    var range = _PostAbstractHelpers$buildFromText.range;

    var mobiledoc = _mobiledocKitRenderersMobiledoc031['default'].render(post);
    editorOptions.mobiledoc = mobiledoc;
    var editor = new _mobiledocKitEditorEditor['default'](editorOptions);
    if (renderElement) {
      beforeRender(editor);
      editor.render(renderElement);
      if (range) {
        range = retargetRange(range, editor.post);
        editor.selectRange(range);
      }
    }
    return editor;
  }

  exports.buildFromText = buildFromText;
  exports.retargetRange = retargetRange;
  exports.retargetPosition = retargetPosition;
});
define('tests/helpers/mobiledoc', ['exports', './post-abstract', 'mobiledoc-kit/renderers/mobiledoc', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/renderers/mobiledoc/0-3', 'mobiledoc-kit/renderers/mobiledoc/0-3-1', 'mobiledoc-kit/renderers/mobiledoc/0-3-2', 'mobiledoc-kit/editor/editor', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/merge'], function (exports, _postAbstract, _mobiledocKitRenderersMobiledoc, _mobiledocKitRenderersMobiledoc02, _mobiledocKitRenderersMobiledoc03, _mobiledocKitRenderersMobiledoc031, _mobiledocKitRenderersMobiledoc032, _mobiledocKitEditorEditor, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsMerge) {
  'use strict';

  /*
   * usage:
   *  build(({post, section, marker, markup}) =>
   *    post([
   *      section('P', [
   *        marker('some text', [markup('B')])
   *      ])
   *    })
   *  )
   *  @return Mobiledoc
   */
  function build(treeFn, version) {
    var post = _postAbstract['default'].build(treeFn);
    switch (version) {
      case _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION:
        return _mobiledocKitRenderersMobiledoc02['default'].render(post);
      case _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION:
        return _mobiledocKitRenderersMobiledoc03['default'].render(post);
      case _mobiledocKitRenderersMobiledoc031.MOBILEDOC_VERSION:
        return _mobiledocKitRenderersMobiledoc031['default'].render(post);
      case _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION:
        return _mobiledocKitRenderersMobiledoc032['default'].render(post);
      case undefined:
      case null:
        return _mobiledocKitRenderersMobiledoc['default'].render(post);
      default:
        throw new Error('Unknown version of mobiledoc renderer requested: ' + version);
    }
  }

  function renderPostInto(element, post) {
    var editorOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var mobiledoc = _mobiledocKitRenderersMobiledoc['default'].render(post);
    (0, _mobiledocKitUtilsMerge.mergeWithOptions)(editorOptions, { mobiledoc: mobiledoc });
    var editor = new _mobiledocKitEditorEditor['default'](editorOptions);
    editor.render(element);
    return editor;
  }

  function renderInto(element, treeFn) {
    var editorOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var mobiledoc = build(treeFn);
    (0, _mobiledocKitUtilsMerge.mergeWithOptions)(editorOptions, { mobiledoc: mobiledoc });
    var editor = new _mobiledocKitEditorEditor['default'](editorOptions);
    editor.render(element);
    return editor;
  }

  // In Firefox, if the window isn't active (which can happen when running tests
  // at SauceLabs), the editor element won't have the selection. This helper method
  // ensures that it has a cursor selection.
  // See https://github.com/bustle/mobiledoc-kit/issues/388
  function renderIntoAndFocusTail(editorElement, treeFn) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var editor = renderInto(editorElement, treeFn, options);
    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
    return editor;
  }

  exports['default'] = {
    build: build,
    renderInto: renderInto,
    renderPostInto: renderPostInto,
    renderIntoAndFocusTail: renderIntoAndFocusTail
  };
});
define('tests/helpers/mock-editor', ['exports', 'mobiledoc-kit/editor/post', 'mobiledoc-kit/utils/cursor/range'], function (exports, _mobiledocKitEditorPost, _mobiledocKitUtilsCursorRange) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var MockEditor = (function () {
    function MockEditor(builder) {
      _classCallCheck(this, MockEditor);

      this.builder = builder;
      this.range = _mobiledocKitUtilsCursorRange['default'].blankRange();
    }

    _createClass(MockEditor, [{
      key: 'run',
      value: function run(callback) {
        var postEditor = new _mobiledocKitEditorPost['default'](this);
        postEditor.begin();
        var result = callback(postEditor);
        postEditor.end();
        return result;
      }
    }, {
      key: 'rerender',
      value: function rerender() {}
    }, {
      key: '_postDidChange',
      value: function _postDidChange() {}
    }, {
      key: 'selectRange',
      value: function selectRange(range) {
        this._renderedRange = range;
      }
    }, {
      key: '_readRangeFromDOM',
      value: function _readRangeFromDOM() {}
    }]);

    return MockEditor;
  })();

  exports['default'] = MockEditor;
});
define('tests/helpers/module-load-failure', ['exports', 'ember-cli/test-loader'], function (exports, _emberCliTestLoader) {
  'use strict';

  /**
   * Ensures that when the TestLoader failures to load a test module, the error
   * is reported. Without this the rest of the full test suite still passes and there is an
   * error printed in the console only.
   * The technique is from: https://github.com/ember-cli/ember-cli-qunit/blob/master/vendor/ember-cli-qunit/test-loader.js#L55
   */

  exports['default'] = function (QUnit) {
    var moduleLoadFailures = [];

    _emberCliTestLoader['default'].prototype.moduleLoadFailure = function (moduleName, error) {
      moduleLoadFailures.push(error);
      QUnit.module('TestLoader Failures');
      QUnit.test(moduleName + ': could not be loaded', function () {
        throw error;
      });
    };

    QUnit.done(function () {
      if (moduleLoadFailures.length) {
        throw new Error('\n' + moduleLoadFailures.join('\n'));
      }
    });
  };
});
define('tests/helpers/post-abstract', ['exports', 'mobiledoc-kit/models/post-node-builder'], function (exports, _mobiledocKitModelsPostNodeBuilder) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  /*
   * usage:
   *  Helpers.postAbstract.build(({post, section, marker, markup}) =>
   *    post([
   *      section('P', [
   *        marker('some text', [markup('B')])
   *      ])
   *    })
   *  )
   */
  function build(treeFn) {
    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();

    var simpleBuilder = {
      post: function post() {
        return builder.createPost.apply(builder, arguments);
      },
      markupSection: function markupSection() {
        return builder.createMarkupSection.apply(builder, arguments);
      },
      markup: function markup() {
        return builder.createMarkup.apply(builder, arguments);
      },
      marker: function marker() {
        return builder.createMarker.apply(builder, arguments);
      },
      listSection: function listSection() {
        return builder.createListSection.apply(builder, arguments);
      },
      listItem: function listItem() {
        return builder.createListItem.apply(builder, arguments);
      },
      cardSection: function cardSection() {
        return builder.createCardSection.apply(builder, arguments);
      },
      imageSection: function imageSection() {
        return builder.createImageSection.apply(builder, arguments);
      },
      atom: function atom() {
        return builder.createAtom.apply(builder, arguments);
      }
    };

    return treeFn(simpleBuilder);
  }

  var cardRegex = /\[(.*)\]/;
  var markupRegex = /\*/g;
  var listStartRegex = /^\* /;
  var cursorRegex = /<|>|\|/g;

  function parsePositionOffsets(text) {
    var offsets = {};

    if (cardRegex.test(text)) {
      [['|', 'solo'], ['<', 'start'], ['>', 'end']].forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var char = _ref2[0];
        var type = _ref2[1];

        if (text.indexOf(char) !== -1) {
          offsets[type] = text.indexOf(char) === 0 ? 0 : 1;
        }
      });
    } else {
      if (listStartRegex.test(text)) {
        text = text.replace(listStartRegex, '');
      }
      text = text.replace(markupRegex, '');
      if (text.indexOf('|') !== -1) {
        offsets.solo = text.indexOf('|');
      } else if (text.indexOf('<') !== -1 || text.indexOf('>') !== -1) {
        var hasStart = text.indexOf('<') !== -1;
        var hasEnd = text.indexOf('>') !== -1;
        if (hasStart) {
          offsets.start = text.indexOf('<');
          text = text.replace(/</g, '');
        }
        if (hasEnd) {
          offsets.end = text.indexOf('>');
        }
      }
    }

    return offsets;
  }

  var DEFAULT_ATOM_NAME = 'some-atom';
  var DEFAULT_ATOM_VALUE = '@atom';

  var MARKUP_CHARS = {
    '*': 'b',
    '_': 'em'
  };

  function parseTextIntoAtom(text, builder) {
    var markers = [];
    var atomIndex = text.indexOf('@');
    var afterAtomIndex = atomIndex + 1;
    var atomName = DEFAULT_ATOM_NAME,
        atomValue = DEFAULT_ATOM_VALUE,
        atomPayload = {};

    // If "@" is followed by "( ... json ... )", parse the json data
    if (text[atomIndex + 1] === "(") {
      var jsonStartIndex = atomIndex + 1;
      var jsonEndIndex = text.indexOf(")", jsonStartIndex);
      afterAtomIndex = jsonEndIndex + 1;
      if (jsonEndIndex === -1) {
        throw new Error('Atom JSON data had unmatched "(": ' + text);
      }
      var jsonString = text.slice(jsonStartIndex + 1, jsonEndIndex);
      jsonString = "{" + jsonString + "}";
      try {
        var json = JSON.parse(jsonString);
        if (json.name) {
          atomName = json.name;
        }
        if (json.value) {
          atomValue = json.value;
        }
        if (json.payload) {
          atomPayload = json.payload;
        }
      } catch (e) {
        throw new Error('Failed to parse atom JSON data string: ' + jsonString + ', ' + e);
      }
    }

    // create the atom
    var atom = builder.atom(atomName, atomValue, atomPayload);

    // recursively parse the remaining text pieces
    var pieces = [text.slice(0, atomIndex), atom, text.slice(afterAtomIndex)];

    // join the markers together
    pieces.forEach(function (piece, index) {
      if (index === 1) {
        // atom
        markers.push(piece);
      } else if (piece.length) {
        markers = markers.concat(parseTextIntoMarkers(piece, builder));
      }
    });

    return markers;
  }

  function parseTextWithMarkup(text, builder) {
    var markers = [];
    var markup = undefined,
        char = undefined;
    Object.keys(MARKUP_CHARS).forEach(function (key) {
      if (markup) {
        return;
      }
      if (text.indexOf(key) !== -1) {
        markup = builder.markup(MARKUP_CHARS[key]);
        char = key;
      }
    });
    if (!markup) {
      throw new Error('Failed to find markup in text: ' + text);
    }

    var startIndex = text.indexOf(char);
    var endIndex = text.indexOf(char, startIndex + 1);
    if (endIndex === -1) {
      throw new Error('Malformed text: char ' + char + ' do not match');
    }

    var pieces = [text.slice(0, startIndex), text.slice(startIndex + 1, endIndex), text.slice(endIndex + 1)];
    pieces.forEach(function (piece, index) {
      if (index === 1) {
        // marked-up text
        markers.push(builder.marker(piece, [markup]));
      } else {
        markers = markers.concat(parseTextIntoMarkers(piece, builder));
      }
    });

    return markers;
  }

  function parseTextIntoMarkers(text, builder) {
    text = text.replace(cursorRegex, '');
    var markers = [];

    var hasAtom = text.indexOf('@') !== -1;
    var hasMarkup = false;
    Object.keys(MARKUP_CHARS).forEach(function (key) {
      if (text.indexOf(key) !== -1) {
        hasMarkup = true;
      }
    });

    if (hasAtom) {
      markers = markers.concat(parseTextIntoAtom(text, builder));
    } else if (hasMarkup) {
      markers = markers.concat(parseTextWithMarkup(text, builder));
    } else if (text.length) {
      markers.push(builder.marker(text));
    }

    return markers;
  }

  function parseSingleText(text, builder) {
    var section = undefined,
        positions = {};

    var offsets = parsePositionOffsets(text);

    if (cardRegex.test(text)) {
      section = builder.cardSection(cardRegex.exec(text)[1]);
    } else {
      var type = 'p';
      if (listStartRegex.test(text)) {
        text = text.replace(listStartRegex, '');
        type = 'ul';
      }

      var markers = parseTextIntoMarkers(text, builder);

      switch (type) {
        case 'p':
          section = builder.markupSection('p', markers);
          break;
        case 'ul':
          section = builder.listItem(markers);
          break;
      }
    }

    ['start', 'end', 'solo'].forEach(function (type) {
      if (offsets[type] !== undefined) {
        positions[type] = section.toPosition(offsets[type]);
      }
    });

    return { section: section, positions: positions };
  }

  /**
   * Shorthand to create a mobiledoc simply.
   * Pass a string or an array of strings.
   *
   * Returns { post, range }, a post built from the mobiledoc and a range.
   *
   * Use "|" to indicate the cursor position or "<" and ">" to indicate a range.
   * Use "[card-name]" to indicate a card
   * Use asterisks to indicate bold text: "abc *bold* def"
   * Use "@" to indicate an atom, default values for name,value,payload are DEFAULT_ATOM_NAME,DEFAULT_ATOM_VALUE,{}
   * Use "@(name, value, payload)" to specify name,value and/or payload for an atom. The string from `(` to `)` is parsed as
   *   JSON, e.g.: '@("name": "my-atom", "value": "abc", "payload": {"foo": "bar"})' -> atom named "my-atom" with value 'abc', payload {foo: 'bar'}
   * Use "* " at the start of the string to indicate a list item ("ul")
   *
   * Examples:
   * buildFromText("abc") -> { post } with 1 markup section ("p") with text "abc"
   * buildFromText(["abc","def"]) -> { post } with 2 markups sections ("p") with texts "abc" and "def"
   * buildFromText("abc|def") -> { post, range } where range is collapsed at offset 3 (after the "c")
   * buildFromText(["abcdef","[some-card]","def"]) -> { post } with [MarkupSection, Card, MarkupSection] sections
   * buildFromText(["* item 1", "* item 2"]) -> { post } with a ListSection with 2 ListItems
   * buildFromText(["<abc", "def", "ghi>"]) -> { post, range } where range is the entire post (before the "a" to after the "i")
   */
  function buildFromText(texts) {
    if (!Array.isArray(texts)) {
      texts = [texts];
    }
    var positions = {};

    var post = build(function (builder) {
      var sections = [];
      var curList = undefined;
      texts.forEach(function (text, index) {
        var _parseSingleText = parseSingleText(text, builder);

        var section = _parseSingleText.section;
        var _positions = _parseSingleText.positions;

        var lastText = index === texts.length - 1;

        if (curList) {
          if (section.isListItem) {
            curList.items.append(section);
          } else {
            sections.push(curList);
            sections.push(section);
            curList = null;
          }
        } else if (section.isListItem) {
          curList = builder.listSection('ul', [section]);
        } else {
          sections.push(section);
        }

        if (lastText && curList) {
          sections.push(curList);
        }

        if (_positions.start) {
          positions.start = _positions.start;
        }
        if (_positions.end) {
          positions.end = _positions.end;
        }
        if (_positions.solo) {
          positions.solo = _positions.solo;
        }
      });

      return builder.post(sections);
    });

    var range = undefined;
    if (positions.start) {
      if (!positions.end) {
        throw new Error('startPos but no endPos ' + texts.join('\n'));
      }
      range = positions.start.toRange(positions.end);
    } else if (positions.solo) {
      range = positions.solo.toRange();
    }

    return { post: post, range: range };
  }

  exports['default'] = {
    build: build,
    buildFromText: buildFromText,
    DEFAULT_ATOM_NAME: DEFAULT_ATOM_NAME
  };
});
define('tests/helpers/post-editor-run', ['exports', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/editor/post', './mock-editor', './render-built-abstract'], function (exports, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitEditorPost, _mockEditor, _renderBuiltAbstract) {
  'use strict';

  exports['default'] = run;

  function run(post, callback) {
    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    var editor = new _mockEditor['default'](builder);

    (0, _renderBuiltAbstract['default'])(post, editor);

    var postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.begin();
    var result = callback(postEditor);
    postEditor.complete();
    return result;
  }
});
define('tests/helpers/render-built-abstract', ['exports', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/models/render-tree'], function (exports, _mobiledocKitRenderersEditorDom, _mobiledocKitModelsRenderTree) {
  'use strict';

  exports['default'] = renderBuiltAbstract;

  function renderBuiltAbstract(post, editor) {
    editor.post = post;
    var unknownCardHandler = function unknownCardHandler() {};
    var unknownAtomHandler = function unknownAtomHandler() {};
    var renderer = new _mobiledocKitRenderersEditorDom['default'](editor, [], [], unknownCardHandler, unknownAtomHandler);
    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    renderer.render(renderTree);
    return editor;
  }
});
define('tests/helpers/sections', ['exports'], function (exports) {
  'use strict';

  var VALID_ATTRIBUTES = [{ key: 'data-md-text-align', value: 'center' }, { key: 'data-md-text-align', value: 'justify' }, { key: 'data-md-text-align', value: 'left' }, { key: 'data-md-text-align', value: 'right' }];

  exports.VALID_ATTRIBUTES = VALID_ATTRIBUTES;
  var INVALID_ATTRIBUTES = [{ key: 'data-foo', value: 'baz' }];
  exports.INVALID_ATTRIBUTES = INVALID_ATTRIBUTES;
});
define("tests/helpers/wait", ["exports"], function (exports) {
  "use strict";

  var wait = function wait(callback) {
    window.requestAnimationFrame(callback);
  };

  exports["default"] = wait;
});
define('tests/test-helpers', ['exports', './helpers/assertions', './helpers/module-load-failure', './helpers/dom', './helpers/mobiledoc', './helpers/post-abstract', './helpers/browsers', './helpers/wait', './helpers/mock-editor', './helpers/render-built-abstract', './helpers/post-editor-run', './helpers/editor'], function (exports, _helpersAssertions, _helpersModuleLoadFailure, _helpersDom, _helpersMobiledoc, _helpersPostAbstract, _helpersBrowsers, _helpersWait, _helpersMockEditor, _helpersRenderBuiltAbstract, _helpersPostEditorRun, _helpersEditor) {
  /* global QUnit */
  'use strict';

  (0, _helpersAssertions['default'])(QUnit);

  (0, _helpersModuleLoadFailure['default'])(QUnit);

  var _QUnit = QUnit;
  var qunitTest = _QUnit.test;
  var _module = _QUnit.module;
  var skip = _QUnit.skip;

  QUnit.config.urlConfig.push({
    id: 'debugTest',
    label: 'Debug Test'
  });

  var test = function test(msg, callback) {
    var originalCallback = callback;
    callback = function () {
      if (QUnit.config.debugTest) {
        // eslint-disable-next-line no-debugger
        debugger;
      }
      originalCallback.apply(undefined, arguments);
    };
    qunitTest(msg, callback);
  };

  var skipInIE11 = function skipInIE11(msg, callback) {
    if ((0, _helpersBrowsers.detectIE11)()) {
      skip('SKIPPED IN IE11: ' + msg, callback);
    } else {
      test(msg, callback);
    }
  };

  QUnit.testStart(function () {
    // The fixture is cleared between tests, clearing this
    $('<div id="editor"></div>').appendTo('#qunit-fixture');
  });

  var sauceLog = [];

  QUnit.done(function (test_results) {
    var tests = [];
    for (var i = 0, len = sauceLog.length; i < len; i++) {
      var details = sauceLog[i];
      tests.push({
        name: details.name,
        result: details.result,
        expected: details.expected,
        actual: details.actual,
        source: details.source
      });
    }
    test_results.tests = tests;

    window.global_test_results = test_results;
  });

  QUnit.testStart(function (testDetails) {
    QUnit.log(function (details) {
      if (!details.result) {
        details.name = testDetails.name;
        sauceLog.push(details);
      }
    });
  });

  exports['default'] = {
    dom: _helpersDom['default'],
    mobiledoc: _helpersMobiledoc['default'],
    postAbstract: _helpersPostAbstract['default'],
    editor: _helpersEditor['default'],
    test: test,
    module: _module,
    skipInIE11: skipInIE11,
    skip: skip,
    wait: _helpersWait['default'],
    postEditor: { run: _helpersPostEditorRun['default'], renderBuiltAbstract: _helpersRenderBuiltAbstract['default'], MockEditor: _helpersMockEditor['default'] }
  };
});
define('tests/unit/editor/atom-lifecycle-test', ['exports', '../../test-helpers', 'mobiledoc-kit', 'mobiledoc-kit/renderers/mobiledoc/0-3-1'], function (exports, _testHelpers, _mobiledocKit, _mobiledocKitRenderersMobiledoc031) {
  'use strict';

  var editorElement = undefined,
      editor = undefined;

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;
  var DEFAULT_ATOM_NAME = _testHelpers['default'].postAbstract.DEFAULT_ATOM_NAME;

  _module('Unit: Editor: Atom Lifecycle', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
        editor = null;
      }
    }
  });

  function makeEl(id) {
    var text = arguments.length <= 1 || arguments[1] === undefined ? '@atom' : arguments[1];

    var el = document.createElement('span');
    el.id = id;
    text = document.createTextNode(text);
    el.appendChild(text);
    return el;
  }

  // Default version is 0.2 for the moment
  function build(fn) {
    return _testHelpers['default'].mobiledoc.build(fn, _mobiledocKitRenderersMobiledoc031.MOBILEDOC_VERSION);
  }

  function assertRenderArguments(assert, args, expected) {
    var env = args.env;
    var options = args.options;
    var payload = args.payload;

    assert.deepEqual(payload, expected.payload, 'correct payload');
    assert.deepEqual(options, expected.options, 'correct options');

    // basic env
    var name = env.name;
    var onTeardown = env.onTeardown;

    assert.equal(name, expected.name, 'correct name');
    assert.ok(!!onTeardown, 'has onTeardown');
  }

  test('rendering a mobiledoc with atom calls atom#render', function (assert) {
    var atomPayload = { foo: 'bar' };
    var atomValue = "@bob";
    var cardOptions = { boo: 'baz' };
    var atomName = 'test-atom';

    var renderArg = undefined;

    var atom = {
      name: atomName,
      type: 'dom',
      render: function render(_renderArg) {
        renderArg = _renderArg;
      }
    };

    var mobiledoc = build(function (_ref) {
      var markupSection = _ref.markupSection;
      var post = _ref.post;
      var atom = _ref.atom;
      return post([markupSection('p', [atom(atomName, atomValue, atomPayload)])]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom], cardOptions: cardOptions });
    editor.render(editorElement);

    var expected = {
      name: atomName,
      payload: atomPayload,
      options: cardOptions
    };
    assertRenderArguments(assert, renderArg, expected);
  });

  test('rendering a mobiledoc with atom appends result of atom#render', function (assert) {
    var atomName = 'test-atom';

    var atom = {
      name: atomName,
      type: 'dom',
      render: function render() {
        return makeEl('the-atom');
      }
    };

    var mobiledoc = build(function (_ref2) {
      var markupSection = _ref2.markupSection;
      var post = _ref2.post;
      var atom = _ref2.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom] });
    assert.hasNoElement('#editor #the-atom', 'precond - atom not rendered');
    editor.render(editorElement);
    assert.hasElement('#editor #the-atom');
  });

  test('returning wrong type from render throws', function (assert) {
    var atomName = 'test-atom';

    var atom = {
      name: atomName,
      type: 'dom',
      render: function render() {
        return 'string';
      }
    };

    var mobiledoc = build(function (_ref3) {
      var markupSection = _ref3.markupSection;
      var post = _ref3.post;
      var atom = _ref3.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom] });

    assert.throws(function () {
      editor.render(editorElement);
    }, new RegExp('Atom "' + atomName + '" must return a DOM node'));
  });

  test('returning undefined from render is ok', function (assert) {
    var atomName = 'test-atom';

    var atom = {
      name: atomName,
      type: 'dom',
      render: function render() {}
    };

    var mobiledoc = build(function (_ref4) {
      var markupSection = _ref4.markupSection;
      var post = _ref4.post;
      var atom = _ref4.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom] });
    editor.render(editorElement);
    assert.ok(true, 'no errors are thrown');
  });

  test('rendering atom with wrong type throws', function (assert) {
    var atomName = 'test-atom';
    var atom = {
      name: atomName,
      type: 'other',
      render: function render() {}
    };
    var mobiledoc = build(function (_ref5) {
      var markupSection = _ref5.markupSection;
      var post = _ref5.post;
      var atom = _ref5.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });

    assert.throws(function () {
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom] });
      editor.render(editorElement);
    }, new RegExp('Atom "' + atomName + '.* must define type'));
  });

  test('rendering atom without render method throws', function (assert) {
    var atomName = 'test-atom';
    var atom = {
      name: atomName,
      type: 'dom'
    };
    var mobiledoc = build(function (_ref6) {
      var markupSection = _ref6.markupSection;
      var post = _ref6.post;
      var atom = _ref6.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });

    assert.throws(function () {
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom] });
      editor.render(editorElement);
    }, new RegExp('Atom "' + atomName + '.* must define.*render'));
  });

  test('rendering unknown atom calls #unknownAtomHandler', function (assert) {
    var payload = { foo: 'bar' };
    var cardOptions = { boo: 'baz' };
    var atomName = 'test-atom';
    var atomValue = '@bob';

    var unknownArg = undefined;
    var unknownAtomHandler = function unknownAtomHandler(_unknownArg) {
      unknownArg = _unknownArg;
    };

    var mobiledoc = build(function (_ref7) {
      var markupSection = _ref7.markupSection;
      var post = _ref7.post;
      var atom = _ref7.atom;
      return post([markupSection('p', [atom(atomName, atomValue, payload)])]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, unknownAtomHandler: unknownAtomHandler, cardOptions: cardOptions });
    editor.render(editorElement);

    var expected = {
      name: atomName,
      value: atomValue,
      options: cardOptions,
      payload: payload
    };
    assertRenderArguments(assert, unknownArg, expected);
  });

  test('rendering unknown atom without unknownAtomHandler throws', function (assert) {
    var atomName = 'test-atom';

    var mobiledoc = build(function (_ref8) {
      var markupSection = _ref8.markupSection;
      var post = _ref8.post;
      var atom = _ref8.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, unknownAtomHandler: undefined });

    assert.throws(function () {
      editor.render(editorElement);
    }, new RegExp('Unknown atom "' + atomName + '".*no unknownAtomHandler'));
  });

  test('onTeardown hook is called when editor is destroyed', function (assert) {
    var atomName = 'test-atom';

    var teardown = undefined;

    var atom = {
      name: atomName,
      type: 'dom',
      render: function render(_ref9) {
        var env = _ref9.env;

        env.onTeardown(function () {
          return teardown = true;
        });
      }
    };

    var mobiledoc = build(function (_ref10) {
      var markupSection = _ref10.markupSection;
      var post = _ref10.post;
      var atom = _ref10.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom] });
    editor.render(editorElement);

    assert.ok(!teardown, 'nothing torn down yet');

    editor.destroy();

    assert.ok(teardown, 'onTeardown hook called');
  });

  test('onTeardown hook is called when atom is destroyed', function (assert) {
    var teardown = undefined;

    var atom = {
      name: DEFAULT_ATOM_NAME,
      type: 'dom',
      render: function render(_ref11) {
        var env = _ref11.env;

        env.onTeardown(function () {
          return teardown = true;
        });
        return makeEl('atom-id', 'atom-text');
      }
    };
    editor = _testHelpers['default'].editor.buildFromText('abc@d|ef', { autofocus: true, atoms: [atom], element: editorElement });
    assert.hasElement('#editor #atom-id:contains(atom-text)', 'precond - shows atom');
    assert.ok(!teardown, 'precond - no teardown yet');
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasElement('#editor #atom-id:contains(atom-text)', 'precond - still shows atom');
    assert.ok(!teardown, 'precond - no teardown yet');
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.hasNoElement('*:contains(atom-text)', 'atom destroyed');
    assert.ok(teardown, 'calls teardown');
  });

  // See https://github.com/bustle/mobiledoc-kit/issues/421
  test('render is not called again when modifying other parts of the section', function (assert) {
    var renderCount = 0;
    var atom = {
      name: DEFAULT_ATOM_NAME,
      type: 'dom',
      render: function render() {
        renderCount++;
        return makeEl('the-atom');
      }
    };
    editor = _testHelpers['default'].editor.buildFromText('abc|@def', { autofocus: true, atoms: [atom], element: editorElement });
    assert.equal(renderCount, 1, 'renders the atom initially');
    editor.insertText('123');
    assert.hasElement('#editor *:contains(abc123)', 'precond - inserts text');
    assert.equal(renderCount, 1, 'does not rerender the atom');
  });

  test('mutating the content of an atom does not trigger an update', function (assert) {
    assert.expect(5);
    var done = assert.async();

    var atomName = 'test-atom';

    var renderCount = 0;
    var teardown = undefined;

    var atom = {
      name: atomName,
      type: 'dom',
      render: function render(_ref12) {
        var env = _ref12.env;

        renderCount++;
        env.onTeardown(function () {
          return teardown = true;
        });
        return makeEl('the-atom');
      }
    };

    var mobiledoc = build(function (_ref13) {
      var markupSection = _ref13.markupSection;
      var post = _ref13.post;
      var atom = _ref13.atom;
      return post([markupSection('p', [atom(atomName, '@bob', {})])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, atoms: [atom] });

    var updateTriggered = false;
    editor.postDidChange(function () {
      return updateTriggered = true;
    });

    assert.hasNoElement('#editor #the-atom', 'precond - atom not rendered');
    editor.render(editorElement);
    assert.equal(renderCount, 1, 'renders atom');

    $("#the-atom").html("updated");

    // ensure the mutations have had time to trigger
    _testHelpers['default'].wait(function () {
      assert.ok(!updateTriggered);
      assert.equal(renderCount, 1, 'does not rerender atom');
      assert.ok(!teardown, 'does not teardown atom');
      done();
    });
  });

  test('atom env has "save" method, rerenders atom', function (assert) {
    var atomArgs = {};
    var _render = 0;
    var teardown = 0;
    var postDidChange = 0;
    var save = undefined;

    var atom = {
      name: DEFAULT_ATOM_NAME,
      type: 'dom',
      render: function render(_ref14) {
        var env = _ref14.env;
        var value = _ref14.value;
        var payload = _ref14.payload;

        _render++;
        atomArgs.value = value;
        atomArgs.payload = payload;
        save = env.save;

        env.onTeardown(function () {
          return teardown++;
        });

        return makeEl('the-atom', value);
      }
    };

    editor = _testHelpers['default'].editor.buildFromText('abc|@("value": "initial-value", "payload": {"foo": "bar"})def', { autofocus: true, atoms: [atom], element: editorElement });
    editor.postDidChange(function () {
      return postDidChange++;
    });

    assert.equal(_render, 1, 'precond - renders atom');
    assert.equal(teardown, 0, 'precond - did not teardown');
    assert.ok(!!save, 'precond - save hook');
    assert.deepEqual(atomArgs, { value: 'initial-value', payload: { foo: "bar" } }, 'args initially empty');
    assert.hasElement('#the-atom', 'precond - displays atom');

    var value = 'new-value';
    var payload = { foo: 'baz' };
    postDidChange = 0;

    save(value, payload);

    assert.equal(_render, 2, 'rerenders atom');
    assert.equal(teardown, 1, 'tears down atom');
    assert.deepEqual(atomArgs, { value: value, payload: payload }, 'updates atom values');
    assert.ok(postDidChange, 'post changed when saving atom');
    assert.hasElement('#the-atom:contains(' + value + ')');
  });
});
define('tests/unit/editor/card-lifecycle-test', ['exports', '../../test-helpers', 'mobiledoc-kit'], function (exports, _testHelpers, _mobiledocKit) {
  'use strict';

  var editorElement = undefined,
      editor = undefined;

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Editor: Card Lifecycle', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
        editor = null;
      }
    }
  });

  function makeEl(id) {
    var el = document.createElement('div');
    el.id = id;
    return el;
  }

  function assertRenderArguments(assert, args, expected) {
    var env = args.env;
    var options = args.options;
    var payload = args.payload;

    assert.deepEqual(payload, expected.payload, 'correct payload');
    assert.deepEqual(options, expected.options, 'correct options');

    // basic env
    var name = env.name;
    var isInEditor = env.isInEditor;
    var onTeardown = env.onTeardown;
    var didRender = env.didRender;

    assert.equal(name, expected.name, 'correct name');
    assert.equal(isInEditor, expected.isInEditor, 'correct isInEditor');
    assert.ok(!!onTeardown, 'has onTeardown');
    assert.ok(!!didRender, 'has didRender');

    // editor env hooks
    var save = env.save;
    var cancel = env.cancel;
    var edit = env.edit;
    var remove = env.remove;

    assert.ok(!!save && !!cancel && !!edit && !!remove, 'has save, cancel, edit, remove hooks');

    // postModel
    var postModel = env.postModel;

    assert.ok(postModel && postModel === expected.postModel, 'correct postModel');
  }

  test('rendering a mobiledoc with card calls card#render', function (assert) {
    var payload = { foo: 'bar' };
    var cardOptions = { boo: 'baz' };
    var cardName = 'test-card';

    var renderArg = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_renderArg) {
        renderArg = _renderArg;
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var cardSection = _ref.cardSection;
      return post([cardSection('test-card', payload)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card], cardOptions: cardOptions });
    editor.render(editorElement);

    var expected = {
      name: cardName,
      payload: payload,
      options: cardOptions,
      isInEditor: true,
      postModel: editor.post.sections.head
    };
    assertRenderArguments(assert, renderArg, expected);
  });

  test('rendering a mobiledoc with card appends result of card#render', function (assert) {
    var cardName = 'test-card';

    var card = {
      name: cardName,
      type: 'dom',
      render: function render() {
        return makeEl('the-card');
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var cardSection = _ref2.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    assert.hasNoElement('#editor #the-card', 'precond - card not rendered');
    editor.render(editorElement);
    assert.hasElement('#editor #the-card');
  });

  test('returning wrong type from render throws', function (assert) {
    var cardName = 'test-card';

    var card = {
      name: cardName,
      type: 'dom',
      render: function render() {
        return 'string';
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref3) {
      var post = _ref3.post;
      var cardSection = _ref3.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });

    assert.throws(function () {
      editor.render(editorElement);
    }, new RegExp('Card "' + cardName + '" must render dom'));
  });

  test('returning undefined from render is ok', function (assert) {
    var cardName = 'test-card';

    var card = {
      name: cardName,
      type: 'dom',
      render: function render() {}
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref4) {
      var post = _ref4.post;
      var cardSection = _ref4.cardSection;
      return post([cardSection('test-card')]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);
    assert.ok(true, 'no errors are thrown');
  });

  test('returning undefined from render is ok', function (assert) {
    var cardName = 'test-card';
    var currentMode = undefined;
    var editHook = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref5) {
        var env = _ref5.env;

        currentMode = 'display';
        editHook = env.edit;
      },
      edit: function edit() {
        currentMode = 'edit';
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref6) {
      var post = _ref6.post;
      var cardSection = _ref6.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.equal(currentMode, 'display', 'precond - display');
    editHook();
    assert.equal(currentMode, 'edit', 'edit mode, no errors when returning undefined');
  });

  test('rendering card with wrong type throws', function (assert) {
    var cardName = 'test-card';
    var card = {
      name: cardName,
      type: 'other',
      render: function render() {}
    };
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref7) {
      var post = _ref7.post;
      var cardSection = _ref7.cardSection;
      return post([cardSection(cardName)]);
    });

    assert.throws(function () {
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
      editor.render(editorElement);
    }, new RegExp('Card "' + cardName + '.* must define type'));
  });

  test('rendering card without render method throws', function (assert) {
    var cardName = 'test-card';
    var card = {
      name: cardName,
      type: 'dom'
    };
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref8) {
      var post = _ref8.post;
      var cardSection = _ref8.cardSection;
      return post([cardSection(cardName)]);
    });

    assert.throws(function () {
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
      editor.render(editorElement);
    }, new RegExp('Card "' + cardName + '.* must define.*render'));
  });

  test('card can call `env.edit` to render in edit mode', function (assert) {
    var payload = { foo: 'bar' };
    var cardOptions = { boo: 'baz' };
    var cardName = 'test-card';

    var editArg = undefined;
    var editHook = undefined;
    var currentMode = undefined;
    var displayId = 'the-display-card';
    var editId = 'the-edit-card';

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_renderArg) {
        currentMode = 'display';
        editHook = _renderArg.env.edit;
        return makeEl(displayId);
      },
      edit: function edit(_editArg) {
        currentMode = 'edit';
        editArg = _editArg;
        return makeEl(editId);
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref9) {
      var post = _ref9.post;
      var cardSection = _ref9.cardSection;
      return post([cardSection(cardName, payload)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card], cardOptions: cardOptions });
    editor.render(editorElement);

    assert.hasElement('#editor #' + displayId, 'precond - display card');
    assert.hasNoElement('#editor #' + editId, 'precond - no edit card');
    assert.equal(currentMode, 'display');

    editHook();

    assert.equal(currentMode, 'edit');
    assert.hasNoElement('#editor #' + displayId, 'no display card');
    assert.hasElement('#editor #' + editId, 'renders edit card');

    var expected = {
      name: cardName,
      payload: payload,
      options: cardOptions,
      isInEditor: true,
      postModel: editor.post.sections.head
    };
    assertRenderArguments(assert, editArg, expected);
  });

  test('save hook updates payload when in display mode', function (assert) {
    var cardName = 'test-card';
    var saveHook = undefined;
    var postModel = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref10) {
        var env = _ref10.env;

        saveHook = env.save;
        postModel = env.postModel;
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref11) {
      var post = _ref11.post;
      var cardSection = _ref11.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    var newPayload = { newPayload: true };
    saveHook(newPayload);
    assert.deepEqual(postModel.payload, newPayload, 'save updates payload when called without transition param');

    var otherNewPayload = { otherNewPayload: true };
    saveHook(otherNewPayload, false);
    assert.deepEqual(postModel.payload, otherNewPayload, 'save updates payload when called with transition=false');
  });

  test('save hook updates payload when in edit mode', function (assert) {
    var cardName = 'test-card';
    var saveHook = undefined;
    var editHook = undefined;
    var postModel = undefined;
    var currentMode = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref12) {
        var env = _ref12.env;

        currentMode = 'display';
        editHook = env.edit;
        postModel = env.postModel;
      },
      edit: function edit(_ref13) {
        var env = _ref13.env;

        currentMode = 'edit';
        saveHook = env.save;
        postModel = env.postModel;
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref14) {
      var post = _ref14.post;
      var cardSection = _ref14.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.equal(currentMode, 'display', 'precond - display mode');

    editHook();

    assert.equal(currentMode, 'edit', 'precond - edit mode');
    var newPayload = { newPayload: true };
    saveHook(newPayload, false);

    assert.equal(currentMode, 'edit', 'save with false does not transition');
    assert.deepEqual(postModel.payload, newPayload, 'updates payload');

    var otherNewPayload = { otherNewPayload: true };
    saveHook(otherNewPayload);
    assert.equal(currentMode, 'display', 'save hook transitions');
    assert.deepEqual(postModel.payload, otherNewPayload, 'updates payload');
  });

  test('#cancel hook changes from edit->display, does not change payload', function (assert) {
    var cardName = 'test-card';
    var cancelHook = undefined;
    var editHook = undefined;
    var postModel = undefined;
    var currentMode = undefined;
    var currentPayload = undefined;
    var originalPayload = { foo: 'bar' };

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref15) {
        var env = _ref15.env;
        var payload = _ref15.payload;

        currentMode = 'display';
        editHook = env.edit;
        postModel = env.postModel;
        currentPayload = payload;
      },
      edit: function edit(_ref16) {
        var env = _ref16.env;

        currentMode = 'edit';
        cancelHook = env.cancel;
        postModel = env.postModel;
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref17) {
      var post = _ref17.post;
      var cardSection = _ref17.cardSection;
      return post([cardSection(cardName, originalPayload)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.equal(currentMode, 'display', 'precond - display mode');

    editHook();

    assert.equal(currentMode, 'edit', 'precond - edit mode');

    cancelHook();

    assert.equal(currentMode, 'display', 'cancel hook transitions');
    assert.deepEqual(currentPayload, originalPayload, 'payload is the same');
  });

  test('#remove hook destroys card when in display mode, removes it from DOM and AT', function (assert) {
    var cardName = 'test-card';
    var removeHook = undefined;
    var elId = 'the-card';

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref18) {
        var env = _ref18.env;

        removeHook = env.remove;
        return makeEl(elId);
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref19) {
      var post = _ref19.post;
      var cardSection = _ref19.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.hasElement('#editor #' + elId, 'precond - renders card');
    assert.ok(!!editor.post.sections.head, 'post has head section');

    removeHook();

    assert.hasNoElement('#editor #' + elId, 'removes rendered card');
    assert.ok(!editor.post.sections.head, 'post has no head section');
  });

  test('#remove hook destroys card when in edit mode, removes it from DOM and AT', function (assert) {
    var cardName = 'test-card';
    var removeHook = undefined;
    var editHook = undefined;
    var currentMode = undefined;
    var displayId = 'the-display-card';
    var editId = 'the-edit-card';

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref20) {
        var env = _ref20.env;

        currentMode = 'display';
        editHook = env.edit;
        return makeEl(displayId);
      },
      edit: function edit(_ref21) {
        var env = _ref21.env;

        currentMode = 'edit';
        removeHook = env.remove;
        return makeEl(editId);
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref22) {
      var post = _ref22.post;
      var cardSection = _ref22.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.equal(currentMode, 'display', 'precond - display mode');
    assert.hasElement('#editor #' + displayId, 'precond - renders card in display');

    editHook();

    assert.equal(currentMode, 'edit', 'precond - edit mode');

    assert.hasElement('#editor #' + editId, 'precond - renders card in edit');
    assert.hasNoElement('#editor #' + displayId, 'display card is removed');
    assert.ok(!!editor.post.sections.head, 'post has head section');

    removeHook();

    assert.hasNoElement('#editor #' + editId, 'removes rendered card');
    assert.hasNoElement('#editor #' + displayId, 'display card is not present');
    assert.ok(!editor.post.sections.head, 'post has no head section');
  });

  test('rendering unknown card calls #unknownCardHandler', function (assert) {
    var payload = { foo: 'bar' };
    var cardOptions = { boo: 'baz' };
    var cardName = 'test-card';

    var unknownArg = undefined;
    var unknownCardHandler = function unknownCardHandler(_unknownArg) {
      unknownArg = _unknownArg;
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref23) {
      var post = _ref23.post;
      var cardSection = _ref23.cardSection;
      return post([cardSection(cardName, payload)]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, unknownCardHandler: unknownCardHandler, cardOptions: cardOptions });
    editor.render(editorElement);

    var expected = {
      name: cardName,
      payload: payload,
      options: cardOptions,
      isInEditor: true,
      postModel: editor.post.sections.head
    };
    assertRenderArguments(assert, unknownArg, expected);
  });

  test('rendering unknown card without unknownCardHandler throws', function (assert) {
    var cardName = 'test-card';

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref24) {
      var post = _ref24.post;
      var cardSection = _ref24.cardSection;
      return post([cardSection(cardName)]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, unknownCardHandler: undefined });

    assert.throws(function () {
      editor.render(editorElement);
    }, new RegExp('Unknown card "' + cardName + '".*no unknownCardHandler'));
  });

  test('onTeardown hook is called when moving from display->edit and back', function (assert) {
    var cardName = 'test-card';

    var editHook = undefined;
    var saveHook = undefined;
    var currentMode = undefined;
    var teardown = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref25) {
        var env = _ref25.env;

        currentMode = 'display';
        editHook = env.edit;
        env.onTeardown(function () {
          return teardown = 'display';
        });
      },
      edit: function edit(_ref26) {
        var env = _ref26.env;

        currentMode = 'edit';
        saveHook = env.save;
        env.onTeardown(function () {
          return teardown = 'edit';
        });
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref27) {
      var post = _ref27.post;
      var cardSection = _ref27.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.equal(currentMode, 'display', 'precond - display mode');
    assert.ok(!teardown, 'no teardown called yet');

    editHook();

    assert.equal(currentMode, 'edit', 'edit mode');
    assert.equal(teardown, 'display', 'display onTeardown hook called');

    saveHook();

    assert.equal(currentMode, 'display', 'display mode');
    assert.equal(teardown, 'edit', 'edit onTeardown hook called');
  });

  test('onTeardown hook is called when card removes itself', function (assert) {
    var cardName = 'test-card';

    var removeHook = undefined;
    var teardown = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref28) {
        var env = _ref28.env;

        removeHook = env.remove;
        env.onTeardown(function () {
          return teardown = true;
        });
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref29) {
      var post = _ref29.post;
      var cardSection = _ref29.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.ok(!teardown, 'nothing torn down yet');

    removeHook();

    assert.ok(teardown, 'onTeardown hook called');
  });

  test('onTeardown hook is called when editor is destroyed', function (assert) {
    var cardName = 'test-card';

    var teardown = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref30) {
        var env = _ref30.env;

        env.onTeardown(function () {
          return teardown = true;
        });
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref31) {
      var post = _ref31.post;
      var cardSection = _ref31.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.ok(!teardown, 'nothing torn down yet');

    editor.destroy();

    assert.ok(teardown, 'onTeardown hook called');
  });

  test('didRender hook is called when moving from display->edit and back', function (assert) {
    var cardName = 'test-card';

    var editHook = undefined;
    var saveHook = undefined;
    var currentMode = undefined;
    var rendered = undefined;

    var card = {
      name: cardName,
      type: 'dom',
      render: function render(_ref32) {
        var env = _ref32.env;

        currentMode = 'display';
        editHook = env.edit;
        env.didRender(function () {
          return rendered = 'display';
        });
        return makeEl('display-card');
      },
      edit: function edit(_ref33) {
        var env = _ref33.env;

        currentMode = 'edit';
        saveHook = env.save;
        env.didRender(function () {
          return rendered = 'edit';
        });
        return makeEl('edit-card');
      }
    };

    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref34) {
      var post = _ref34.post;
      var cardSection = _ref34.cardSection;
      return post([cardSection(cardName)]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, cards: [card] });
    editor.render(editorElement);

    assert.equal(currentMode, 'display', 'precond - display mode');
    assert.ok(rendered, 'didRender called on instantiation');

    editHook();

    assert.equal(currentMode, 'edit', 'edit mode');
    assert.equal(rendered, 'edit', 'display didRender hook called');

    saveHook();

    assert.equal(currentMode, 'display', 'display mode');
    assert.equal(rendered, 'display', 'edit didRender hook called');
  });
});
define('tests/unit/editor/editor-events-test', ['exports', '../../test-helpers', 'mobiledoc-kit', 'mobiledoc-kit/utils/cursor/range'], function (exports, _testHelpers, _mobiledocKit, _mobiledocKitUtilsCursorRange) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
    var post = _ref.post;
    var markupSection = _ref.markupSection;
    var marker = _ref.marker;

    return post([markupSection('p', [marker('this is the editor')])]);
  });

  _module('Unit: Editor: events and lifecycle callbacks', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
      editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
      editor.render(editorElement);

      // Tests in FF can fail if the window is not front-most and
      // we don't explicitly render the range
      editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
    },

    afterEach: function afterEach() {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('cursorDidChange callback does not fire when selection is set to the same value', function (assert) {
    assert.expect(1);
    var done = assert.async();

    var cursorChanged = 0;
    editor.cursorDidChange(function () {
      return cursorChanged++;
    });

    var node = _testHelpers['default'].dom.findTextNode(editorElement, 'this is the editor');
    _testHelpers['default'].dom.selectRange(node, 0, node, 0);

    _testHelpers['default'].wait(function () {
      cursorChanged = 0;

      _testHelpers['default'].dom.selectRange(node, 0, node, 0);

      _testHelpers['default'].wait(function () {
        assert.equal(cursorChanged, 0, 'cursor did not change when selection is set to same value');

        done();
      });
    });
  });

  test('cursorDidChange callback fires when editor loses focus', function (assert) {
    assert.expect(1);
    var done = assert.async();

    _testHelpers['default'].wait(function () {
      // Tests in FF can fail if the window is not front-most and
      // we don't explicitly render the range
      var node = _testHelpers['default'].dom.findTextNode(editor.element, 'this is the editor');
      _testHelpers['default'].dom.selectRange(node, 0, node, 0);

      _testHelpers['default'].wait(function () {
        var cursorChanged = 0;
        editor.cursorDidChange(function () {
          return cursorChanged++;
        });

        _testHelpers['default'].dom.clearSelection();

        _testHelpers['default'].wait(function () {
          assert.equal(cursorChanged, 1, 'cursor changed after clearing selection');

          done();
        });
      });
    });
  });

  test('cursorDidChange callback not fired if editor is destroyed', function (assert) {
    assert.expect(2);
    var done = assert.async();

    var cursorChanged = 0;
    editor.cursorDidChange(function () {
      return cursorChanged++;
    });

    _testHelpers['default'].dom.clearSelection();

    _testHelpers['default'].wait(function () {
      cursorChanged = 0;
      var node = _testHelpers['default'].dom.findTextNode(editor.element, 'this is the editor');
      _testHelpers['default'].dom.selectRange(node, 0, node, 0);

      _testHelpers['default'].wait(function () {
        assert.equal(cursorChanged, 1, 'precond - cursor change fires');

        cursorChanged = 0;
        editor.destroy();
        _testHelpers['default'].dom.clearSelection();

        _testHelpers['default'].wait(function () {
          assert.equal(cursorChanged, 0, 'callback not fired');

          done();
        });
      });
    });
  });

  test('cursorChanged callback fired after editor.run sets range', function (assert) {
    assert.expect(2);
    var done = assert.async();

    var cursorChanged = 0;
    editor.cursorDidChange(function () {
      return cursorChanged++;
    });

    _testHelpers['default'].wait(function () {
      assert.equal(cursorChanged, 0, 'precond - no cursor change');

      editor.run(function (postEditor) {
        var position = editor.post.headPosition();
        postEditor.insertText(position, 'blah');
        postEditor.setRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
      });

      _testHelpers['default'].wait(function () {
        assert.equal(cursorChanged, 1, 'cursor changes after editor.run sets position');

        done();
      });
    });
  });

  test('postDidChange callback fired when post is programmatically modified', function (assert) {
    assert.expect(1);

    var postChanged = 0;
    editor.postDidChange(function () {
      return postChanged++;
    });
    editor.run(function (postEditor) {
      var position = editor.post.headPosition();
      postEditor.insertText(position, 'blah');
    });

    assert.equal(postChanged, 1, 'postDidChange fired once');
  });

  test('postDidChange callback fired when post is modified via user input', function (assert) {
    assert.expect(1);

    var postChanged = 0;
    editor.postDidChange(function () {
      return postChanged++;
    });

    _testHelpers['default'].dom.selectText(editor, "this is the editor", editorElement);
    _testHelpers['default'].dom.triggerDelete(editor);

    assert.equal(postChanged, 1, 'postDidChange fired once');
  });

  test('postDidChange callback fired when card payload changes', function (assert) {
    var env = undefined;
    var cards = [{
      name: 'simple-card',
      type: 'dom',
      render: function render(_ref2) {
        var _env = _ref2.env;

        env = _env;
        return $('<div id="my-simple-card">simple-card (display)</div>')[0];
      },
      edit: function edit(_ref3) {
        var _env = _ref3.env;

        env = _env;
        return $('<div id="my-simple-card">simple-card (edit)</div>')[0];
      }
    }];
    var editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref4) {
      var post = _ref4.post;
      var cardSection = _ref4.cardSection;

      return post([cardSection('simple-card')]);
    }, { cards: cards });

    var postDidChange = 0;
    editor.postDidChange(function () {
      return postDidChange++;
    });

    env.save({});
    assert.equal(postDidChange, 1, 'postDidChange called after save');

    postDidChange = 0;
    env.edit();
    assert.equal(postDidChange, 0, 'postDidChange not called after edit');

    postDidChange = 0;
    env.cancel();
    assert.equal(postDidChange, 0, 'postDidChange not called after cancel');

    postDidChange = 0;
    env.remove();
    assert.equal(postDidChange, 1, 'postDidChange called after remove');

    editor.destroy();
  });

  test('inputModeDidChange callback fired when markup is toggled and there is a selection', function (assert) {
    var done = assert.async();
    assert.expect(1);

    _testHelpers['default'].dom.selectText(editor, "this is the editor", editorElement);

    _testHelpers['default'].wait(function () {
      var inputChanged = 0;
      editor.inputModeDidChange(function () {
        return inputChanged++;
      });

      editor.toggleMarkup('b');

      _testHelpers['default'].wait(function () {
        assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
        done();
      });
    });
  });

  test('inputModeDidChange callback fired when markup is toggled and selection is collapsed', function (assert) {
    var done = assert.async();
    assert.expect(2);

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition()));

    assert.ok(editor.range.isCollapsed, 'precond - range is collapsed');

    _testHelpers['default'].wait(function () {
      var inputChanged = 0;
      editor.inputModeDidChange(function () {
        return inputChanged++;
      });

      editor.toggleMarkup('b');

      _testHelpers['default'].wait(function () {
        assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
        done();
      });
    });
  });

  test('inputModeDidChange callback fired when moving cursor into markup', function (assert) {
    var done = assert.async();
    assert.expect(1);

    // setup - turn text bold
    _testHelpers['default'].dom.selectText(editor, 'this is', editorElement);
    editor.toggleMarkup('b');
    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(editor.post.sections.head, 'this is'.length));

    _testHelpers['default'].wait(function () {
      var inputChanged = 0;
      editor.inputModeDidChange(function () {
        return inputChanged++;
      });

      editor.selectRange(editor.range.move(1));

      _testHelpers['default'].wait(function () {
        assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
        done();
      });
    });
  });

  test('after #toggleMarkup, editor refocuses if it had selection', function (assert) {
    var done = assert.async();
    assert.expect(3);

    var button = $('<button>BOLD</button>').appendTo('#qunit-fixture').click(function () {
      _testHelpers['default'].dom.selectText(editor, 'this', editorElement); // necessary for Safari to detect a selection in the editor
      button.focus();

      assert.ok(document.activeElement !== editor.element, 'precond - editor element is not focused');
      editor.toggleMarkup('b');
    });

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition()));

    _testHelpers['default'].wait(function () {
      var inputChanged = 0;
      editor.inputModeDidChange(function () {
        return inputChanged++;
      });

      button.click();

      _testHelpers['default'].wait(function () {
        assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
        assert.ok(document.activeElement === editor.element, 'editor element is focused');

        done();
      });
    });
  });

  test('inputModeDidChange callback fired when toggling section', function (assert) {
    var done = assert.async();
    assert.expect(1);

    _testHelpers['default'].dom.selectText(editor, 'this is', editorElement);

    var inputChanged = 0;
    editor.inputModeDidChange(function () {
      return inputChanged++;
    });

    editor.toggleSection('h2');

    _testHelpers['default'].wait(function () {
      assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
      done();
    });
  });

  test('inputModeDidChange callback not fired when toggle is no-op', function (assert) {
    var done = assert.async();
    assert.expect(1);

    _testHelpers['default'].dom.selectText(editor, 'this is', editorElement);

    var inputChanged = 0;
    editor.inputModeDidChange(function () {
      return inputChanged++;
    });

    editor.toggleSection('p'); // toggling to same section is no-op

    _testHelpers['default'].wait(function () {
      assert.equal(inputChanged, 0, 'inputModeDidChange not fired');
      done();
    });
  });

  test('inputModeDidChange callback fired when moving cursor into section', function (assert) {
    var done = assert.async();
    assert.expect(2);

    editor.run(function (postEditor) {
      var marker = postEditor.builder.createMarker('abc');
      var newSection = postEditor.builder.createMarkupSection('h2', [marker]);
      postEditor.insertSectionAtEnd(newSection);
    });

    var inputChanged = 0;
    editor.inputModeDidChange(function () {
      inputChanged++;
    });

    assert.hasElement('h2:contains(abc)', 'precond - inserted h2');
    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.sections.tail.headPosition()));

    _testHelpers['default'].wait(function () {
      inputChanged = 0;

      editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.sections.head.tailPosition()));

      _testHelpers['default'].wait(function () {
        assert.equal(inputChanged, 1, 'inputModeDidChange fired once');
        done();
      });
    });
  });

  test('inputModeDidChange callback not fired when moving cursor into same section', function (assert) {
    var done = assert.async();
    assert.expect(2);

    editor.run(function (postEditor) {
      var marker = postEditor.builder.createMarker('abc');
      var newSection = postEditor.builder.createMarkupSection('p', [marker]);
      postEditor.insertSectionAtEnd(newSection);
    });

    assert.hasElement('p:contains(abc)', 'precond - inserted p');
    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.sections.tail.headPosition()));

    var inputChanged = 0;
    editor.inputModeDidChange(function () {
      return inputChanged++;
    });

    _testHelpers['default'].dom.triggerLeftArrowKey(editor);

    _testHelpers['default'].wait(function () {
      assert.equal(inputChanged, 0, 'inputModeDidChange not fired');
      done();
    });
  });

  test('inputModeDidChange called when changing from ul to ol', function (assert) {
    assert.expect(4);

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition(), editor.post.tailPosition()));

    var inputChanged = 0;
    editor.inputModeDidChange(function () {
      return inputChanged++;
    });

    editor.toggleSection('ul');

    assert.hasElement('#editor ul li', 'created ul');
    assert.equal(inputChanged, 1, 'precond - changed to ul');

    editor.toggleSection('ol');

    assert.hasElement('#editor ol li', 'created ol');
    assert.equal(inputChanged, 2, 'inputModeDidChange fired after ul->ol');
  });
});
define('tests/unit/editor/editor-test', ['exports', 'mobiledoc-kit/editor/editor', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/utils/dom-utils', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/utils/cursor/range', '../../test-helpers'], function (exports, _mobiledocKitEditorEditor, _mobiledocKitRenderersEditorDom, _mobiledocKitUtilsDomUtils, _mobiledocKitRenderersMobiledoc02, _mobiledocKitUtilsCursorRange, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editorElement = undefined,
      editor = undefined;

  _module('Unit: Editor', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('can render an editor via dom node reference', function (assert) {
    editor = new _mobiledocKitEditorEditor['default']();
    editor.render(editorElement);
    assert.equal(editor.element, editorElement);
    assert.ok(editor.post);
  });

  test('autofocused editor hasCursor and has non-blank range after rendering', function (assert) {
    var done = assert.async();
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;

      return post([markupSection('p')]);
    });
    editor = new _mobiledocKitEditorEditor['default']({ autofocus: true, mobiledoc: mobiledoc });
    assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
    assert.ok(editor.range.isBlank, 'precond - editor has blank range');

    editor.render(editorElement);

    _testHelpers['default'].wait(function () {
      assert.ok(editor.hasCursor(), 'editor has cursor');
      assert.ok(!editor.range.isBlank, 'editor has non-blank range');
      done();
    });
  });

  test('creating an editor with DOM node throws', function (assert) {
    assert.throws(function () {
      editor = new _mobiledocKitEditorEditor['default'](document.createElement('div'));
    }, /accepts an options object/);
  });

  test('rendering an editor without a class name adds appropriate class', function (assert) {
    editorElement.className = '';

    editor = new _mobiledocKitEditorEditor['default']();
    editor.render(editorElement);
    assert.hasClass(editor.element, _mobiledocKitRenderersEditorDom.EDITOR_ELEMENT_CLASS_NAME);
  });

  test('rendering an editor adds EDITOR_ELEMENT_CLASS_NAME if not there', function (assert) {
    editorElement.className = 'abc def';

    editor = new _mobiledocKitEditorEditor['default']();
    editor.render(editorElement);

    assert.hasClass(editor.element, _mobiledocKitRenderersEditorDom.EDITOR_ELEMENT_CLASS_NAME, 'adds ' + _mobiledocKitRenderersEditorDom.EDITOR_ELEMENT_CLASS_NAME);
    assert.hasClass(editor.element, 'abc', 'preserves existing classnames');
    assert.hasClass(editor.element, 'def', 'preserves existing classnames');
  });

  test('rendering an editor adds EDITOR_HAS_NO_CONTENT_CLASS_NAME if post has no content', function (assert) {
    editor = new _mobiledocKitEditorEditor['default']();
    assert.ok(!editor.post.hasContent, 'precond - post has no content');
    editor.render(editorElement);

    assert.hasClass(editorElement, _mobiledocKitRenderersEditorDom.EDITOR_HAS_NO_CONTENT_CLASS_NAME);

    // Firefox requires that the cursor be placed explicitly for this test to pass,
    // `editor.focus()` won't work when running this test on CI in Firefox
    _testHelpers['default'].dom.moveCursorTo(editor, editor.element, 0);

    editor.insertText('abc');
    assert.ok(editor.post.hasContent, 'editor has content');
    assert.notHasClass(editorElement, _mobiledocKitRenderersEditorDom.EDITOR_HAS_NO_CONTENT_CLASS_NAME, 'removes "' + _mobiledocKitRenderersEditorDom.EDITOR_HAS_NO_CONTENT_CLASS_NAME + '" when editor has content');

    editor.deleteRange(editor.post.toRange());
    assert.hasClass(editorElement, _mobiledocKitRenderersEditorDom.EDITOR_HAS_NO_CONTENT_CLASS_NAME, 'adds "' + _mobiledocKitRenderersEditorDom.EDITOR_HAS_NO_CONTENT_CLASS_NAME + '" after editor content is all deleted');
  });

  test('editor fires lifecycle hooks', function (assert) {
    assert.expect(4);
    var didCallUpdatePost = undefined,
        didCallWillRender = undefined,
        didCallDidRender = undefined;
    editor = new _mobiledocKitEditorEditor['default']();
    editor.didUpdatePost(function (postEditor) {
      assert.ok(postEditor, 'Post editor provided');
      assert.ok(!didCallWillRender && !didCallDidRender, 'didUpdatePost called before render hooks');
      didCallUpdatePost = true;
    });
    editor.willRender(function () {
      assert.ok(didCallUpdatePost && !didCallDidRender, 'willRender called between didUpdatePost, didRender');
      didCallWillRender = true;
    });
    editor.didRender(function () {
      assert.ok(didCallUpdatePost && didCallWillRender, 'didRender called last');
      didCallDidRender = true;
    });
    editor.render(editorElement);
  });

  test('editor fires lifecycle hooks for edit', function (assert) {
    assert.expect(4);
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;

      return post([markupSection()]);
    });
    editor = new _mobiledocKitEditorEditor['default']({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var didCallUpdatePost = undefined,
        didCallWillRender = undefined,
        didCallDidRender = undefined;
    editor.didUpdatePost(function (postEditor) {
      assert.ok(postEditor, 'Post editor provided');
      assert.ok(!didCallWillRender && !didCallDidRender, 'didUpdatePost called before render hooks');
      didCallUpdatePost = true;
    });
    editor.willRender(function () {
      assert.ok(didCallUpdatePost && !didCallDidRender, 'willRender called between didUpdatePost, didRender');
      didCallWillRender = true;
    });
    editor.didRender(function () {
      assert.ok(didCallUpdatePost && didCallWillRender, 'didRender called last');
      didCallDidRender = true;
    });

    editor.run(function (postEditor) {
      postEditor.removeSection(editor.post.sections.head);
    });
  });

  test('editor fires lifecycle hooks for noop edit', function (assert) {
    assert.expect(1);
    editor = new _mobiledocKitEditorEditor['default']();
    editor.render(editorElement);

    editor.didUpdatePost(function (postEditor) {
      assert.ok(postEditor, 'Post editor provided');
    });
    editor.willRender(function () {
      assert.ok(false, 'willRender should not be called');
    });
    editor.didRender(function () {
      assert.ok(false, 'didRender should not be called');
    });

    editor.run(function () {});
  });

  test('editor parses and renders mobiledoc format', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      return post([markupSection('p', [marker('hello world')])]);
    });
    editorElement.innerHTML = '<p>something here</p>';
    editor = new _mobiledocKitEditorEditor['default']({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    assert.ok(editor.mobiledoc, 'editor has mobiledoc');
    assert.equal(editorElement.innerHTML, '<p>hello world</p>');

    assert.deepEqual(editor.serialize(), mobiledoc, 'serialized editor === mobiledoc');
  });

  test('#serialize serializes to MOBILEDOC_VERSION by default', function (assert) {
    var mobiledoc2 = _testHelpers['default'].mobiledoc.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      return post([markupSection('p', [marker('abc')])]);
    }, '0.2.0');
    var mobiledoc3 = _testHelpers['default'].mobiledoc.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;

      return post([markupSection('p', [marker('abc')])]);
    }, '0.3.0');
    var mobiledoc3_1 = _testHelpers['default'].mobiledoc.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;

      return post([markupSection('p', [marker('abc')])]);
    }, '0.3.1');
    var mobiledoc3_2 = _testHelpers['default'].mobiledoc.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      return post([markupSection('p', [marker('abc')])]);
    }, '0.3.2');

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    assert.deepEqual(editor.serialize('0.2.0'), mobiledoc2, 'serializes 0.2.0');
    assert.deepEqual(editor.serialize('0.3.0'), mobiledoc3, 'serializes 0.3.0');
    assert.deepEqual(editor.serialize('0.3.1'), mobiledoc3_1, 'serializes 0.3.1');
    assert.deepEqual(editor.serialize('0.3.2'), mobiledoc3_2, 'serializes 0.3.2');
    assert.deepEqual(editor.serialize(), mobiledoc3_2, 'serializes 0.3.2 by default');

    assert.throws(function () {
      return editor.serialize('unknown');
    }, /Unknown version/);
  });

  test('editor parses and renders html', function (assert) {
    editorElement.innerHTML = '<p>something here</p>';
    editor = new _mobiledocKitEditorEditor['default']({ html: '<p>hello world</p>' });
    editor.render(editorElement);

    assert.equal(editorElement.innerHTML, '<p>hello world</p>');
  });

  test('editor parses and renders DOM', function (assert) {
    editorElement.innerHTML = '<p>something here</p>';
    editor = new _mobiledocKitEditorEditor['default']({ html: $('<p>hello world</p>')[0] });
    editor.render(editorElement);

    assert.equal(editorElement.innerHTML, '<p>hello world</p>');
  });

  test('#detectMarkupInRange not found', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('p'), [[[], 0, 'hello world']]]]]
    };
    editor = new _mobiledocKitEditorEditor['default']({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var section = editor.post.sections.head;
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, section.text.length);
    var markup = editor.detectMarkupInRange(range, 'strong');
    assert.ok(!markup, 'selection is not strong');
  });

  test('#detectMarkupInRange matching bounds of marker', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[['strong']], [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('p'), [[[0], 1, 'hello world']]]]]
    };
    editor = new _mobiledocKitEditorEditor['default']({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    var section = editor.post.sections.head;
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, section.text.length);
    var markup = editor.detectMarkupInRange(range, 'strong');
    assert.ok(markup, 'selection has markup');
    assert.equal(markup.tagName, 'strong', 'detected markup is strong');
  });

  test('useful error message when given invalid mobiledoc', function (assert) {
    var badMobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], ["incorrect"]]
    };
    assert.throws(function () {
      new _mobiledocKitEditorEditor['default']({ mobiledoc: badMobiledoc });
    }, /unable to parse.*mobiledoc/i);
  });

  test('useful error message when given bad version of mobiledoc', function (assert) {
    var verybadMobiledoc = "not mobiledoc";
    assert.throws(function () {
      new _mobiledocKitEditorEditor['default']({ mobiledoc: verybadMobiledoc });
    }, /Unknown version of mobiledoc parser requested/i);
  });

  test('activeSections of a rendered blank mobiledoc is an empty array', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref9) {
      var post = _ref9.post;

      return post();
    });

    assert.ok(editor.hasRendered, 'editor has rendered');
    assert.equal(editor.activeSections.length, 0, 'empty activeSections');
  });

  test('activeSections is empty when the editor has no cursor', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;

      return post([markupSection('p', [marker('abc')])]);
    }, { autofocus: false });

    assert.ok(!editor.hasCursor(), 'precond - no cursor');
    assert.equal(editor.activeSections.length, 0, 'empty activeSections');
  });

  test('activeSectionAttributes of a rendered blank mobiledoc is an empty array', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref11) {
      var post = _ref11.post;

      return post();
    });

    assert.ok(editor.hasRendered, 'editor has rendered');
    assert.deepEqual(editor.activeSectionAttributes, {}, 'empty activeSectionAttributes');
  });

  test('activeSectionAttributes is updated based on the selection', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref12) {
      var post = _ref12.post;
      var markupSection = _ref12.markupSection;
      var marker = _ref12.marker;

      return post([markupSection('p', [marker('abc')], false, { 'data-md-text-align': 'center' })]);
    }, { autofocus: false });

    assert.ok(!editor.hasCursor(), 'precond - no cursor');
    assert.deepEqual(editor.activeSectionAttributes, {}, 'empty activeSectionAttributes');

    var head = editor.post.sections.head;
    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abc'.length));
    assert.deepEqual(editor.activeSectionAttributes['text-align'], ['center'], 'active section attributes captured');
  });

  test('editor.cursor.hasCursor() is false before rendering', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref13) {
      var post = _ref13.post;
      return post();
    });
    editor = new _mobiledocKitEditorEditor['default']({ mobiledoc: mobiledoc });

    assert.ok(!editor.cursor.hasCursor(), 'no cursor before rendering');

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement, 0);

    assert.ok(!editor.cursor.hasCursor(), 'no cursor before rendering, even when selection exists');
  });

  test('#destroy clears selection if it has one', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref14) {
      var post = _ref14.post;
      return post();
    });
    editor = new _mobiledocKitEditorEditor['default']({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, editorElement, 0);
    assert.ok(editor.cursor.hasCursor(), 'precond - has cursor');

    editor.destroy();

    assert.equal(window.getSelection().rangeCount, 0, 'selection is cleared');
  });

  test('#destroy does not clear selection if it is outside the editor element', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref15) {
      var post = _ref15.post;
      return post();
    });
    editor = new _mobiledocKitEditorEditor['default']({ mobiledoc: mobiledoc });
    editor.render(editorElement);

    _testHelpers['default'].dom.moveCursorTo(editor, $('#qunit-fixture')[0], 0);
    assert.ok(!editor.cursor.hasCursor(), 'precond - has no cursor');
    assert.equal(window.getSelection().rangeCount, 1, 'precond - has selection');

    editor.destroy();

    assert.equal(window.getSelection().rangeCount, 1, 'selection is not cleared');
  });

  test('editor parses HTML post using parser plugins', function (assert) {
    var seenTagNames = [];
    var parserPlugin = function parserPlugin(element) {
      seenTagNames.push(element.tagName);
    };
    var html = '<p><textarea></textarea><img></p>';
    editor = new _mobiledocKitEditorEditor['default']({ html: html, parserPlugins: [parserPlugin] });
    assert.ok(!!editor.post, 'editor loads post');

    assert.deepEqual(seenTagNames, ['P', 'TEXTAREA', 'IMG']);
  });

  test('#activeMarkups returns the markups at cursor when range is collapsed', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref16) {
      var post = _ref16.post;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;
      var markup = _ref16.markup;

      return post([markupSection('p', [marker('abc'), marker('def', [markup('b')]), marker('ghi')])]);
    });

    var head = editor.post.sections.head;
    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abc'.length));
    assert.equal(editor.activeMarkups.length, 0, 'no active markups at left of bold text');

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abcd'.length));
    assert.equal(editor.activeMarkups.length, 1, 'active markups in bold text');
    assert.ok(editor.hasActiveMarkup('b'), 'has bold active markup');

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abcdef'.length));
    assert.equal(editor.activeMarkups.length, 1, 'active markups at end of bold text');
    assert.ok(editor.hasActiveMarkup('b'), 'has bold active markup');

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abcdefg'.length));
    assert.equal(editor.activeMarkups.length, 0, 'no active markups after end of bold text');
  });

  test('#hasActiveMarkup returns true for complex markups', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var marker = _ref17.marker;
      var markup = _ref17.markup;

      return post([markupSection('p', [marker('abc '), marker('def', [markup('a', { href: 'http://bustle.com' })]), marker(' ghi')])]);
    });

    var head = editor.post.sections.head;
    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abc '.length));
    assert.equal(editor.activeMarkups.length, 0, 'no active markups at left of linked text');

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abc d'.length));
    assert.equal(editor.activeMarkups.length, 1, 'active markups in linked text');
    assert.ok(editor.hasActiveMarkup('a'), 'has A active markup');

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abc def'.length));
    assert.equal(editor.activeMarkups.length, 0, 'active markups at end of linked text');

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(head, 'abc def '.length));
    assert.equal(editor.activeMarkups.length, 0, 'no active markups after end of linked text');
  });

  test('#insertText inserts text at cursor position, replacing existing range if non-collapsed', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref18) {
      var post = _ref18.post;
      var markupSection = _ref18.markupSection;
      var marker = _ref18.marker;

      return post([markupSection('p', [marker('b')])]);
    });

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
    editor.insertText('Z');
    assert.equal(editor.post.sections.head.text, 'bZ');

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition()));
    editor.insertText('A');
    assert.equal(editor.post.sections.head.text, 'AbZ');

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(editor.post.sections.head, 'A'.length));
    editor.insertText('B');
    assert.equal(editor.post.sections.head.text, 'ABbZ');

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition(), editor.post.tailPosition()));
    editor.insertText('new stuff');
    assert.equal(editor.post.sections.head.text, 'new stuff');
  });

  test('#insertText inserts text at cursor position, inheriting active markups', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref19) {
      var post = _ref19.post;
      var markupSection = _ref19.markupSection;
      var marker = _ref19.marker;
      var markup = _ref19.markup;

      return post([markupSection('p', [marker('a'), marker('b', [markup('b')])])]);
    });

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
    assert.equal(editor.activeMarkups.length, 1, 'precond - 1 active markup');
    editor.insertText('Z');
    assert.hasElement('#editor b:contains(bZ)');

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition()));
    assert.equal(editor.activeMarkups.length, 0, 'precond - 0 active markups at start');
    editor.toggleMarkup('b');
    editor.insertText('A');

    assert.hasElement('#editor b:contains(A)');
  });

  test('#insertText is no-op when editor does not have cursor', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref20) {
      var post = _ref20.post;
      var markupSection = _ref20.markupSection;
      var marker = _ref20.marker;

      expected = post([markupSection('p', [marker('abc')])]);
      return post([markupSection('p', [marker('abc')])]);
    }, { autofocus: false });

    assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
    editor.insertText('blah blah blah');

    assert.postIsSimilar(editor.post, expected, 'post is not changed');
  });

  test('#insertText when post is blank', function (assert) {
    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref21) {
      var post = _ref21.post;
      var markupSection = _ref21.markupSection;
      var marker = _ref21.marker;

      expected = post([markupSection('p', [marker('blah blah')])]);
      return post();
    });

    // Necessary to ensure tests pass on FF when the window is not active
    _testHelpers['default'].dom.selectRange(editorElement, 0, editorElement, 0);

    assert.ok(editor.hasCursor(), 'precond - editor has cursor');
    assert.ok(editor.post.isBlank, 'precond - editor has blank post');
    editor.insertText('blah blah');

    assert.postIsSimilar(editor.post, expected, 'text is added to post');
  });

  test('#insertAtom inserts atom at cursor position, replacing range if non-collapsed', function (assert) {
    var atom = {
      name: 'the-atom',
      type: 'dom',
      render: function render() {}
    };

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref22) {
      var post = _ref22.post;
      var markupSection = _ref22.markupSection;
      var marker = _ref22.marker;

      return post([markupSection('p', [marker('b')])]);
    }, { atoms: [atom] });

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
    editor.insertAtom('the-atom', 'END');

    assert.equal(editor.post.sections.head.text, 'bEND');

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition()));
    editor.insertAtom('the-atom', 'START');
    assert.equal(editor.post.sections.head.text, 'STARTbEND');

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition(), editor.post.tailPosition()));
    editor.insertAtom('the-atom', 'REPLACE-ALL');
    assert.equal(editor.post.sections.head.text, 'REPLACE-ALL');
  });

  test('#insertAtom is no-op when editor does not have cursor', function (assert) {
    var atom = {
      name: 'the-atom',
      type: 'dom',
      render: function render() {}
    };

    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref23) {
      var post = _ref23.post;
      var markupSection = _ref23.markupSection;
      var marker = _ref23.marker;

      expected = post([markupSection('p', [marker('abc')])]);
      return post([markupSection('p', [marker('abc')])]);
    }, { atoms: [atom], autofocus: false });

    assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
    editor.insertAtom('the-atom');

    assert.postIsSimilar(editor.post, expected, 'post is not changed');
  });

  test('#insertAtom when post is blank', function (assert) {
    var atom = {
      name: 'the-atom',
      type: 'dom',
      render: function render() {}
    };

    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref24) {
      var post = _ref24.post;
      var atom = _ref24.atom;
      var markupSection = _ref24.markupSection;

      expected = post([markupSection('p', [atom('the-atom', 'THEATOMTEXT')])]);
      return post();
    }, { atoms: [atom] });

    _testHelpers['default'].dom.selectRange(editorElement, 0, editorElement, 0);

    assert.ok(editor.hasCursor(), 'precond - editor has cursor');
    assert.ok(editor.post.isBlank, 'precond - post is blank');
    editor.insertAtom('the-atom', 'THEATOMTEXT');

    assert.postIsSimilar(editor.post, expected);
  });

  test('#insertAtom returns the inserted atom', function (assert) {
    var atom = {
      name: 'the-atom',
      type: 'dom',
      render: function render() {}
    };

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref25) {
      var post = _ref25.post;

      return post();
    }, { atoms: [atom] });

    // Force the selection -- this is necessary for tests in Firefox at
    // SauceLabs.
    _testHelpers['default'].dom.selectRange(editorElement, 0, editorElement, 0);

    assert.ok(editor.hasCursor(), 'precond - editor has cursor');

    var insertedAtom = editor.insertAtom('the-atom', 'THEATOMTEXT');

    assert.equal(insertedAtom.value, 'THEATOMTEXT', 'return value is the inserted atom');
  });

  test('#insertCard inserts card at section after cursor position, replacing range if non-collapsed', function (assert) {
    var card = {
      name: 'the-card',
      type: 'dom',
      render: function render() {}
    };

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref26) {
      var post = _ref26.post;
      var markupSection = _ref26.markupSection;
      var marker = _ref26.marker;

      return post([markupSection('p', [marker('b')])]);
    }, { cards: [card] });

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.tailPosition()));
    editor.insertCard('the-card');

    assert.equal(editor.post.sections.length, 2, 'adds a section at end');
    assert.ok(editor.post.sections.tail.isCardSection, 'added section is card section');

    editor.run(function (postEditor) {
      var blankSection = postEditor.builder.createMarkupSection();

      var firstSection = editor.post.sections.head;
      var collection = editor.post.sections;
      postEditor.insertSectionBefore(collection, blankSection, firstSection);
    });

    assert.equal(editor.post.sections.length, 3, 'precond - adds blank section at start');
    assert.ok(!editor.post.sections.head.isCardSection, 'precond - initial section is not card section');

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition()));
    editor.insertCard('the-card');

    assert.equal(editor.post.sections.length, 3, 'replaced initial blank section with card');
    assert.ok(editor.post.sections.head.isCardSection, 'initial section is card section');

    editor.selectRange(new _mobiledocKitUtilsCursorRange['default'](editor.post.headPosition(), editor.post.tailPosition()));
    editor.insertCard('the-card');
    assert.equal(editor.post.sections.length, 1, 'replaces range with card section');
    assert.ok(editor.post.sections.head.isCardSection, 'initial section is card section');
  });

  test('#insertCard when cursor is in list item', function (assert) {
    var card = {
      name: 'the-card',
      type: 'dom',
      render: function render() {}
    };

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref27) {
      var post = _ref27.post;
      var markupSection = _ref27.markupSection;
      var marker = _ref27.marker;
      var listItem = _ref27.listItem;
      var listSection = _ref27.listSection;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')])])]);
    }, { cards: [card] });

    editor.selectRange(_mobiledocKitUtilsCursorRange['default'].create(editor.post.sections.head.items.head, 'ab'.length));
    editor.insertCard('the-card');

    assert.equal(editor.post.sections.length, 2, 'adds a second section');
    assert.ok(editor.post.sections.tail.isCardSection, 'tail section is card section');
  });

  test('#insertCard is no-op when editor does not have cursor', function (assert) {
    var card = {
      name: 'the-card',
      type: 'dom',
      render: function render() {}
    };

    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref28) {
      var post = _ref28.post;
      var markupSection = _ref28.markupSection;
      var marker = _ref28.marker;

      expected = post([markupSection('p', [marker('abc')])]);
      return post([markupSection('p', [marker('abc')])]);
    }, { cards: [card], autofocus: false });

    assert.ok(!editor.hasCursor(), 'precond - editor has no cursor');
    editor.insertCard('the-card');

    assert.postIsSimilar(editor.post, expected, 'post is not changed');
  });

  test('#insertCard when post is blank', function (assert) {
    var card = {
      name: 'the-card',
      type: 'dom',
      render: function render() {}
    };

    var expected = undefined;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref29) {
      var post = _ref29.post;
      var cardSection = _ref29.cardSection;

      expected = post([cardSection('the-card')]);
      return post();
    }, { cards: [card] });

    _testHelpers['default'].dom.selectRange(editorElement, 0, editorElement, 0);

    assert.ok(editor.hasCursor(), 'precond - editor has cursor');
    assert.ok(editor.post.isBlank, 'precond - post is blank');

    editor.insertCard('the-card');

    assert.postIsSimilar(editor.post, expected, 'adds card section');
  });

  test('#insertCard returns card object', function (assert) {
    var card = {
      name: 'the-card',
      type: 'dom',
      render: function render() {}
    };

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref30) {
      var post = _ref30.post;

      return post();
    }, { cards: [card] });

    _testHelpers['default'].dom.selectRange(editorElement, 0, editorElement, 0);

    assert.ok(editor.hasCursor(), 'precond - editor has cursor');
    assert.ok(editor.post.isBlank, 'precond - post is blank');

    var insertedCard = editor.insertCard('the-card');

    assert.ok(!!insertedCard, 'insertedCard is present');
    assert.equal(editor.post.sections.tail, insertedCard, 'returned card is the inserted card');
  });

  test('#insertCard focuses the cursor at the end of the card', function (assert) {
    var card = {
      name: 'the-card',
      type: 'dom',
      render: function render() {}
    };

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref31) {
      var post = _ref31.post;

      return post();
    }, { cards: [card] });

    _testHelpers['default'].dom.selectRange(editorElement, 0, editorElement, 0);

    var insertedCard = editor.insertCard('the-card');

    var range = editor.range;
    assert.positionIsEqual(range.head, insertedCard.tailPosition(), 'range head on card tail');
    assert.positionIsEqual(range.tail, insertedCard.tailPosition(), 'range tail on card tail');
    assert.ok(document.activeElement === editorElement, 'editor element retains focus');
  });

  test('#toggleMarkup removes A tag when no attributes given', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref32) {
      var post = _ref32.post;
      var markupSection = _ref32.markupSection;
      var marker = _ref32.marker;
      var markup = _ref32.markup;

      return post([markupSection('p', [marker('^'), marker('link', [markup('a', { href: 'google.com' })]), marker('$')])]);
    });
    _testHelpers['default'].dom.selectText(editor, 'link');
    editor.toggleMarkup('a');

    assert.selectedText('link', 'text "link" still selected');
    assert.ok(editor.hasCursor(), 'editor has cursor');
    assert.hasElement('#editor p:contains(^link$)');
    assert.hasNoElement('#editor a', 'a tag is removed');
  });

  test('#toggleMarkup adds A tag with attributes', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref33) {
      var post = _ref33.post;
      var markupSection = _ref33.markupSection;
      var marker = _ref33.marker;
      var markup = _ref33.markup;

      return post([markupSection('p', [marker('^link$')])]);
    });
    _testHelpers['default'].dom.selectText(editor, 'link');
    editor.toggleMarkup('a', { href: 'google.com' });

    assert.selectedText('link', 'text "link" still selected');
    assert.ok(editor.hasCursor(), 'editor has cursor');
    assert.hasElement('#editor a:contains(link)');
    assert.hasElement('#editor a[href="google.com"]:contains(link)');
  });

  test('#toggleMarkup calls #beforeToggleMarkup hooks', function (assert) {
    assert.expect(5 * 3 + 2);

    var callbackCount = 0;
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref34) {
      var post = _ref34.post;
      var markupSection = _ref34.markupSection;
      var marker = _ref34.marker;
      var markup = _ref34.markup;

      return post([markupSection('p', [marker('^link$')])]);
    });
    _testHelpers['default'].dom.selectText(editor, 'link');
    var callback = function callback(_ref35) {
      var markup = _ref35.markup;
      var range = _ref35.range;
      var willAdd = _ref35.willAdd;

      assert.ok(true, 'calls #beforeToggleMarkup');
      assert.equal(markup.tagName, 'a', 'passes markup');
      assert.equal(markup.getAttribute('href'), 'google.com', 'passes markup with attrs');
      assert.ok(!!range, 'passes a range');
      assert.ok(willAdd, 'correct value for willAdd');
      callbackCount++;
    };

    // 3 times
    editor.beforeToggleMarkup(callback);
    editor.beforeToggleMarkup(callback);
    editor.beforeToggleMarkup(callback);

    editor.toggleMarkup('a', { href: 'google.com' });
    assert.equal(callbackCount, 3, 'calls once for each callback');
    assert.hasElement('#editor a[href="google.com"]:contains(link)', 'adds link');
  });

  test('#toggleMarkup is canceled if #beforeToggleMarkup hook returns false', function (assert) {
    assert.expect(2);
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref36) {
      var post = _ref36.post;
      var markupSection = _ref36.markupSection;
      var marker = _ref36.marker;
      var markup = _ref36.markup;

      return post([markupSection('p', [marker('^link$')])]);
    });
    _testHelpers['default'].dom.selectText(editor, 'link');
    var callback = function callback(_ref37) {
      var markup = _ref37.markup;
      var range = _ref37.range;
      var willAdd = _ref37.willAdd;

      assert.ok(true, 'calls #beforeToggleMarkup');
      return false;
    };

    editor.beforeToggleMarkup(callback);

    editor.toggleMarkup('a', { href: 'google.com' });
    assert.hasNoElement('#editor a', 'not adds link');
  });
});
define('tests/unit/editor/key-commands-test', ['exports', 'mobiledoc-kit/editor/key-commands', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/keycodes', '../../test-helpers'], function (exports, _mobiledocKitEditorKeyCommands, _mobiledocKitUtilsKey, _mobiledocKitUtilsKeycodes, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var SPECIAL_KEYS = {
    BACKSPACE: _mobiledocKitUtilsKeycodes['default'].BACKSPACE,
    TAB: _mobiledocKitUtilsKeycodes['default'].TAB,
    ENTER: _mobiledocKitUtilsKeycodes['default'].ENTER,
    ESC: _mobiledocKitUtilsKeycodes['default'].ESC,
    SPACE: _mobiledocKitUtilsKeycodes['default'].SPACE,
    PAGEUP: _mobiledocKitUtilsKeycodes['default'].PAGEUP,
    PAGEDOWN: _mobiledocKitUtilsKeycodes['default'].PAGEDOWN,
    END: _mobiledocKitUtilsKeycodes['default'].END,
    HOME: _mobiledocKitUtilsKeycodes['default'].HOME,
    LEFT: _mobiledocKitUtilsKeycodes['default'].LEFT,
    UP: _mobiledocKitUtilsKeycodes['default'].UP,
    RIGHT: _mobiledocKitUtilsKeycodes['default'].RIGHT,
    DOWN: _mobiledocKitUtilsKeycodes['default'].DOWN,
    INS: _mobiledocKitUtilsKeycodes['default'].INS,
    DEL: _mobiledocKitUtilsKeycodes['default'].DELETE
  };

  _module('Unit: Editor key commands');

  test('leaves modifier, code and run in place if they exist', function (assert) {
    var fn = function fn() {};

    var _buildKeyCommand = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({
      code: _mobiledocKitUtilsKeycodes['default'].ENTER,
      modifier: _mobiledocKitUtilsKey.MODIFIERS.META,
      run: fn
    });

    var modifier = _buildKeyCommand.modifier;
    var code = _buildKeyCommand.code;
    var run = _buildKeyCommand.run;

    assert.equal(modifier, _mobiledocKitUtilsKey.MODIFIERS.META, 'keeps modifier');
    assert.equal(code, _mobiledocKitUtilsKeycodes['default'].ENTER, 'keeps code');
    assert.equal(run, fn, 'keeps run');
  });

  test('translates MODIFIER+CHARACTER string to modifierMask and code', function (assert) {
    var _buildKeyCommand2 = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'meta+k' });

    var modifierMask = _buildKeyCommand2.modifierMask;
    var code = _buildKeyCommand2.code;

    assert.equal(modifierMask, (0, _mobiledocKitUtilsKey.modifierMask)({ metaKey: true }), 'calculates correct modifierMask');
    assert.equal(code, 75, 'translates string to code');
  });

  test('translates modifier+character string to modifierMask and code', function (assert) {
    var _buildKeyCommand3 = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'META+K' });

    var modifierMask = _buildKeyCommand3.modifierMask;
    var code = _buildKeyCommand3.code;

    assert.equal(modifierMask, (0, _mobiledocKitUtilsKey.modifierMask)({ metaKey: true }), 'calculates correct modifierMask');
    assert.equal(code, 75, 'translates string to code');
  });

  test('translates multiple modifiers to modifierMask', function (assert) {
    var _buildKeyCommand4 = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'META+SHIFT+K' });

    var modifierMask = _buildKeyCommand4.modifierMask;
    var code = _buildKeyCommand4.code;

    assert.equal(modifierMask, (0, _mobiledocKitUtilsKey.modifierMask)({ metaKey: true, shiftKey: true }), 'calculates correct modifierMask');
    assert.equal(code, 75, 'translates string to code');
  });

  test('translates uppercase character string to code', function (assert) {
    var _buildKeyCommand5 = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'K' });

    var modifierMask = _buildKeyCommand5.modifierMask;
    var code = _buildKeyCommand5.code;

    assert.equal(modifierMask, 0, 'no modifier given');
    assert.equal(code, 75, 'translates string to code');
  });

  test('translates lowercase character string to code', function (assert) {
    var _buildKeyCommand6 = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'k' });

    var modifier = _buildKeyCommand6.modifier;
    var code = _buildKeyCommand6.code;

    assert.equal(modifier, undefined, 'no modifier given');
    assert.equal(code, 75, 'translates string to code');
  });

  test('throws when given invalid modifier', function (assert) {
    assert.throws(function () {
      (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'MEAT+K' });
    }, /No modifier named.*MEAT.*/);
  });

  test('throws when given `modifier` property (deprecation)', function (assert) {
    assert.throws(function () {
      (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'K', modifier: _mobiledocKitUtilsKey.MODIFIERS.META });
    }, /Key commands no longer use.*modifier.* property/);
  });

  test('throws when given str with too many characters', function (assert) {
    assert.throws(function () {
      (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: 'abc' });
    }, /Only 1 character/);
  });

  test('translates uppercase special key names to codes', function (assert) {
    Object.keys(SPECIAL_KEYS).forEach(function (name) {
      var _buildKeyCommand7 = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: name.toUpperCase() });

      var code = _buildKeyCommand7.code;

      assert.equal(code, SPECIAL_KEYS[name], 'translates ' + name + ' string to code');
    });
  });

  test('translates lowercase special key names to codes', function (assert) {
    Object.keys(SPECIAL_KEYS).forEach(function (name) {
      var _buildKeyCommand8 = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({ str: name.toLowerCase() });

      var code = _buildKeyCommand8.code;

      assert.equal(code, SPECIAL_KEYS[name], 'translates ' + name + ' string to code');
    });
  });

  test('`findKeyCommands` matches modifiers exactly', function (assert) {
    var cmdK = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({
      str: 'META+K'
    });
    var cmdShiftK = (0, _mobiledocKitEditorKeyCommands.buildKeyCommand)({
      str: 'META+SHIFT+K'
    });
    var commands = [cmdK, cmdShiftK];

    var element = null;
    var cmdKEvent = _testHelpers['default'].dom.createMockEvent('keydown', element, {
      keyCode: 75,
      metaKey: true
    });
    var cmdShiftKEvent = _testHelpers['default'].dom.createMockEvent('keydown', element, {
      keyCode: 75,
      metaKey: true,
      shiftKey: true
    });

    var found = (0, _mobiledocKitEditorKeyCommands.findKeyCommands)(commands, cmdKEvent);
    assert.ok(found.length && found[0] === cmdK, 'finds cmd-K command from cmd-k event');

    found = (0, _mobiledocKitEditorKeyCommands.findKeyCommands)(commands, cmdShiftKEvent);
    assert.ok(found.length && found[0] === cmdShiftK, 'finds cmd-shift-K command from cmd-shift-k event');
  });
});
define('tests/unit/editor/post-delete-at-position-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/key'], function (exports, _testHelpers, _mobiledocKitUtilsKey) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var FORWARD = _mobiledocKitUtilsKey.DIRECTION.FORWARD;
  var BACKWARD = _mobiledocKitUtilsKey.DIRECTION.BACKWARD;
  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;
  var run = _testHelpers['default'].postEditor.run;
  var buildFromText = _testHelpers['default'].postAbstract.buildFromText;
  var retargetPosition = _testHelpers['default'].editor.retargetPosition;

  _module('Unit: PostEditor: #deleteAtPosition');

  var expectationGroups = [{
    name: 'single markup section',
    direction: BACKWARD,
    expectations: [['abc|def', 'ab|def', 'middle'], ['abcdef|', 'abcde|', 'end'], ['|abcdef', '|abcdef', 'start'], ['ab *cd*| ef', 'ab *c*| ef', 'markup (right side)'], ['ab |*cd* ef', 'ab|*cd* ef', 'markup (left side)'], ['ab @| ef', 'ab | ef', 'atom (right side)'], ['ab |@ ef', 'ab|@ ef', 'atom (left side)']]
  }, {
    name: 'single markup section',
    direction: FORWARD,
    expectations: [['abc|def', 'abc|ef', 'middle'], ['abcdef|', 'abcdef|', 'end'], ['|abcdef', '|bcdef', 'start'], ['ab *cd*| ef', 'ab *cd*|ef', 'markup (right side)'], ['ab |*cd* ef', 'ab |*d* ef', 'markup (left side)'], ['ab @| ef', 'ab @|ef', 'atom (right side)'], ['ab |@ ef', 'ab | ef', 'atom (left side)']]
  }, {
    name: 'across section boundary',
    direction: BACKWARD,
    expectations: [[['abc', '|def'], 'abc|def', 'markup sections'], [['*abc*', '|def'], '*abc*|def', 'markup sections with markup'], [['[abc]', '|def'], ['[abc]|', 'def'], 'prev section is card'], [['abc', '|[def]'], ['abc|', '[def]'], 'cur section is card'], [['', '|abc'], ['|abc'], 'prev section is blank']]
  }, {
    name: 'across section boundary',
    direction: FORWARD,
    expectations: [[['abc|', 'def'], 'abc|def', 'markup sections'], [['*abc*|', 'def'], '*abc*|def', 'markup sections with markup'], [['[abc]|', 'def'], ['[abc]|', 'def'], 'cur section is card'], [['abc|', '[def]'], ['abc|', '[def]'], 'next section is card'], [['abc|', ''], ['abc|'], 'next section is blank']]
  }, {
    name: 'across list item boundary',
    direction: BACKWARD,
    expectations: [[['* abc', '* |def'], ['* abc', '|def'], 'start of list item'], [['* abc', '|def'], ['* abc|def'], 'into list item'], [['', '* |abc'], ['', '|abc'], 'prev blank section']]
  }, {
    name: 'across list item boundary',
    direction: FORWARD,
    expectations: [[['* abc|', '* def'], ['* abc|def'], 'item into item'], [['* abc|', 'def'], ['* abc|def'], 'item into markup'], [['abc|', '* def'], ['abc|def'], 'markup into markup']]
  }];

  expectationGroups.forEach(function (_ref) {
    var name = _ref.name;
    var expectations = _ref.expectations;
    var direction = _ref.direction;

    expectations.forEach(function (_ref2) {
      var _ref22 = _slicedToArray(_ref2, 3);

      var before = _ref22[0];
      var after = _ref22[1];
      var msg = _ref22[2];

      var dir = direction === FORWARD ? 'forward' : 'backward';
      test(dir + ': ' + name + ', "' + before + '" -> "' + after + '" (' + msg + ')', function (assert) {
        var _buildFromText = buildFromText(before);

        var post = _buildFromText.post;
        var position = _buildFromText.range.head;

        var _buildFromText2 = buildFromText(after);

        var expectedPost = _buildFromText2.post;
        var expectedPosition = _buildFromText2.range.head;

        position = run(post, function (postEditor) {
          return postEditor.deleteAtPosition(position, direction);
        });
        expectedPosition = retargetPosition(expectedPosition, post);

        assert.postIsSimilar(post, expectedPost);
        assert.positionIsEqual(position, expectedPosition);
      });
    });
  });
});
define('tests/unit/editor/post-delete-range-test', ['exports', '../../test-helpers'], function (exports, _testHelpers) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;
  var run = _testHelpers['default'].postEditor.run;
  var buildFromText = _testHelpers['default'].postAbstract.buildFromText;
  var retargetRange = _testHelpers['default'].editor.retargetRange;

  _module('Unit: PostEditor: #deleteRange');

  test('with collapsed range is no-op', function (assert) {
    var _buildFromText = buildFromText('abc|def');

    var post = _buildFromText.post;
    var range = _buildFromText.range;

    var _buildFromText2 = buildFromText('abc|def');

    var expectedPost = _buildFromText2.post;
    var expectedRange = _buildFromText2.range;

    var position = run(post, function (postEditor) {
      return postEditor.deleteRange(range);
    });

    expectedRange = retargetRange(expectedRange, post);

    assert.postIsSimilar(post, expectedPost);
    assert.rangeIsEqual(position.toRange(), expectedRange);
  });

  var expectationGroups = [{
    name: 'within a section (single section)',
    expectations: [['ab<c>', 'ab|', 'at tail'], ['<a>bc', '|bc', 'at head'], ['a<b>c', 'a|c', 'middle']]
  }, {
    name: 'within a section with markup (single section)',
    expectations: [['abc <*def*> ghi', 'abc | ghi', 'entire markup in middle'], ['abc *de<f* ghi>', 'abc *de|*', 'partial markup at end'], ['abc *de<f* g>hi', 'abc *de|*hi', 'partial markup in middle (right)'], ['ab<c *de>f* ghi', 'ab*|f* ghi', 'partial markup in middle (left)'], ['<abc *de>f* ghi', '*|f* ghi', 'partial markup at start']]
  }, {
    name: 'across markup section boundaries',
    expectations: [[['abc<', '>def'], 'abc|def', 'at boundary'], [['abc<', 'd>ef'], 'abc|ef', 'boundary into next section'], [['ab<c', '>def'], 'ab|def', 'section into boundary'], [['ab<c', 'd>ef'], 'ab|ef', 'containing boundary'], [['abc<', 'def', '>ghi'], 'abc|ghi', 'across section at boundary'], [['abc<', 'def', 'g>hi'], 'abc|hi', 'across section boundary containing next section'], [['ab<c', 'def', '>ghi'], 'ab|ghi', 'across section boundary containing before section'], [['ab<c', 'def', 'g>hi'], 'ab|hi', 'across section boundary containing before and after section']]
  }, {
    name: 'across markup section boundaries including markups',
    expectations: [[['*abc*<', '>def'], '*abc*|def', 'at boundary (left markup)'], [['*abc*<', 'd>ef'], '*abc*|ef', 'boundary into next section (left markup)'], [['*ab<c*', '>def'], '*ab*|def', 'section into boundary (left markup)'], [['*ab<c*', 'd>ef'], '*ab*|ef', 'containing boundary (left markup)'], [['abc<', '*>def*'], 'abc|*def*', 'at boundary (right markup)'], [['abc<', '*d>ef*'], 'abc|*ef*', 'boundary into next section (right markup)'], [['ab<c', '*>def*'], 'ab|*def*', 'section into boundary (right markup)'], [['ab<c', '*d>ef*'], 'ab|*ef*', 'containing boundary (right markup)'], [['abc<', '*def*', '>ghi'], 'abc|ghi', 'across section at boundary (containing markup)'], [['abc<', '*def*', 'g>hi'], 'abc|hi', 'across section boundary containing next section (containing markup)'], [['ab<c', '*def*', '>ghi'], 'ab|ghi', 'across section boundary containing before section (containing markup)'], [['ab<c', '*def*', 'g>hi'], 'ab|hi', 'across section boundary containing before and after section (containing markup)'], [['abc<', '*def*', '>*g*hi'], 'abc|*g*hi', 'across section at boundary (into markup)'], [['abc<', '*def*', '*g*>hi'], 'abc|hi', 'across section boundary containing next section (into markup)'], [['ab<c', '*def*', '>*g*hi'], 'ab|*g*hi', 'across section boundary containing before section (into markup)'], [['ab<c', '*def*', '*g*>hi'], 'ab|hi', 'across section boundary containing before and after section (into markup)']]
  }, {
    name: 'across markup/non-markup section boundaries',
    expectations: [[['[some-card]<', '>abc'], ['[some-card]|', 'abc'], 'card->markup start'], [['[some-card]<', '>'], ['[some-card]|'], 'card->blank-markup'], [['<[some-card]', 'a>bc'], ['|bc'], 'card->markup inner'], [['abc<', '>[some-card]'], ['abc|', '[some-card]'], 'markup->card'], [['abc<', '[some-card]', '>def'], ['abc|def'], 'containing card, boundaries in outer sections'], [['abc', '<[some-card]>', 'def'], ['abc', '|', 'def'], 'containing card, boundaries in card section'], [['<', '>[some-card]'], ['|[some-card]'], 'blank section into card']]
  }, {
    name: 'across list items',
    expectations: [[['* item 1<', '* >item 2'], ['* item 1|item 2'], 'at boundary'], [['* item <1', '* i>tem 2'], ['* item |tem 2'], 'surrounding boundary'], [['* item 1<', '* i>tem 2'], ['* item 1|tem 2'], 'boundary to next'], [['* item <1', '* >item 2'], ['* item |item 2'], 'prev to boundary'], [['* item 1<', '* middle', '* >item 2'], ['* item 1|item 2'], 'across item at boundary'], [['* item <1', '* middle', '* i>tem 2'], ['* item |tem 2'], 'across item surrounding boundary'], [['* item <1', '* middle', '* >item 2'], ['* item |item 2'], 'across item prev to boundary'], [['* item 1<', '* middle', '* i>tem 2'], ['* item 1|tem 2'], 'across item boundary to next'], [['* item 1<', 'middle', '* >item 2'], ['* item 1|item 2'], 'across markup at boundary'], [['* item <1', 'middle', '* i>tem 2'], ['* item |tem 2'], 'across markup surrounding boundary'], [['* item 1', '<middle', '* i>tem 2'], ['* item 1', '|tem 2'], 'across markup into next'], [['* item 1<', '>middle'], ['* item 1|middle'], 'item tail to markup head'], [['start<', '* >middle'], ['start|middle'], 'markup tail to item head'], [['* <', '>abc'], ['* |abc'], 'empty li into markup start'], [['* <', 'a>bc'], ['* |bc'], 'empty li into markup middle'], [['* <', 'abc>'], ['* |'], 'empty li into markup end'], [['* abc<', '>'], ['* abc|'], 'li into empty markup'], [['* <', '>'], ['* |'], 'empty li into empty markup']]
  }, {
    name: 'with atoms',
    expectations: [['abc<@>def', 'abc|def', 'surrounding'], ['abc<@d>ef', 'abc|ef', 'into atom into next marker'], ['ab<c@>def', 'ab|def', 'into marker into atom'], ['ab<c>@def', 'ab|@def', 'prev boundary'], ['abc@<d>ef', 'abc@|ef', 'next boundary']]
  }];

  expectationGroups.forEach(function (_ref) {
    var name = _ref.name;
    var expectations = _ref.expectations;

    expectations.forEach(function (_ref2) {
      var _ref22 = _slicedToArray(_ref2, 3);

      var before = _ref22[0];
      var after = _ref22[1];
      var msg = _ref22[2];

      test(name + ', "' + before + '" -> "' + after + '" (' + msg + ')', function (assert) {
        var _buildFromText3 = buildFromText(before);

        var post = _buildFromText3.post;
        var range = _buildFromText3.range;

        var _buildFromText4 = buildFromText(after);

        var expectedPost = _buildFromText4.post;
        var expectedRange = _buildFromText4.range;

        var position = run(post, function (postEditor) {
          return postEditor.deleteRange(range);
        });

        expectedRange = retargetRange(expectedRange, post);

        assert.postIsSimilar(post, expectedPost);
        assert.rangeIsEqual(position.toRange(), expectedRange);
      });
    });
  });

  var entirePostExpectations = [[['<abc>'], 'single section'], [['<[some-card]>'], 'single card'], [['<abc', 'def', 'ghi>'], 'multiple sections'], [['<>'], 'single blank section'], [['<', '', '>'], 'multiple blank sections'], [['<[some-card]', 'abc', '[some-card]>'], 'cards at head/tail, containing markup section'], [['<abc', '[some-card]', 'def>'], 'markup sections containing card'], [['<[some-card]', 'abc>'], 'card->markup'], [['<abc', '[some-card]>'], 'markup->card']];

  entirePostExpectations.forEach(function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var text = _ref32[0];
    var msg = _ref32[1];

    test('entire post "' + text + '" (' + msg + ')', function (assert) {
      var _buildFromText5 = buildFromText(text);

      var post = _buildFromText5.post;
      var range = _buildFromText5.range;

      var position = run(post, function (postEditor) {
        return postEditor.deleteRange(range);
      });

      assert.ok(post.sections.length === 1 && post.sections.head.isBlank, 'post has single blank section after deleteRange (' + msg + ')');
      assert.ok(position.section === post.sections.head, 'position#section is correct (' + msg + ')');
      assert.equal(position.offset, 0, 'position#offset is correct (' + msg + ')');
    });
  });
});
define('tests/unit/editor/post-test', ['exports', 'mobiledoc-kit/editor/post', 'mobiledoc-kit', '../../test-helpers', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/utils/cursor/range'], function (exports, _mobiledocKitEditorPost, _mobiledocKit, _testHelpers, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitUtilsCursorRange) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  var builder = undefined,
      postEditor = undefined,
      mockEditor = undefined;

  var _Helpers$postEditor = _testHelpers['default'].postEditor;
  var MockEditor = _Helpers$postEditor.MockEditor;
  var renderBuiltAbstract = _Helpers$postEditor.renderBuiltAbstract;

  function buildEditorWithMobiledoc(builderFn) {
    var autofocus = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    var mobiledoc = _testHelpers['default'].mobiledoc.build(builderFn);
    var unknownCardHandler = function unknownCardHandler() {};
    var unknownAtomHandler = function unknownAtomHandler() {};
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc, unknownCardHandler: unknownCardHandler, unknownAtomHandler: unknownAtomHandler, autofocus: autofocus });
    editor.render(editorElement);
    var selectRange = editor.selectRange;
    editor.selectRange = function (range) {
      selectRange.call(editor, range);
      // Store the rendered range so the test can make assertions with it
      editor._renderedRange = range;
    };
    return editor;
  }

  _module('Unit: PostEditor', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      mockEditor = new MockEditor(builder);
      postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('#splitMarkers when headMarker = tailMarker', function (assert) {
    var post = undefined,
        section = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref) {
      var marker = _ref.marker;
      var markupSection = _ref.markupSection;
      var buildPost = _ref.post;

      section = markupSection('p', [marker('abcd')]);
      post = buildPost([section]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);

    var postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 3);
    var markers = postEditor.splitMarkers(range);
    postEditor.complete();

    assert.equal(markers.length, 1, 'markers');
    assert.equal(markers[0].value, 'bc', 'marker 0');
  });

  test('#splitMarkers when head section = tail section, but different markers', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var marker = _ref2.marker;
      var markupSection = _ref2.markupSection;
      var post = _ref2.post;
      return post([markupSection('p', [marker('abc'), marker('def')])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);

    var section = post.sections.head;
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 2, section, 5);
    var postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    var markers = postEditor.splitMarkers(range);
    postEditor.complete();

    assert.equal(markers.length, 2, 'markers');
    assert.equal(markers[0].value, 'c', 'marker 0');
    assert.equal(markers[1].value, 'de', 'marker 1');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/121
  test('#splitMarkers when single-character marker at start', function (assert) {
    var post = undefined,
        section = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref3) {
      var marker = _ref3.marker;
      var markupSection = _ref3.markupSection;
      var buildPost = _ref3.post;

      section = markupSection('p', [marker('a'), marker('b'), marker('c')]);
      post = buildPost([section]);
    });

    renderBuiltAbstract(post, mockEditor);

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 3);
    var markers = postEditor.splitMarkers(range);
    postEditor.complete();

    assert.equal(markers.length, 2, 'markers');
    assert.equal(markers[0].value, 'b', 'marker 0');
    assert.equal(markers[1].value, 'c', 'marker 1');
  });

  test('#replaceSection one markup section with another', function (assert) {
    var _section1 = undefined,
        _section2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      _section1 = markupSection('p', [marker('abc')]);
      _section2 = markupSection('p', [marker('123')]);
      return post([_section1]);
    });
    renderBuiltAbstract(post, mockEditor);

    assert.equal(post.sections.head.text, 'abc', 'precond - section text');
    assert.equal(post.sections.length, 1, 'precond - only 1 section');
    postEditor.replaceSection(_section1, _section2);
    postEditor.complete();

    assert.equal(post.sections.head.text, '123', 'section replaced');
    assert.equal(post.sections.length, 1, 'only 1 section');
  });

  test('#replaceSection markup section with list section', function (assert) {
    var _section1 = undefined,
        _section2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var listSection = _ref5.listSection;
      var listItem = _ref5.listItem;
      var marker = _ref5.marker;

      _section1 = markupSection('p', [marker('abc')]);
      _section2 = listSection('ul', [listItem([marker('123')])]);
      return post([_section1]);
    });
    renderBuiltAbstract(post, mockEditor);

    assert.equal(post.sections.head.text, 'abc', 'precond - section text');
    assert.equal(post.sections.length, 1, 'precond - only 1 section');
    postEditor.replaceSection(_section1, _section2);
    postEditor.complete();

    assert.equal(post.sections.head.items.head.text, '123', 'section replaced');
    assert.equal(post.sections.length, 1, 'only 1 section');
  });

  test('#replaceSection solo list item with markup section removes list section', function (assert) {
    var _section1 = undefined,
        _section2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var listSection = _ref6.listSection;
      var listItem = _ref6.listItem;
      var marker = _ref6.marker;

      _section1 = listItem([marker('abc')]);
      _section2 = markupSection('p', [marker('123')]);
      return post([listSection('ul', [_section1])]);
    });
    renderBuiltAbstract(post, mockEditor);

    assert.equal(post.sections.head.items.head.text, 'abc', 'precond - list item text');
    assert.equal(post.sections.length, 1, 'precond - only 1 section');
    postEditor.replaceSection(_section1, _section2);
    postEditor.complete();

    assert.equal(post.sections.head.text, '123', 'section replaced');
    assert.equal(post.sections.length, 1, 'only 1 section');
  });

  /*
   * FIXME, this test should be made to pass, but it is not a situation that we
   * run into in the actual life of the editor right now.
  
  test('#replaceSection middle list item with markup section cuts list into two', (assert) => {
    let _section1, _section2;
    const post = Helpers.postAbstract.build(
      ({post, markupSection, listSection, listItem, marker}) => {
      _section1 = listItem([marker('li 2')]);
      _section2 = markupSection('p', [marker('123')]);
      return post([listSection('ul', [
        listItem([marker('li 1')]),
        _section1,
        listItem([marker('li 3')])
      ])]);
    });
    renderBuiltAbstract(post, mockEditor);
  
    assert.equal(post.sections.head.items.length, 3, 'precond - 3 lis');
    assert.equal(post.sections.head.items.objectAt(1).text, 'li 2', 'precond - list item text');
    assert.equal(post.sections.length, 1, 'precond - only 1 section');
    postEditor.replaceSection(_section1, _section2);
    postEditor.complete();
  
    assert.equal(post.sections.length, 3, '3 sections');
    assert.equal(post.sections.head.items.length, 1, '1 li in 1st ul');
    assert.equal(post.sections.objectAt(1).text, '123', 'new section text is there');
    assert.equal(post.sections.tail.items.length, 1, '1 li in last ul');
  });
  
  */

  test('#replaceSection last list item with markup section when multiple list items appends after list section', function (assert) {
    var _section1 = undefined,
        _section2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var listSection = _ref7.listSection;
      var listItem = _ref7.listItem;
      var marker = _ref7.marker;

      _section1 = listItem([marker('abc')]);
      _section2 = markupSection('p', [marker('123')]);
      return post([listSection('ul', [listItem([marker('before li')]), _section1])]);
    });
    renderBuiltAbstract(post, mockEditor);

    assert.equal(post.sections.head.items.length, 2, 'precond - 2 lis');
    assert.equal(post.sections.head.items.tail.text, 'abc', 'precond - list item text');
    assert.equal(post.sections.length, 1, 'precond - only 1 section');
    postEditor.replaceSection(_section1, _section2);
    postEditor.complete();

    assert.equal(post.sections.head.items.length, 1, 'only 1 li');
    assert.equal(post.sections.head.items.head.text, 'before li', 'first li remains');
    assert.equal(post.sections.length, 2, '2 sections');
    assert.equal(post.sections.tail.text, '123', 'new section text is there');
  });

  test('#replaceSection when section is null appends new section', function (assert) {
    var newEmptySection = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;

      newEmptySection = markupSection('p');
      return post();
    });
    renderBuiltAbstract(post, mockEditor);

    assert.equal(post.sections.length, 0, 'precond - no sections');
    postEditor.replaceSection(null, newEmptySection);
    postEditor.complete();

    assert.equal(post.sections.length, 1, 'has 1 section');
    assert.equal(post.sections.head.text, '', 'no text in new section');
  });

  test('#insertSectionAtEnd inserts the section at the end of the mobiledoc', function (assert) {
    var newSection = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      newSection = markupSection('p', [marker('123')]);
      return post([markupSection('p', [marker('abc')])]);
    });
    renderBuiltAbstract(post, mockEditor);

    postEditor.insertSectionAtEnd(newSection);
    postEditor.complete();

    assert.equal(post.sections.length, 2, 'new section added');
    assert.equal(post.sections.tail.text, '123', 'new section added at end');
  });

  test('markers with identical non-attribute markups get coalesced after applying or removing markup', function (assert) {
    var strong = undefined,
        section = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;
      var markup = _ref10.markup;

      strong = markup('strong');
      section = markupSection('p', [marker('a'), marker('b', [strong]), marker('c')]);
      return post([section]);
    });
    renderBuiltAbstract(post, mockEditor);

    // removing the strong from the "b"
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 2);
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.removeMarkupFromRange(range, strong);
    postEditor.complete();

    assert.equal(section.markers.length, 1, 'similar markers are coalesced');
    assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
    assert.ok(!section.markers.head.hasMarkup(strong), 'marker has no bold');

    // adding strong to each of the characters individually
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    for (var i = 0; i < section.length; i++) {
      range = _mobiledocKitUtilsCursorRange['default'].create(section, i, section, i + 1);
      postEditor.addMarkupToRange(range, strong);
    }
    postEditor.complete();

    assert.equal(section.markers.length, 1, 'bold markers coalesced');
    assert.equal(section.markers.head.value, 'abc', 'bold marker value is correct');
    assert.ok(section.markers.head.hasMarkup(strong), 'bold marker has bold');
  });

  test('markers do not get coalesced with atoms', function (assert) {
    var strong = undefined,
        section = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref11) {
      var post = _ref11.post;
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;
      var atom = _ref11.atom;
      var markup = _ref11.markup;

      strong = markup('strong');
      section = markupSection('p', [atom('the-atom', 'A'), marker('b', [strong])]);
      return post([section]);
    });
    renderBuiltAbstract(post, mockEditor);

    // removing the strong from the "b"
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, 2);
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.removeMarkupFromRange(range, strong);
    postEditor.complete();

    assert.equal(section.markers.length, 2, 'still 2 markers');
    assert.equal(section.markers.head.value, 'A', 'head marker value is correct');
    assert.ok(section.markers.head.isAtom, 'head marker is atom');
    assert.equal(section.markers.tail.value, 'b', 'tail marker value is correct');
    assert.ok(section.markers.tail.isMarker, 'tail marker is marker');

    assert.ok(!section.markers.head.hasMarkup(strong), 'head marker has no bold');
    assert.ok(!section.markers.tail.hasMarkup(strong), 'tail marker has no bold');
  });

  test('neighboring atoms do not get coalesced', function (assert) {
    var strong = undefined,
        section = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref12) {
      var post = _ref12.post;
      var markupSection = _ref12.markupSection;
      var marker = _ref12.marker;
      var atom = _ref12.atom;
      var markup = _ref12.markup;

      strong = markup('strong');
      section = markupSection('p', [atom('the-atom', 'A', {}, [strong]), atom('the-atom', 'A', {}, [strong])]);
      return post([section]);
    });
    renderBuiltAbstract(post, mockEditor);

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, 2);
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.removeMarkupFromRange(range, strong);
    postEditor.complete();

    assert.equal(section.markers.length, 2, 'atoms not coalesced');
    assert.ok(!section.markers.head.hasMarkup(strong));
    assert.ok(!section.markers.tail.hasMarkup(strong));
  });

  test('#removeMarkupFromRange is no-op with collapsed range', function (assert) {
    var section = undefined,
        markup = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref13) {
      var post = _ref13.post;
      var markupSection = _ref13.markupSection;
      var marker = _ref13.marker;
      var buildMarkup = _ref13.markup;

      markup = buildMarkup('strong');
      section = markupSection('p', [marker('abc')]);
      return post([section]);
    });
    renderBuiltAbstract(post, mockEditor);

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 1);
    postEditor.removeMarkupFromRange(range, markup);
    postEditor.complete();

    assert.equal(section.markers.length, 1, 'similar markers are coalesced');
    assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
    assert.ok(!section.markers.head.hasMarkup(markup), 'marker has no markup');
  });

  test('#removeMarkupFromRange splits markers when necessary', function (assert) {
    var bold = undefined,
        section = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref14) {
      var post = _ref14.post;
      var marker = _ref14.marker;
      var markup = _ref14.markup;
      var markupSection = _ref14.markupSection;

      bold = markup('b');
      section = markupSection('p', [marker('abc', [bold]), marker('def')]);
      return post([section]);
    });

    renderBuiltAbstract(post, mockEditor);

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 'a'.length, section, 'abcd'.length);

    postEditor.removeMarkupFromRange(range, bold);
    postEditor.complete();

    assert.equal(section.text, 'abcdef', 'text still correct');
    assert.equal(section.markers.length, 2, '2 markers');

    var _section$markers$toArray = section.markers.toArray();

    var _section$markers$toArray2 = _slicedToArray(_section$markers$toArray, 2);

    var head = _section$markers$toArray2[0];
    var tail = _section$markers$toArray2[1];

    assert.equal(head.value, 'a', 'head marker value');
    assert.ok(head.hasMarkup(bold), 'head has bold');
    assert.equal(tail.value, 'bcdef', 'tail marker value');
    assert.ok(!tail.hasMarkup(bold), 'tail has no bold');
  });

  test('#removeMarkupFromRange handles atoms correctly', function (assert) {
    var bold = undefined,
        section = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref15) {
      var post = _ref15.post;
      var marker = _ref15.marker;
      var markup = _ref15.markup;
      var atom = _ref15.atom;
      var markupSection = _ref15.markupSection;

      bold = markup('b');
      section = markupSection('p', [atom('the-atom', 'n/a', {}, [bold]), marker('X')]);
      return post([section]);
    });

    renderBuiltAbstract(post, mockEditor);

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, 2);

    postEditor.removeMarkupFromRange(range, bold);
    postEditor.complete();

    assert.equal(section.markers.length, 2, '2 markers');

    var _section$markers$toArray3 = section.markers.toArray();

    var _section$markers$toArray32 = _slicedToArray(_section$markers$toArray3, 2);

    var head = _section$markers$toArray32[0];
    var tail = _section$markers$toArray32[1];

    assert.ok(head.isAtom, 'head is atom');
    assert.ok(!head.hasMarkup(bold), 'head has no bold');

    assert.equal(tail.value, 'X', 'tail marker value');
    assert.ok(!tail.hasMarkup(bold), 'tail has no bold');
  });

  test('#addMarkupToRange is no-op with collapsed range', function (assert) {
    var section = undefined,
        markup = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref16) {
      var post = _ref16.post;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;
      var buildMarkup = _ref16.markup;

      markup = buildMarkup('strong');
      section = markupSection('p', [marker('abc')]);
      return post([section]);
    });
    renderBuiltAbstract(post, mockEditor);

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 1);
    postEditor.addMarkupToRange(range, markup);
    postEditor.complete();

    assert.equal(section.markers.length, 1, 'similar markers are coalesced');
    assert.equal(section.markers.head.value, 'abc', 'marker value is correct');
    assert.ok(!section.markers.head.hasMarkup(markup), 'marker has no markup');
  });

  test("#addMarkupToRange around a markup pushes the new markup below existing ones", function (assert) {
    var em = undefined;
    var editor = buildEditorWithMobiledoc(function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var marker = _ref17.marker;
      var markup = _ref17.markup;

      em = markup('em');
      return post([markupSection('p', [marker('one '), marker('BOLD', [markup('b')]), marker(' two')])]);
    });

    var section = editor.post.sections.head;

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, 'one BOLD two'.length);
    editor.run(function (postEditor) {
      postEditor.addMarkupToRange(range, em);
    });

    var markers = section.markers.toArray();
    assert.equal(markers[0].closedMarkups.length, 0, 'Existing markup is not closed');

    assert.equal(editor.element.innerHTML, '<p><em>one <b>BOLD</b> two</em></p>');
  });

  test("#addMarkupToRange within a markup puts the new markup on top of the stack", function (assert) {
    var b = undefined;
    var editor = buildEditorWithMobiledoc(function (_ref18) {
      var post = _ref18.post;
      var markupSection = _ref18.markupSection;
      var marker = _ref18.marker;
      var markup = _ref18.markup;

      b = markup('b');
      return post([markupSection('p', [marker('one BOLD two', [markup('em')])])]);
    });

    var section = editor.post.sections.head;

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 'one '.length, section, 'one BOLD'.length);
    editor.run(function (postEditor) {
      postEditor.addMarkupToRange(range, b);
    });

    var markers = section.markers.toArray();
    assert.equal(markers[0].closedMarkups.length, 0, 'Existing markup is not closed');

    assert.equal(editor.element.innerHTML, '<p><em>one <b>BOLD</b> two</em></p>');
  });

  test("#addMarkupToRange straddling the open tag of an existing markup, closes and reopens the existing markup", function (assert) {
    var em = undefined;
    var editor = buildEditorWithMobiledoc(function (_ref19) {
      var post = _ref19.post;
      var markupSection = _ref19.markupSection;
      var marker = _ref19.marker;
      var markup = _ref19.markup;

      em = markup('em');
      return post([markupSection('p', [marker('_one '), marker('TWO_ THREE', [markup('b')])])]);
    });

    var section = editor.post.sections.head;
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, '_one TWO_'.length);

    editor.run(function (postEditor) {
      postEditor.addMarkupToRange(range, em);
    });

    assert.equal(editor.element.innerHTML, '<p><em>_one <b>TWO_</b></em><b> THREE</b></p>');
  });

  test("#addMarkupToRange straddling the closing tag of an existing markup, closes and reopens the existing markup", function (assert) {
    var em = undefined;
    var editor = buildEditorWithMobiledoc(function (_ref20) {
      var post = _ref20.post;
      var markupSection = _ref20.markupSection;
      var marker = _ref20.marker;
      var markup = _ref20.markup;

      em = markup('em');
      return post([markupSection('p', [marker('ONE _TWO', [markup('b')]), marker(' three_')])]);
    });

    var section = editor.post.sections.head;
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 'ONE '.length, section, 'ONE _TWO three_'.length);

    editor.run(function (postEditor) {
      postEditor.addMarkupToRange(range, em);
    });

    assert.equal(editor.element.innerHTML, '<p><b>ONE </b><em><b>_TWO</b> three_</em></p>');
  });

  test('markers with identical markups get coalesced after deletion', function (assert) {
    var strong = undefined,
        section = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref21) {
      var post = _ref21.post;
      var markupSection = _ref21.markupSection;
      var marker = _ref21.marker;
      var markup = _ref21.markup;

      strong = markup('strong');
      section = markupSection('p', [marker('a'), marker('b', [strong]), marker('c')]);
      return post([section]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);

    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 2);
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.deleteRange(range);
    postEditor.complete();

    assert.equal(section.markers.length, 1, 'similar markers are coalesced');
    assert.equal(section.markers.head.value, 'ac', 'marker value is correct');
  });

  test('#moveSectionBefore moves the section as expected', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref22) {
      var post = _ref22.post;
      var markupSection = _ref22.markupSection;
      var marker = _ref22.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('123')])]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);

    var _post$sections$toArray = post.sections.toArray();

    var _post$sections$toArray2 = _slicedToArray(_post$sections$toArray, 2);

    var headSection = _post$sections$toArray2[0];
    var tailSection = _post$sections$toArray2[1];

    var collection = post.sections;
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    var movedSection = postEditor.moveSectionBefore(collection, tailSection, headSection);
    postEditor.complete();

    assert.equal(post.sections.head, movedSection, 'movedSection is returned');
    assert.equal(post.sections.head.text, '123', 'tail section is now head');
    assert.equal(post.sections.tail.text, 'abc', 'head section is now tail');
  });

  test('#moveSectionBefore moves card sections', function (assert) {
    var listiclePayload = { some: 'thing' };
    var otherPayload = { some: 'other thing' };
    var post = _testHelpers['default'].postAbstract.build(function (_ref23) {
      var post = _ref23.post;
      var cardSection = _ref23.cardSection;

      return post([cardSection('listicle-card', listiclePayload), cardSection('other-card', otherPayload)]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);

    var collection = post.sections;

    var _post$sections$toArray3 = post.sections.toArray();

    var _post$sections$toArray32 = _slicedToArray(_post$sections$toArray3, 2);

    var headSection = _post$sections$toArray32[0];
    var tailSection = _post$sections$toArray32[1];

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.moveSectionBefore(collection, tailSection, headSection);
    postEditor.complete();

    var _post$sections$toArray4 = post.sections.toArray();

    var _post$sections$toArray42 = _slicedToArray(_post$sections$toArray4, 2);

    headSection = _post$sections$toArray42[0];
    tailSection = _post$sections$toArray42[1];

    assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
    assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');
    assert.deepEqual(headSection.payload, otherPayload, 'payload is correct for other-card');
    assert.deepEqual(tailSection.payload, listiclePayload, 'payload is correct for listicle-card');
  });

  test('#moveSectionUp moves it up', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref24) {
      var post = _ref24.post;
      var cardSection = _ref24.cardSection;

      return post([cardSection('listicle-card'), cardSection('other-card')]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);

    var _post$sections$toArray5 = post.sections.toArray();

    var _post$sections$toArray52 = _slicedToArray(_post$sections$toArray5, 2);

    var headSection = _post$sections$toArray52[0];
    var tailSection = _post$sections$toArray52[1];

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.moveSectionUp(tailSection);
    postEditor.complete();

    var _post$sections$toArray6 = post.sections.toArray();

    var _post$sections$toArray62 = _slicedToArray(_post$sections$toArray6, 2);

    headSection = _post$sections$toArray62[0];
    tailSection = _post$sections$toArray62[1];

    assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
    assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    var movedSection = postEditor.moveSectionUp(headSection);
    postEditor.complete();

    var _post$sections$toArray7 = post.sections.toArray();

    var _post$sections$toArray72 = _slicedToArray(_post$sections$toArray7, 2);

    headSection = _post$sections$toArray72[0];
    tailSection = _post$sections$toArray72[1];

    assert.equal(post.sections.head, movedSection, 'movedSection is returned');
    assert.equal(headSection.name, 'other-card', 'moveSectionUp is no-op when card is at top');
  });

  test('moveSectionDown moves it down', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref25) {
      var post = _ref25.post;
      var cardSection = _ref25.cardSection;

      return post([cardSection('listicle-card'), cardSection('other-card')]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);

    var _post$sections$toArray8 = post.sections.toArray();

    var _post$sections$toArray82 = _slicedToArray(_post$sections$toArray8, 2);

    var headSection = _post$sections$toArray82[0];
    var tailSection = _post$sections$toArray82[1];

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.moveSectionDown(headSection);
    postEditor.complete();

    var _post$sections$toArray9 = post.sections.toArray();

    var _post$sections$toArray92 = _slicedToArray(_post$sections$toArray9, 2);

    headSection = _post$sections$toArray92[0];
    tailSection = _post$sections$toArray92[1];

    assert.equal(headSection.name, 'other-card', 'other-card moved to first spot');
    assert.equal(tailSection.name, 'listicle-card', 'listicle-card moved to last spot');

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    var movedSection = postEditor.moveSectionDown(tailSection);
    postEditor.complete();

    var _post$sections$toArray10 = post.sections.toArray();

    var _post$sections$toArray102 = _slicedToArray(_post$sections$toArray10, 2);

    headSection = _post$sections$toArray102[0];
    tailSection = _post$sections$toArray102[1];

    assert.equal(post.sections.tail, movedSection, 'movedSection is returned');
    assert.equal(tailSection.name, 'listicle-card', 'moveSectionDown is no-op when card is at bottom');
  });

  test('#setAttribute on empty Mobiledoc does nothing', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref26) {
      var post = _ref26.post;
      var markupSection = _ref26.markupSection;

      return post([]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].blankRange();

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.setAttribute('text-align', 'center', range);
    postEditor.complete();

    assert.postIsSimilar(postEditor.editor.post, post);
  });

  test('#setAttribute sets attribute of a single section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref27) {
      var post = _ref27.post;
      var markupSection = _ref27.markupSection;

      return post([markupSection('p')]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0);

    assert.deepEqual(post.sections.head.attributes, {});

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.setAttribute('text-align', 'center', range);
    postEditor.complete();

    assert.deepEqual(post.sections.head.attributes, {
      'data-md-text-align': 'center'
    });
  });

  test('#removeAttribute removes attribute of a single section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref28) {
      var post = _ref28.post;
      var markupSection = _ref28.markupSection;

      return post([markupSection('p', [], false, { 'data-md-text-align': 'center' })]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0);

    assert.deepEqual(post.sections.head.attributes, {
      'data-md-text-align': 'center'
    });

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.removeAttribute('text-align', range);
    postEditor.complete();

    assert.deepEqual(post.sections.head.attributes, {});
  });

  test('#setAttribute sets attribute of multiple sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref29) {
      var post = _ref29.post;
      var markupSection = _ref29.markupSection;
      var marker = _ref29.marker;
      var cardSection = _ref29.cardSection;

      return post([markupSection('p', [marker('abc')]), cardSection('my-card'), markupSection('p', [marker('123')])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0, post.sections.tail, 2);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.setAttribute('text-align', 'center', range);
    postEditor.complete();

    assert.deepEqual(post.sections.head.attributes, {
      'data-md-text-align': 'center'
    });
    assert.ok(post.sections.objectAt(1).isCardSection);
    assert.deepEqual(post.sections.tail.attributes, {
      'data-md-text-align': 'center'
    });
  });

  test('#removeAttribute removes attribute of multiple sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref30) {
      var post = _ref30.post;
      var markupSection = _ref30.markupSection;
      var marker = _ref30.marker;
      var cardSection = _ref30.cardSection;

      return post([markupSection('p', [marker('abc')], false, { 'data-md-text-align': 'center' }), cardSection('my-card'), markupSection('p', [marker('123')], { 'data-md-text-align': 'left' })]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0, post.sections.tail, 2);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.removeAttribute('text-align', range);
    postEditor.complete();

    assert.deepEqual(post.sections.head.attributes, {});
    assert.ok(post.sections.objectAt(1).isCardSection);
    assert.deepEqual(post.sections.tail.attributes, {});
  });

  test('#setAttribute sets attribute of a single list', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref31) {
      var post = _ref31.post;
      var listSection = _ref31.listSection;
      var listItem = _ref31.listItem;
      var marker = _ref31.marker;
      var markup = _ref31.markup;

      return post([listSection('ul', [listItem([marker('a')]), listItem([marker('def')])])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.setAttribute('text-align', 'center', range);
    postEditor.complete();

    assert.deepEqual(post.sections.head.attributes, {
      'data-md-text-align': 'center'
    });
  });

  test('#setAttribute when cursor is in non-markerable section changes nothing', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref32) {
      var post = _ref32.post;
      var markupSection = _ref32.markupSection;
      var marker = _ref32.marker;
      var cardSection = _ref32.cardSection;

      return post([cardSection('my-card')]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = post.sections.head.headPosition().toRange();

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.setAttribute('text-align', 'center', range);
    postEditor.complete();

    assert.ok(post.sections.head.isCardSection, 'card section not changed');
    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
  });

  test('#toggleSection changes single section to and from tag name', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref33) {
      var post = _ref33.post;
      var markupSection = _ref33.markupSection;

      return post([markupSection('p')]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('blockquote', range);
    postEditor.complete();

    assert.equal(post.sections.head.tagName, 'blockquote');

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('blockquote', range);
    postEditor.complete();

    assert.equal(post.sections.head.tagName, 'p');
    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
  });

  test('#toggleSection changes multiple sections to and from tag name', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref34) {
      var post = _ref34.post;
      var markupSection = _ref34.markupSection;
      var marker = _ref34.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('123')])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 2, post.sections.tail, 2);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('blockquote', range);
    postEditor.complete();

    assert.equal(post.sections.head.tagName, 'blockquote');
    assert.equal(post.sections.tail.tagName, 'blockquote');

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('blockquote', range);
    postEditor.complete();

    assert.equal(post.sections.head.tagName, 'p');
    assert.equal(post.sections.tail.tagName, 'p');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.toPosition(2), 'Maintains the selection');
    assert.positionIsEqual(mockEditor._renderedRange.tail, post.sections.tail.toPosition(2), 'Maintains the selection');
  });

  test('#toggleSection skips over non-markerable sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref35) {
      var post = _ref35.post;
      var markupSection = _ref35.markupSection;
      var marker = _ref35.marker;
      var cardSection = _ref35.cardSection;

      return post([markupSection('p', [marker('abc')]), cardSection('my-card'), markupSection('p', [marker('123')])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0, post.sections.tail, 2);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('blockquote', range);
    postEditor.complete();

    assert.equal(post.sections.head.tagName, 'blockquote');
    assert.ok(post.sections.objectAt(1).isCardSection);
    assert.equal(post.sections.tail.tagName, 'blockquote');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
  });

  test('#toggleSection when cursor is in non-markerable section changes nothing', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref36) {
      var post = _ref36.post;
      var markupSection = _ref36.markupSection;
      var marker = _ref36.marker;
      var cardSection = _ref36.cardSection;

      return post([cardSection('my-card')]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = post.sections.head.headPosition().toRange();

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('blockquote', range);
    postEditor.complete();

    assert.ok(post.sections.head.isCardSection, 'card section not changed');
    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
  });

  test('#toggleSection when editor has no cursor does nothing', function (assert) {
    assert.expect(6);
    var done = assert.async();

    editor = buildEditorWithMobiledoc(function (_ref37) {
      var post = _ref37.post;
      var markupSection = _ref37.markupSection;
      var marker = _ref37.marker;

      return post([markupSection('p', [marker('abc')])]);
    }, false);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref38) {
      var post = _ref38.post;
      var markupSection = _ref38.markupSection;
      var marker = _ref38.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    assert.ok(!editor.hasCursor(), 'editor has no cursor');
    assert.ok(editor.range.isBlank, 'editor has blank range');

    editor.run(function (postEditor) {
      return postEditor.toggleSection('blockquote');
    });

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.ok(document.activeElement !== editorElement, 'editor element is not active');
      assert.ok(editor.range.isBlank, 'rendered range is blank');
      assert.equal(window.getSelection().rangeCount, 0, 'nothing selected');

      done();
    });
  });

  test('#toggleSection toggle single p -> list item', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref39) {
      var post = _ref39.post;
      var markupSection = _ref39.markupSection;
      var marker = _ref39.marker;
      var markup = _ref39.markup;

      return post([markupSection('p', [marker('a'), marker('b', [markup('b')]), marker('c')])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 1);
    var listSection = post.sections.head;
    assert.ok(listSection.isListSection);
    assert.equal(listSection.tagName, 'ul');
    assert.equal(listSection.items.length, 1);
    assert.equal(listSection.items.head.text, 'abc');
    var item = listSection.items.head;
    assert.equal(item.markers.length, 3);
    assert.equal(item.markers.objectAt(0).value, 'a');
    assert.equal(item.markers.objectAt(1).value, 'b');
    assert.ok(item.markers.objectAt(1).hasMarkup('b'), 'b has b markup');
    assert.equal(item.markers.objectAt(2).value, 'c');
  });

  test('#toggleSection toggle single list item -> p', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref40) {
      var post = _ref40.post;
      var listSection = _ref40.listSection;
      var listItem = _ref40.listItem;
      var marker = _ref40.marker;
      var markup = _ref40.markup;

      return post([listSection('ul', [listItem([marker('a'), marker('b', [markup('b')]), marker('c')])])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 1);
    assert.equal(post.sections.head.tagName, 'p');
    assert.equal(post.sections.head.text, 'abc');
    assert.equal(post.sections.head.markers.length, 3);
    assert.equal(post.sections.head.markers.objectAt(0).value, 'a');
    assert.equal(post.sections.head.markers.objectAt(1).value, 'b');
    assert.ok(post.sections.head.markers.objectAt(1).hasMarkup('b'), 'b has b markup');
    assert.equal(post.sections.head.markers.objectAt(2).value, 'c');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
  });

  test('#toggleSection toggle multiple ps -> list and list -> multiple ps', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref41) {
      var post = _ref41.post;
      var markupSection = _ref41.markupSection;
      var marker = _ref41.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('123')])]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    var _editor = editor;
    var post = _editor.post;

    editor.render(editorElement);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0, post.sections.tail, 2);

    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    var listSection = post.sections.head;
    assert.equal(post.sections.length, 1, 'post has 1 list section after toggle');
    assert.ok(listSection.isListSection);
    assert.equal(listSection.tagName, 'ul');
    assert.equal(listSection.items.length, 2, '2 list items');
    assert.equal(listSection.items.head.text, 'abc');
    assert.equal(listSection.items.tail.text, '123');

    range = _mobiledocKitUtilsCursorRange['default'].create(listSection.items.head, 0, listSection.items.tail, 0);
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 2, 'post has 2 sections after toggle');
    assert.equal(post.sections.head.tagName, 'p');
    assert.equal(post.sections.tail.tagName, 'p');
    assert.equal(post.sections.head.text, 'abc');
    assert.equal(post.sections.tail.text, '123');

    assert.ok(editor.range.head.section === post.sections.head, 'selected head correct');
    assert.equal(editor.range.head.offset, 0);
  });

  test('#toggleSection untoggle first list item changes it to markup section, retains markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref42) {
      var post = _ref42.post;
      var listSection = _ref42.listSection;
      var listItem = _ref42.listItem;
      var marker = _ref42.marker;
      var markup = _ref42.markup;

      return post([listSection('ul', [listItem([marker('a'), marker('b', [markup('b')]), marker('c')]), listItem([marker('def')]), listItem([marker('ghi')])])]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 2, '2 sections');
    assert.equal(post.sections.head.tagName, 'p', 'head section is p');
    assert.equal(post.sections.head.text, 'abc');
    var section = post.sections.head;
    assert.equal(section.markers.length, 3);
    assert.equal(section.markers.objectAt(0).value, 'a');
    assert.ok(section.markers.objectAt(1).hasMarkup('b'), 'b has b markup');
    assert.equal(section.markers.objectAt(2).value, 'c');
    assert.ok(post.sections.tail.isListSection, 'tail is list section');
    assert.equal(post.sections.tail.items.length, 2, '2 items in list');
    assert.equal(post.sections.tail.items.head.text, 'def');
    assert.equal(post.sections.tail.items.tail.text, 'ghi');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
  });

  test('#toggleSection untoggle middle list item changes it to markup section, retaining markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref43) {
      var post = _ref43.post;
      var listSection = _ref43.listSection;
      var listItem = _ref43.listItem;
      var marker = _ref43.marker;
      var markup = _ref43.markup;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('d'), marker('e', [markup('b')]), marker('f')]), listItem([marker('ghi')])])]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.objectAt(1), 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 3, '3 sections');
    var section = post.sections.objectAt(1);
    assert.equal(section.tagName, 'p', 'middle section is p');
    assert.equal(section.text, 'def');
    assert.equal(section.markers.length, 3);
    assert.equal(section.markers.objectAt(0).value, 'd');
    assert.equal(section.markers.objectAt(1).value, 'e');
    assert.ok(section.markers.objectAt(1).hasMarkup('b'), 'e has b markup');
    assert.equal(section.markers.objectAt(2).value, 'f');
    assert.positionIsEqual(mockEditor._renderedRange.head, section.headPosition());

    assert.ok(post.sections.head.isListSection, 'head section is list');
    assert.ok(post.sections.tail.isListSection, 'tail section is list');
    assert.equal(post.sections.head.items.length, 1, '1 item in first list');
    assert.equal(post.sections.tail.items.length, 1, '1 item in last list');
    assert.equal(post.sections.head.items.head.text, 'abc');
    assert.equal(post.sections.tail.items.head.text, 'ghi');
  });

  test('#toggleSection toggle markup section -> ul between lists joins the lists', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref44) {
      var post = _ref44.post;
      var listSection = _ref44.listSection;
      var listItem = _ref44.listItem;
      var marker = _ref44.marker;
      var markupSection = _ref44.markupSection;

      return post([listSection('ul', [listItem([marker('abc')])]), markupSection('p', [marker('123')]), listSection('ul', [listItem([marker('def')])])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    var _editor2 = editor;
    var post = _editor2.post;

    editor.render(editorElement);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.objectAt(1), 0);

    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 1, '1 sections');
    var section = post.sections.head;
    assert.ok(section.isListSection, 'list section');
    assert.equal(section.items.length, 3, '3 items');
    assert.deepEqual(section.items.map(function (i) {
      return i.text;
    }), ['abc', '123', 'def']);

    var listItem = section.items.objectAt(1);
    assert.ok(editor.range.head.section === listItem, 'correct head selection');
    assert.equal(editor.range.head.offset, 0);
  });

  test('#toggleSection untoggle multiple items at end of list changes them to markup sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref45) {
      var post = _ref45.post;
      var listSection = _ref45.listSection;
      var listItem = _ref45.listItem;
      var marker = _ref45.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')]), listItem([marker('ghi')])])]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.objectAt(1), 0, post.sections.head.items.tail, 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 3, '3 sections');
    assert.ok(post.sections.head.isListSection, 'head section is list');
    assert.equal(post.sections.head.items.length, 1, 'head section has 1 item');
    assert.equal(post.sections.head.items.head.text, 'abc');

    assert.equal(post.sections.objectAt(1).tagName, 'p', 'middle is p');
    assert.equal(post.sections.objectAt(1).text, 'def');
    assert.equal(post.sections.tail.tagName, 'p', 'tail is p');
    assert.equal(post.sections.tail.text, 'ghi');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.objectAt(1).headPosition());
  });

  test('#toggleSection untoggle multiple items at start of list changes them to markup sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref46) {
      var post = _ref46.post;
      var listSection = _ref46.listSection;
      var listItem = _ref46.listItem;
      var marker = _ref46.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')]), listItem([marker('ghi')])])]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 0, post.sections.head.items.objectAt(1), 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 3, '3 sections');
    assert.equal(post.sections.head.tagName, 'p', 'head section is p');
    assert.equal(post.sections.head.text, 'abc');

    assert.equal(post.sections.objectAt(1).tagName, 'p', '2nd section is p');
    assert.equal(post.sections.objectAt(1).text, 'def');

    assert.ok(post.sections.objectAt(2).isListSection, '3rd section is list');
    assert.equal(post.sections.objectAt(2).items.length, 1, 'list has 1 item');
    assert.equal(post.sections.objectAt(2).items.head.text, 'ghi');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.headPosition());
  });

  test('#toggleSection untoggle items and overflowing markup sections changes the overflow to items', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref47) {
      var post = _ref47.post;
      var listSection = _ref47.listSection;
      var listItem = _ref47.listItem;
      var markupSection = _ref47.markupSection;
      var marker = _ref47.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')]), listItem([marker('ghi')])]), markupSection('p', [marker('123')])]);
    });
    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);
    var _editor3 = editor;
    var post = _editor3.post;

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.objectAt(1), 0, post.sections.tail, 0);

    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 1, '1 section');
    assert.ok(post.sections.head.isListSection, 'head section is list');
    assert.equal(post.sections.head.items.length, 4, 'list has 4 items');

    var text = post.sections.head.items.toArray().map(function (i) {
      return i.text;
    });
    assert.deepEqual(text, ['abc', 'def', 'ghi', '123']);

    assert.ok(editor.range.head.section === post.sections.head.items.objectAt(1), 'selected head correct');
    assert.equal(editor.range.head.offset, 0);
  });

  test('#toggleSection untoggle last list item changes it to markup section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref48) {
      var post = _ref48.post;
      var listSection = _ref48.listSection;
      var listItem = _ref48.listItem;
      var marker = _ref48.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')]), listItem([marker('ghi')])])]);
    });
    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.tail, 0);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 2, '2 sections');
    assert.ok(post.sections.head.isListSection, 'head section is list');
    assert.equal(post.sections.tail.tagName, 'p', 'tail is p');
    assert.equal(post.sections.tail.text, 'ghi');

    assert.equal(post.sections.head.items.length, 2, '2 items in list');
    assert.equal(post.sections.head.items.head.text, 'abc');
    assert.equal(post.sections.head.items.tail.text, 'def');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.tail.headPosition());
  });

  test('#toggleSection toggle list item to different type of list item', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref49) {
      var post = _ref49.post;
      var listSection = _ref49.listSection;
      var listItem = _ref49.listItem;
      var marker = _ref49.marker;

      return post([listSection('ul', [listItem([marker('abc')])])]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 0);

    mockEditor = renderBuiltAbstract(post, mockEditor);
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ol', range);
    postEditor.complete();

    assert.equal(post.sections.length, 1, '1 section');
    assert.ok(post.sections.head.isListSection, 'section is list');
    assert.equal(post.sections.head.tagName, 'ol', 'section is ol list');
    assert.equal(post.sections.head.items.length, 1, '1 item');
    assert.equal(post.sections.head.items.head.text, 'abc');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.items.head.headPosition());
  });

  test('#toggleSection toggle list item to different type of list item when other sections precede it', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref50) {
      var post = _ref50.post;
      var listSection = _ref50.listSection;
      var listItem = _ref50.listItem;
      var marker = _ref50.marker;
      var markupSection = _ref50.markupSection;

      return post([markupSection('p', [marker('123')]), listSection('ul', [listItem([marker('abc')])])]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.tail.items.head, 0);

    mockEditor = renderBuiltAbstract(post, mockEditor);
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ol', range);
    postEditor.complete();

    assert.equal(post.sections.length, 2, '2 section');
    assert.equal(post.sections.head.tagName, 'p', '1st section is p');
    assert.equal(post.sections.head.text, '123');
    assert.ok(post.sections.tail.isListSection, 'section is list');
    assert.equal(post.sections.tail.tagName, 'ol', 'section is ol list');
    assert.equal(post.sections.tail.items.length, 1, '1 item');
    assert.equal(post.sections.tail.items.head.text, 'abc');

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.tail.items.head.headPosition());
  });

  test('#toggleSection toggle when cursor on card section is no-op', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref51) {
      var post = _ref51.post;
      var cardSection = _ref51.cardSection;

      return post([cardSection('my-card')]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0);

    mockEditor = renderBuiltAbstract(post, mockEditor);
    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('ol', range);
    postEditor.complete();

    assert.equal(post.sections.length, 1, '1 section');
    assert.ok(post.sections.head.isCardSection, 'still card section');

    assert.positionIsEqual(mockEditor._renderedRange.head, range.head, 'range head is set to same');
    assert.positionIsEqual(mockEditor._renderedRange.tail, range.tail, 'range tail is set to same');
  });

  test('#toggleSection joins contiguous list items', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref52) {
      var post = _ref52.post;
      var listSection = _ref52.listSection;
      var listItem = _ref52.listItem;
      var marker = _ref52.marker;

      return post([listSection('ul', [listItem([marker('abc')])]), listSection('ol', [listItem([marker('123')])]), listSection('ul', [listItem([marker('def')])])]);
    });

    editor = new _mobiledocKit.Editor({ mobiledoc: mobiledoc });
    editor.render(editorElement);
    var _editor4 = editor;
    var post = _editor4.post;

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.objectAt(1).items.head, 0);
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleSection('ul', range);
    postEditor.complete();

    assert.equal(post.sections.length, 1, '1 section');
    assert.ok(post.sections.head.isListSection, 'is list');
    assert.equal(post.sections.head.items.length, 3, '3 items');
    assert.deepEqual(post.sections.head.items.map(function (i) {
      return i.text;
    }), ['abc', '123', 'def']);
  });

  test('#toggleSection maintains the selection when the sections in the selected range are still there', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref53) {
      var post = _ref53.post;
      var markupSection = _ref53.markupSection;
      var marker = _ref53.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    mockEditor = renderBuiltAbstract(post, mockEditor);
    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 1, post.sections.head, 2);

    postEditor = new _mobiledocKitEditorPost['default'](mockEditor);
    postEditor.toggleSection('h1', range);
    postEditor.complete();

    assert.positionIsEqual(mockEditor._renderedRange.head, post.sections.head.toPosition(1), 'Maintains the selection');
    assert.positionIsEqual(mockEditor._renderedRange.tail, post.sections.tail.toPosition(2), 'Maintains the selection');
  });

  test('#toggleMarkup when cursor is in non-markerable does nothing', function (assert) {
    editor = buildEditorWithMobiledoc(function (_ref54) {
      var post = _ref54.post;
      var markupSection = _ref54.markupSection;
      var marker = _ref54.marker;
      var cardSection = _ref54.cardSection;

      return post([cardSection('my-card')]);
    });

    var range = editor.post.sections.head.headPosition().toRange();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleMarkup('b', range);
    postEditor.complete();

    assert.ok(editor.post.sections.head.isCardSection);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.headPosition());
  });

  test('#toggleMarkup when cursor surrounds non-markerable does nothing', function (assert) {
    editor = buildEditorWithMobiledoc(function (_ref55) {
      var post = _ref55.post;
      var markupSection = _ref55.markupSection;
      var marker = _ref55.marker;
      var cardSection = _ref55.cardSection;

      return post([cardSection('my-card')]);
    });

    var range = editor.post.sections.head.toRange();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleMarkup('b', range);
    postEditor.complete();

    assert.ok(editor.post.sections.head.isCardSection);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.headPosition());
  });

  test('#toggleMarkup when range has the markup removes it', function (assert) {
    editor = buildEditorWithMobiledoc(function (_ref56) {
      var post = _ref56.post;
      var markupSection = _ref56.markupSection;
      var marker = _ref56.marker;
      var markup = _ref56.markup;

      return post([markupSection('p', [marker('abc', [markup('b')])])]);
    });
    var expected = _testHelpers['default'].postAbstract.build(function (_ref57) {
      var post = _ref57.post;
      var markupSection = _ref57.markupSection;
      var marker = _ref57.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    var range = editor.post.sections.head.toRange();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleMarkup('b', range);
    postEditor.complete();

    assert.positionIsEqual(editor._renderedRange.head, editor.post.headPosition());
    assert.positionIsEqual(editor._renderedRange.tail, editor.post.tailPosition());
    assert.postIsSimilar(editor.post, expected);
  });

  test('#toggleMarkup when only some of the range has it removes it', function (assert) {
    editor = buildEditorWithMobiledoc(function (_ref58) {
      var post = _ref58.post;
      var markupSection = _ref58.markupSection;
      var marker = _ref58.marker;
      var markup = _ref58.markup;

      return post([markupSection('p', [marker('a'), marker('b', [markup('b')]), marker('c')])]);
    });
    var expected = _testHelpers['default'].postAbstract.build(function (_ref59) {
      var post = _ref59.post;
      var markupSection = _ref59.markupSection;
      var marker = _ref59.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    var range = editor.post.sections.head.toRange();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleMarkup('b', range);
    postEditor.complete();

    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.headPosition());
    assert.positionIsEqual(editor._renderedRange.tail, editor.post.sections.head.tailPosition());
    assert.postIsSimilar(editor.post, expected);
  });

  test('#toggleMarkup when range does not have the markup adds it', function (assert) {
    editor = buildEditorWithMobiledoc(function (_ref60) {
      var post = _ref60.post;
      var markupSection = _ref60.markupSection;
      var marker = _ref60.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    var expected = _testHelpers['default'].postAbstract.build(function (_ref61) {
      var post = _ref61.post;
      var markupSection = _ref61.markupSection;
      var marker = _ref61.marker;
      var markup = _ref61.markup;

      return post([markupSection('p', [marker('abc', [markup('b')])])]);
    });

    var range = editor.post.sections.head.toRange();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.toggleMarkup('b', range);
    postEditor.complete();

    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.headPosition());
    assert.positionIsEqual(editor._renderedRange.tail, editor.post.sections.head.tailPosition());
    assert.postIsSimilar(editor.post, expected);
  });

  test('#toggleMarkup when the editor has no cursor', function (assert) {
    var done = assert.async();

    editor = buildEditorWithMobiledoc(function (_ref62) {
      var post = _ref62.post;
      var markupSection = _ref62.markupSection;
      var marker = _ref62.marker;

      return post([markupSection('p', [marker('abc')])]);
    }, false);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref63) {
      var post = _ref63.post;
      var markupSection = _ref63.markupSection;
      var marker = _ref63.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    editor._renderedRange = null;
    editor.run(function (postEditor) {
      return postEditor.toggleMarkup('b');
    });

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.equal(window.getSelection().rangeCount, 0, 'nothing is selected');
      assert.ok(document.activeElement !== editorElement, 'active element is not editor element');
      assert.ok(editor._renderedRange && editor._renderedRange.isBlank, 'rendered range is blank');

      done();
    });
  });

  test('#insertMarkers inserts an atom', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref64) {
      var post = _ref64.post;
      var markupSection = _ref64.markupSection;
      var marker = _ref64.marker;
      var markup = _ref64.markup;
      var atom = _ref64.atom;

      toInsert = [atom('simple-atom', '123', [markup('b')])];
      expected = post([markupSection('p', [marker('abc'), atom('simple-atom', '123', [markup('b')]), marker('def')])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref65) {
      var post = _ref65.post;
      var markupSection = _ref65.markupSection;
      var marker = _ref65.marker;

      return post([markupSection('p', [marker('abcdef')])]);
    });
    var position = editor.post.sections.head.toPosition('abc'.length);
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertMarkers(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.toPosition(4));
  });

  test('#insertMarkers inserts the markers in middle, merging markups', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref66) {
      var post = _ref66.post;
      var markupSection = _ref66.markupSection;
      var marker = _ref66.marker;
      var markup = _ref66.markup;

      toInsert = [marker('123', [markup('b')]), marker('456')];
      expected = post([markupSection('p', [marker('abc'), marker('123', [markup('b')]), marker('456def')])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref67) {
      var post = _ref67.post;
      var markupSection = _ref67.markupSection;
      var marker = _ref67.marker;

      return post([markupSection('p', [marker('abcdef')])]);
    });
    var position = editor.post.sections.head.toPosition('abc'.length);
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertMarkers(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.toPosition('abc123456'.length));
  });

  test('#insertMarkers inserts the markers when the markerable has no markers', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref68) {
      var post = _ref68.post;
      var markupSection = _ref68.markupSection;
      var marker = _ref68.marker;
      var markup = _ref68.markup;

      toInsert = [marker('123', [markup('b')]), marker('456')];
      expected = post([markupSection('p', [marker('123', [markup('b')]), marker('456')])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref69) {
      var post = _ref69.post;
      var markupSection = _ref69.markupSection;

      return post([markupSection()]);
    });
    var position = editor.post.sections.head.headPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertMarkers(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.toPosition('123456'.length));
  });

  test('#insertMarkers inserts the markers at start', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref70) {
      var post = _ref70.post;
      var markupSection = _ref70.markupSection;
      var marker = _ref70.marker;
      var markup = _ref70.markup;

      toInsert = [marker('123', [markup('b')]), marker('456')];
      expected = post([markupSection('p', [marker('123', [markup('b')]), marker('456abc')])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref71) {
      var post = _ref71.post;
      var markupSection = _ref71.markupSection;
      var marker = _ref71.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    var position = editor.post.sections.head.headPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertMarkers(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.toPosition('123456'.length));
  });

  test('#insertMarkers inserts the markers at end', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref72) {
      var post = _ref72.post;
      var markupSection = _ref72.markupSection;
      var marker = _ref72.marker;
      var markup = _ref72.markup;

      toInsert = [marker('123', [markup('b')]), marker('456')];
      expected = post([markupSection('p', [marker('abc'), marker('123', [markup('b')]), marker('456')])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref73) {
      var post = _ref73.post;
      var markupSection = _ref73.markupSection;
      var marker = _ref73.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    var position = editor.post.sections.head.tailPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertMarkers(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.tailPosition());
  });

  test('#insertMarkers throws if the position is not markerable', function (assert) {
    var toInsert = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref74) {
      var post = _ref74.post;
      var markupSection = _ref74.markupSection;
      var marker = _ref74.marker;
      var markup = _ref74.markup;

      toInsert = [marker('123', [markup('b')]), marker('456')];
    });

    editor = buildEditorWithMobiledoc(function (_ref75) {
      var post = _ref75.post;
      var cardSection = _ref75.cardSection;

      return post([cardSection('some-card')]);
    });
    var position = editor.post.sections.head.tailPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);

    assert.throws(function () {
      postEditor.insertMarkers(position, toInsert);
    }, /cannot insert.*non-markerable/i);
  });

  test('#insertText is no-op if the position section is not markerable', function (assert) {
    var toInsert = '123';
    var expected = _testHelpers['default'].postAbstract.build(function (_ref76) {
      var post = _ref76.post;
      var cardSection = _ref76.cardSection;

      return post([cardSection('test-card')]);
    });
    editor = buildEditorWithMobiledoc(function (_ref77) {
      var post = _ref77.post;
      var cardSection = _ref77.cardSection;

      return post([cardSection('test-card')]);
    });
    var position = editor.post.sections.head.headPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertText(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.ok(!editor._renderedRange, 'no range is rendered since nothing happened');
  });

  test('#insertText inserts the text at start', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref78) {
      var post = _ref78.post;
      var markupSection = _ref78.markupSection;
      var marker = _ref78.marker;
      var markup = _ref78.markup;

      toInsert = '123';
      expected = post([markupSection('p', [marker('123abc', [markup('b')])])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref79) {
      var post = _ref79.post;
      var markupSection = _ref79.markupSection;
      var marker = _ref79.marker;
      var markup = _ref79.markup;

      return post([markupSection('p', [marker('abc', [markup('b')])])]);
    });
    var position = editor.post.sections.head.headPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertText(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.toPosition('123'.length));
  });

  test('#insertText inserts text in the middle', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref80) {
      var post = _ref80.post;
      var markupSection = _ref80.markupSection;
      var marker = _ref80.marker;
      var markup = _ref80.markup;

      toInsert = '123';
      expected = post([markupSection('p', [marker('ab123c', [markup('b')])])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref81) {
      var post = _ref81.post;
      var markupSection = _ref81.markupSection;
      var marker = _ref81.marker;
      var markup = _ref81.markup;

      return post([markupSection('p', [marker('abc', [markup('b')])])]);
    });
    var position = editor.post.sections.head.toPosition('ab'.length);
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertText(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.toPosition('ab123'.length));
  });

  test('#insertText inserts text at the end', function (assert) {
    var toInsert = undefined,
        expected = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref82) {
      var post = _ref82.post;
      var markupSection = _ref82.markupSection;
      var marker = _ref82.marker;
      var markup = _ref82.markup;

      toInsert = '123';
      expected = post([markupSection('p', [marker('abc123', [markup('b')])])]);
    });

    editor = buildEditorWithMobiledoc(function (_ref83) {
      var post = _ref83.post;
      var markupSection = _ref83.markupSection;
      var marker = _ref83.marker;
      var markup = _ref83.markup;

      return post([markupSection('p', [marker('abc', [markup('b')])])]);
    });
    var position = editor.post.sections.head.tailPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor.insertText(position, toInsert);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
    assert.positionIsEqual(editor._renderedRange.head, editor.post.sections.head.tailPosition());
  });

  test('#_splitListItem creates two list items', function (assert) {
    var expected = _testHelpers['default'].postAbstract.build(function (_ref84) {
      var post = _ref84.post;
      var listSection = _ref84.listSection;
      var listItem = _ref84.listItem;
      var marker = _ref84.marker;
      var markup = _ref84.markup;

      return post([listSection('ul', [listItem([marker('abc'), marker('bo', [markup('b')])]), listItem([marker('ld', [markup('b')])])])]);
    });
    editor = buildEditorWithMobiledoc(function (_ref85) {
      var post = _ref85.post;
      var listSection = _ref85.listSection;
      var listItem = _ref85.listItem;
      var marker = _ref85.marker;
      var markup = _ref85.markup;

      return post([listSection('ul', [listItem([marker('abc'), marker('bold', [markup('b')])])])]);
    });

    var item = editor.post.sections.head.items.head;
    var position = item.toPosition('abcbo'.length);
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor._splitListItem(item, position);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
    assert.renderTreeIsEqual(editor._renderTree, expected);
  });

  test('#_splitListItem when position is start creates blank list item', function (assert) {
    var expected = _testHelpers['default'].postAbstract.build(function (_ref86) {
      var post = _ref86.post;
      var listSection = _ref86.listSection;
      var listItem = _ref86.listItem;
      var marker = _ref86.marker;

      return post([listSection('ul', [listItem([marker('')]), listItem([marker('abc')])])]);
    });
    editor = buildEditorWithMobiledoc(function (_ref87) {
      var post = _ref87.post;
      var listSection = _ref87.listSection;
      var listItem = _ref87.listItem;
      var marker = _ref87.marker;

      return post([listSection('ul', [listItem([marker('abc')])])]);
    });

    var item = editor.post.sections.head.items.head;
    var position = item.headPosition();
    postEditor = new _mobiledocKitEditorPost['default'](editor);
    postEditor._splitListItem(item, position);
    postEditor.complete();

    assert.postIsSimilar(editor.post, expected);
  });
});
define('tests/unit/editor/post/insert-post-test', ['exports', '../../../test-helpers'], function (exports, _testHelpers) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;
  var retargetRange = _testHelpers['default'].editor.retargetRange;

  var editor = undefined,
      editorElement = undefined;
  // see https://github.com/bustle/mobiledoc-kit/issues/259
  _module('Unit: PostEditor: #insertPost', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },

    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  var blankSectionExpecations = [['* abc'], // single list item
  ['* abc', '* def'], // multiple list items
  ['abc'], // single section
  ['abc', 'def'], // multiple sections, see https://github.com/bustle/mobiledoc-kit/issues/462
  ['*abc*'], // section with markup
  ['[my-card]'], // single card
  ['[my-card]', '[my-other-card]'], // multiple cards
  ['abc', '* 123', '* 456', '[my-card]']];
  // mixed
  blankSectionExpecations.forEach(function (dsl) {
    test('inserting "' + dsl + '" in blank section replaces it', function (assert) {
      var _Helpers$postAbstract$buildFromText = _testHelpers['default'].postAbstract.buildFromText(dsl);

      var toInsert = _Helpers$postAbstract$buildFromText.post;

      var expected = toInsert;
      editor = _testHelpers['default'].editor.buildFromText(['|'], { unknownCardHandler: function unknownCardHandler() {}, element: editorElement });

      editor.run(function (postEditor) {
        return postEditor.insertPost(editor.range.head, toInsert);
      });

      assert.renderTreeIsEqual(editor._renderTree, expected);
      assert.postIsSimilar(editor.post, expected);

      var expectedRange = editor.post.tailPosition().toRange();
      assert.rangeIsEqual(editor.range, expectedRange);
    });
  });

  var expectationGroups = [{
    groupName: 'insert around card',
    expectations: [
    // insert 1 section
    [['|[my-card]'], ['abc'], ['abc|', '[my-card]']], [['[my-card]|'], ['abc'], ['[my-card]', 'abc|']],

    // insert multiple sections
    [['|[my-card]'], ['abc', 'def'], ['abc', 'def|', '[my-card]']], [['[my-card]|'], ['abc', 'def'], ['[my-card]', 'abc', 'def|']],

    // insert list with 1 item
    [['|[my-card]'], ['* abc'], ['* abc|', '[my-card]']], [['[my-card]|'], ['* abc'], ['[my-card]', '* abc|']],

    // insert list with multiple items
    [['|[my-card]'], ['* abc', '* def'], ['* abc', '* def|', '[my-card]']], [['[my-card]|'], ['* abc', '* def'], ['[my-card]', '* abc', '* def|']]]
  }, {
    groupName: 'insert card around markerable',
    expectations: [
    // insert card only
    [['|abc'], ['[my-card]'], ['[my-card]|', 'abc']], [['ab|c'], ['[my-card]'], ['ab', '[my-card]|', 'c']], [['abc|'], ['[my-card]'], ['abc', '[my-card]|']],

    // insert card+section
    [['|abc'], ['[my-card]', 'def'], ['[my-card]', 'def|', 'abc']], [['ab|c'], ['[my-card]', 'def'], ['ab', '[my-card]', 'def|', 'c']], [['abc|'], ['[my-card]', 'def'], ['abc', '[my-card]', 'def|']],

    // insert section+card
    [['|abc'], ['def', '[my-card]'], ['def', '[my-card]|', 'abc']], [['ab|c'], ['def', '[my-card]'], ['abdef', '[my-card]|', 'c']], [['abc|'], ['def', '[my-card]'], ['abcdef', '[my-card]|']]]
  }, {
    groupName: 'insert (non-list-item) markerable(s) around markerable',
    expectations: [
    // insert 1 section
    [['|abc'], ['123'], ['123|abc']], [['ab|c'], ['123'], ['ab123|c']], [['abc|'], ['123'], ['abc123|']],

    // insert multiple sections
    [['|abc'], ['123', '456'], ['123', '456|', 'abc']], [['ab|c'], ['123', '456'], ['ab123', '456|', 'c']], [['abc|'], ['123', '456'], ['abc123', '456|']]]
  }, {
    groupName: 'insert list item(s) around markerable',
    expectations: [
    // insert 1 item
    [['|abc'], ['* 123'], ['123|abc']], [['ab|c'], ['* 123'], ['ab123|c']], [['abc|'], ['* 123'], ['abc123|']],

    // insert multiple items
    [['|abc'], ['* 123', '* 456'], ['123', '* 456|', 'abc']], [['ab|c'], ['* 123', '* 456'], ['ab123', '* 456|', 'c']], [['abc|'], ['* 123', '* 456'], ['abc123', '* 456|']]]
  }, {
    groupName: 'insert list+markup-section around markerable',
    expectations: [
    // list + markup section
    [['|abc'], ['* 123', 'def'], ['123', 'def|', 'abc']], [['ab|c'], ['* 123', 'def'], ['ab123', 'def|', 'c']], [['abc|'], ['* 123', 'def'], ['abc123', 'def|']],

    // markup section + 1-item list
    [['|abc'], ['def', '* 123'], ['def', '* 123|', 'abc']], [['ab|c'], ['def', '* 123'], ['abdef', '* 123|', 'c']], [['abc|'], ['def', '* 123'], ['abcdef', '* 123|']],

    // markup section + multi-item list
    [['|abc'], ['def', '* 123', '* 456'], ['def', '* 123', '* 456|', 'abc']], [['ab|c'], ['def', '* 123', '* 456'], ['abdef', '* 123', '* 456|', 'c']], [['abc|'], ['def', '* 123', '* 456'], ['abcdef', '* 123', '* 456|']]]
  }, {
    groupName: 'insert into list',
    expectations: [
    // insert 1 markup section
    [['* |abc'], ['def'], ['* def|abc']], [['* ab|c'], ['def'], ['* abdef|c']], [['* abc|'], ['def'], ['* abcdef|']],

    // insert multiple markup sections
    [['* abc|'], ['def', 'ghi'], ['* abcdef', '* ghi|']],
    // See https://github.com/bustle/mobiledoc-kit/issues/456
    [['* abc', '* def|'], ['ghi', 'jkl'], ['* abc', '* defghi', '* jkl|']],

    // insert markup sections + card
    [['* abc', '* def|'], ['ghi', 'jkl', '[my-card]'], ['* abc', '* defghi', '* jkl', '[my-card]|']],

    // insert list item
    [['* |abc'], ['* def'], ['* def|abc']], [['* ab|c'], ['* def'], ['* abdef|c']], [['* abc|'], ['* def'], ['* abcdef|']],

    // insert multiple list items
    [['* |abc'], ['* def', '* ghi'], ['* def', '* ghi|', '* abc']], [['* ab|c'], ['* def', '* ghi'], ['* abdef', '* ghi|', '* c']], [['* abc|'], ['* def', '* ghi'], ['* abcdef', '* ghi|']],

    // insert list + markup
    [['* |abc'], ['* def', '123'], ['* def', '123|', '* abc']], [['* ab|c'], ['* def', '123'], ['* abdef', '123|', '* c']], [['* abc|'], ['* def', '123'], ['* abcdef', '123|']],

    // insert into empty list
    [['* |'], ['[my-card]'], ['* ', '[my-card]|']], [['* |'], ['abc'], ['* abc|']], [['* |'], ['abc', 'def'], ['* abc', '* def|']], [['* |'], ['* abc'], ['* abc|']], [['* |'], ['* abc', '* def'], ['* abc', '* def|']],

    /// insert between list items ///

    // insert card between list items
    [['* abc|', '* def'], ['[my-card]'], ['* abc', '[my-card]|', '* def']], [['* ab|c', '* def'], ['[my-card]'], ['* ab', '[my-card]|', '* c', '* def']], [['* abc|', '* def'], ['[my-card]'], ['* abc', '[my-card]|', '* def']],
    // See https://github.com/bustle/mobiledoc-kit/issues/467
    [['* abc', '* |def'], ['[my-card]'], ['* abc', '[my-card]|', '* def']],

    // insert markup section between list items
    [['* abc|', '* def'], ['123'], ['* abc123|', '* def']], [['* abc', '* |def'], ['123'], ['* abc', '* 123|def']],

    // insert 1 list item between list items
    [['* abc|', '* def'], ['* 123'], ['* abc123|', '* def']], [['* abc', '* |def'], ['* 123'], ['* abc', '* 123|def']],

    // insert multiple list items between list items
    [['* abc|', '* def'], ['* 123', '* 456'], ['* abc123', '* 456|', '* def']], [['* abc', '* |def'], ['* 123', '* 456'], ['* abc', '* 123', '* 456|', '* def']]]
  }];

  expectationGroups.forEach(function (_ref) {
    var groupName = _ref.groupName;
    var expectations = _ref.expectations;

    expectations.forEach(function (_ref2) {
      var _ref22 = _slicedToArray(_ref2, 3);

      var editorDSL = _ref22[0];
      var toInsertDSL = _ref22[1];
      var expectedDSL = _ref22[2];

      test(groupName + ': inserting "' + toInsertDSL + '" in "' + editorDSL + '" -> "' + expectedDSL + '"', function (assert) {
        editor = _testHelpers['default'].editor.buildFromText(editorDSL, { unknownCardHandler: function unknownCardHandler() {}, element: editorElement });

        var _Helpers$postAbstract$buildFromText2 = _testHelpers['default'].postAbstract.buildFromText(toInsertDSL);

        var toInsert = _Helpers$postAbstract$buildFromText2.post;

        var _Helpers$postAbstract$buildFromText3 = _testHelpers['default'].postAbstract.buildFromText(expectedDSL);

        var expectedPost = _Helpers$postAbstract$buildFromText3.post;
        var expectedRange = _Helpers$postAbstract$buildFromText3.range;

        editor.run(function (postEditor) {
          return postEditor.insertPost(editor.range.head, toInsert);
        });

        assert.renderTreeIsEqual(editor._renderTree, expectedPost);
        assert.postIsSimilar(editor.post, expectedPost);
        assert.rangeIsEqual(editor.range, retargetRange(expectedRange, editor.post));
      });
    });
  });
});
define('tests/unit/editor/ui-test', ['exports', 'mobiledoc-kit/editor/ui', '../../test-helpers'], function (exports, _mobiledocKitEditorUi, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  _module('Unit: UI', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('toggleLink calls the default window prompt', function (assert) {
    assert.expect(1);
    window.prompt = function () {
      return assert.ok(true, 'window.prompt called');
    };

    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    _testHelpers['default'].dom.selectText(editor, 'something', editorElement);

    (0, _mobiledocKitEditorUi.toggleLink)(editor);
  });

  test('toggleLink accepts a custom prompt function', function (assert) {
    assert.expect(1);

    var prompt = function prompt() {
      return assert.ok(true, 'custom prompt called');
    };

    editor = _testHelpers['default'].mobiledoc.renderIntoAndFocusTail(editorElement, function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;
      return post([markupSection('p', [marker('something')])]);
    });

    _testHelpers['default'].dom.selectText(editor, 'something', editorElement);

    (0, _mobiledocKitEditorUi.toggleLink)(editor, prompt);
  });
});
define('tests/unit/models/atom-test', ['exports', '../../test-helpers', 'mobiledoc-kit/models/post-node-builder'], function (exports, _testHelpers, _mobiledocKitModelsPostNodeBuilder) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined;
  _module('Unit: Atom', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    },
    afterEach: function afterEach() {
      builder = null;
    }
  });

  test('can create an atom with value and payload', function (assert) {
    var payload = {};
    var value = 'atom-value';
    var name = 'atom-name';
    var atom = builder.createAtom(name, value, payload);
    assert.ok(!!atom, 'creates atom');
    assert.ok(atom.name === name, 'has name');
    assert.ok(atom.value === value, 'has value');
    assert.ok(atom.payload === payload, 'has payload');
    assert.ok(atom.length === 1, 'has length of 1');
  });
});
define('tests/unit/models/card-test', ['exports', '../../test-helpers', 'mobiledoc-kit/models/post-node-builder'], function (exports, _testHelpers, _mobiledocKitModelsPostNodeBuilder) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined;
  _module('Unit: Card', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    },
    afterEach: function afterEach() {
      builder = null;
    }
  });

  test('can create a card with payload', function (assert) {
    var payload = {};
    var card = builder.createCardSection('card-name', payload);
    assert.ok(!!card, 'creates card');
    assert.ok(card.payload === payload, 'has payload');
  });

  test('cloning a card copies payload', function (assert) {
    var payload = { foo: 'bar' };

    var card = builder.createCardSection('card-name', payload);
    var card2 = card.clone();

    assert.ok(card !== card2, 'card !== cloned');
    assert.ok(card.payload !== card2.payload, 'payload is copied');

    card.payload.foo = 'other foo';
    assert.equal(card2.payload.foo, 'bar', 'card2 payload not updated');
  });

  test('card cannot have attributes', function (assert) {
    var card = builder.createCardSection('card-name');

    assert.equal(card.attributes, undefined);
  });
});
define('tests/unit/models/lifecycle-callbacks-test', ['exports', '../../test-helpers', 'mobiledoc-kit/models/lifecycle-callbacks'], function (exports, _testHelpers, _mobiledocKitModelsLifecycleCallbacks) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Models: LifecycleCallbacksMixin');

  test('#addCallback permanently adds the callback', function (assert) {
    var item = new _mobiledocKitModelsLifecycleCallbacks['default'](['test']);
    var queueName = 'test';
    var called = 0;
    var callback = function callback() {
      return called++;
    };
    item.addCallback(queueName, callback);

    item.runCallbacks(queueName);
    assert.equal(called, 1);

    item.runCallbacks(queueName);
    assert.equal(called, 2, 'callback is run a second time');
  });

  test('#addCallback callback only runs in its queue', function (assert) {
    var item = new _mobiledocKitModelsLifecycleCallbacks['default'](['test', 'other']);
    var queueName = 'test';
    var called = 0;
    var callback = function callback() {
      return called++;
    };
    item.addCallback(queueName, callback);

    var otherQueueName = 'other';
    item.runCallbacks(otherQueueName);

    assert.equal(called, 0);
  });

  test('callbacks run with arguments', function (assert) {
    var item = new _mobiledocKitModelsLifecycleCallbacks['default'](['test']);
    var queueName = 'test';
    var arg1 = undefined,
        arg2 = undefined;
    var foo = {},
        bar = {};
    var callback = function callback(_arg1, _arg2) {
      arg1 = _arg1;
      arg2 = _arg2;
    };
    item.addCallback(queueName, callback);
    item.runCallbacks(queueName, [foo, bar]);

    assert.deepEqual(arg1, foo);
    assert.deepEqual(arg2, bar);
  });

  test('#addCallbackOnce only runs the callback one time', function (assert) {
    var item = new _mobiledocKitModelsLifecycleCallbacks['default'](['test']);
    var queueName = 'test';
    var called = 0;
    var callback = function callback() {
      return called++;
    };
    item.addCallbackOnce(queueName, callback);

    item.runCallbacks(queueName);
    assert.equal(called, 1, 'runs once');

    item.runCallbacks(queueName);
    assert.equal(called, 1, 'does not run twice');
  });

  test('#addCallback and #addCallbackOnce work correctly together', function (assert) {
    var item = new _mobiledocKitModelsLifecycleCallbacks['default'](['test']);
    var queueName = 'test';
    var calledOnce = 0;
    var callbackOnce = function callbackOnce() {
      return calledOnce++;
    };
    var called = 0;
    var callback = function callback() {
      return called++;
    };

    item.addCallbackOnce(queueName, callbackOnce);
    item.addCallback(queueName, callback);

    item.runCallbacks(queueName);
    assert.equal(called, 1, 'runs callback');
    assert.equal(calledOnce, 1, 'runs one-time callback once');

    item.runCallbacks(queueName);
    assert.equal(called, 2, 'runs callback again');
    assert.equal(calledOnce, 1, 'runs one-time callback only once');
  });
});
define('tests/unit/models/list-section-test', ['exports', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers', '../../helpers/sections'], function (exports, _mobiledocKitModelsPostNodeBuilder, _testHelpers, _helpersSections) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined;
  _module('Unit: List Section', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    },
    afterEach: function afterEach() {
      builder = null;
    }
  });

  _helpersSections.VALID_ATTRIBUTES.forEach(function (attribute) {
    // eslint-disable-next-line no-loop-func
    test('a section can have attribute "' + attribute.key + '" with value "' + attribute.value, function (assert) {
      var attributes = {};
      attributes[attribute.key] = attribute.value;

      var s1 = builder.createListSection('ol', [], attributes);
      assert.deepEqual(s1.attributes, attributes, 'Attribute set at instantiation');
    });
  });

  _helpersSections.INVALID_ATTRIBUTES.forEach(function (attribute) {
    // eslint-disable-next-line no-loop-func
    test('a section throws when invalid attribute "' + attribute.key + '" is passed to a marker', function (assert) {
      var attributes = {};
      attributes[attribute.key] = attribute.value;

      assert.throws(function () {
        builder.createListSection('ul', [], attributes);
      });
    });

    test('cloning a list section creates the same type of list section', function (assert) {
      var item = builder.createListItem([builder.createMarker('abc')]);
      var list = builder.createListSection('ol', [item]);
      var cloned = list.clone();

      assert.equal(list.tagName, cloned.tagName);
      assert.equal(list.items.length, cloned.items.length);
      assert.equal(list.items.head.text, cloned.items.head.text);
    });
  });
});
define('tests/unit/models/marker-test', ['exports', '../../test-helpers', 'mobiledoc-kit/models/post-node-builder'], function (exports, _testHelpers, _mobiledocKitModelsPostNodeBuilder) {
  'use strict';

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined;
  _module('Unit: Marker', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    },
    afterEach: function afterEach() {
      builder = null;
    }
  });

  test('a marker can have a markup applied to it', function (assert) {
    var m1 = builder.createMarker('hi there!');
    m1.addMarkup(builder.createMarkup('b'));

    assert.ok(m1.hasMarkup('b'));
  });

  test('a marker can have the same markup tagName applied twice', function (assert) {
    var m1 = builder.createMarker('hi there!');
    m1.addMarkup(builder.createMarkup('b'));
    m1.addMarkup(builder.createMarkup('b'));

    assert.equal(m1.markups.length, 2, 'markup only applied once');
  });

  test('a marker can have a complex markup applied to it', function (assert) {
    var m1 = builder.createMarker('hi there!');
    var markup = builder.createMarkup('a', { href: 'blah' });
    m1.addMarkup(markup);

    assert.ok(m1.hasMarkup('a'));
    assert.equal(m1.getMarkup('a').attributes.href, 'blah');
  });

  test('a marker can have the same complex markup tagName applied twice, even with different attributes', function (assert) {
    var m1 = builder.createMarker('hi there!');
    var markup1 = builder.createMarkup('a', { href: 'blah' });
    var markup2 = builder.createMarkup('a', { href: 'blah2' });
    m1.addMarkup(markup1);
    m1.addMarkup(markup2);

    assert.equal(m1.markups.length, 2, 'only one markup');
    assert.equal(m1.getMarkup('a').attributes.href, 'blah', 'first markup is applied');
  });

  test('#split splits a marker in 3 with blank markers when no endOffset is passed', function (assert) {
    var m1 = builder.createMarker('hi there!');
    m1.addMarkup(builder.createMarkup('b'));

    var _m1$split = m1.split(5);

    var _m1$split2 = _toArray(_m1$split);

    var beforeMarker = _m1$split2[0];

    var afterMarkers = _m1$split2.slice(1);

    assert.ok(beforeMarker.hasMarkup('b'));
    afterMarkers.forEach(function (m) {
      return assert.ok(m.hasMarkup('b'));
    });

    assert.equal(beforeMarker.value, 'hi th');
    assert.equal(afterMarkers[0].value, 'ere!');
    assert.ok(afterMarkers[1].isBlank, 'final split marker is empty');
  });

  test('#split splits a marker in 3 when endOffset is passed', function (assert) {
    var m = builder.createMarker('hi there!');
    m.addMarkup(builder.createMarkup('b'));

    var _m$split = m.split(2, 4);

    var _m$split2 = _toArray(_m$split);

    var beforeMarker = _m$split2[0];

    var afterMarkers = _m$split2.slice(1);

    assert.equal(1 + afterMarkers.length, 3, 'creates 3 new markers');
    assert.ok(beforeMarker.hasMarkup('b'), 'beforeMarker has markup');
    afterMarkers.forEach(function (m) {
      return assert.ok(m.hasMarkup('b'), 'afterMarker has markup');
    });

    assert.equal(beforeMarker.value, 'hi');
    assert.equal(afterMarkers[0].value, ' t');
    assert.equal(afterMarkers[1].value, 'here!');
  });

  test('#split creates an initial empty marker if the offset is 0', function (assert) {
    var m = builder.createMarker('hi there!');

    var _m$split3 = m.split(0);

    var _m$split32 = _toArray(_m$split3);

    var beforeMarker = _m$split32[0];

    var afterMarkers = _m$split32.slice(1);

    assert.equal(afterMarkers.length, 2, '2 after markers');
    assert.ok(beforeMarker.isBlank, 'beforeMarker is empty');
    assert.equal(afterMarkers[0].value, 'hi there!');
    assert.ok(afterMarkers[1].isBlank, 'final afterMarker is empty');
  });

  test('#clone a marker', function (assert) {
    var marker = builder.createMarker('hi there!');
    var cloned = marker.clone();
    assert.equal(marker.builder, cloned.builder, 'builder is present');
    assert.equal(marker.value, cloned.value, 'value is present');
    assert.equal(marker.markups.length, cloned.markups.length, 'markup length is the same');
  });

  // https://github.com/bustle/mobiledoc-kit/issues/274
  test('#deleteValueAtOffset handles emoji', function (assert) {
    var str = 'monkey 🙈';
    assert.equal(str.length, 'monkey '.length + 2, 'string length reports monkey emoji as length 2');
    var marker = builder.createMarker(str);
    marker.deleteValueAtOffset(str.length - 1);
    assert.equal(marker.value, 'monkey ', 'deletes correctly from low surrogate');

    marker = builder.createMarker(str);
    marker.deleteValueAtOffset(str.length - 2);
    assert.equal(marker.value, 'monkey ', 'deletes correctly from high surrogate');
  });
});
define('tests/unit/models/markup-section-test', ['exports', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers', 'mobiledoc-kit/utils/cursor/position', '../../helpers/sections'], function (exports, _mobiledocKitModelsPostNodeBuilder, _testHelpers, _mobiledocKitUtilsCursorPosition, _helpersSections) {
  'use strict';

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined;
  _module('Unit: Markup Section', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    },
    afterEach: function afterEach() {
      builder = null;
    }
  });

  test('a section can append a marker', function (assert) {
    var s1 = builder.createMarkupSection('P');
    var m1 = builder.createMarker('hello');

    s1.markers.append(m1);
    assert.equal(s1.markers.length, 1);
  });

  _helpersSections.VALID_ATTRIBUTES.forEach(function (attribute) {
    // eslint-disable-next-line no-loop-func
    test('a section can have attribute "' + attribute.key + '" with value "' + attribute.value, function (assert) {
      var s1 = builder.createMarkupSection('P', [], false, _defineProperty({}, attribute.key, attribute.value));
      assert.deepEqual(s1.attributes, _defineProperty({}, attribute.key, attribute.value), 'Attribute set at instantiation');
    });
  });

  _helpersSections.INVALID_ATTRIBUTES.forEach(function (attribute) {
    // eslint-disable-next-line no-loop-func
    test('a section throws when invalid attribute "' + attribute.key + '" is passed to a marker', function (assert) {
      assert.throws(function () {
        builder.createMarkupSection('P', [], false, attribute);
      });
    });
  });

  test('#isBlank returns true if the text length is zero for two markers', function (assert) {
    var m1 = builder.createMarker('');
    var m2 = builder.createMarker('');
    var s = builder.createMarkupSection('p', [m1, m2]);
    assert.ok(s.isBlank, 'section with two blank markers is blank');
  });

  test('#isBlank returns true if there are no markers', function (assert) {
    var s = builder.createMarkupSection('p');
    assert.ok(s.isBlank, 'section with no markers is blank');
  });

  test('#isBlank returns false if there is a marker with length', function (assert) {
    var m = builder.createMarker('a');
    var s = builder.createMarkupSection('p', [m]);
    assert.ok(!s.isBlank, 'section with marker is not blank');
  });

  test('#markersFor clones markers', function (assert) {
    var m = builder.createMarker('a');
    var s = builder.createMarkupSection('p', [m]);
    var clones = s.markersFor(0, 1);
    assert.equal(clones.length, 1, 'correct number of clones are created');
    assert.ok(clones[0] !== m, 'marker is cloned');
    assert.equal(clones[0].value, m.value, 'marker content is the same');
  });

  test('#markersFor clones markers, trimming at tailOffset', function (assert) {
    var m1 = builder.createMarker('ab');
    var m2 = builder.createMarker('cd');
    var s = builder.createMarkupSection('p', [m1, m2]);
    var clones = s.markersFor(0, 3);
    assert.equal(clones.length, 2, 'correct number of clones are created');
    assert.equal(clones[0].value, 'ab', 'marker content correct');
    assert.equal(clones[1].value, 'c', 'marker content is correct');
  });

  test('#markersFor clones markers, trimming at headOffset', function (assert) {
    var m1 = builder.createMarker('ab');
    var m2 = builder.createMarker('cd');
    var s = builder.createMarkupSection('p', [m1, m2]);
    var clones = s.markersFor(1, 4);
    assert.equal(clones.length, 2, 'correct number of clones are created');
    assert.equal(clones[0].value, 'b', 'marker content correct');
    assert.equal(clones[1].value, 'cd', 'marker content is correct');
  });

  test('#markersFor clones markers, trimming at offsets that do not trim', function (assert) {
    var m1 = builder.createMarker('ab');
    var m2 = builder.createMarker('cd');
    var m3 = builder.createMarker('ef');
    var s = builder.createMarkupSection('p', [m1, m2, m3]);
    var clones = s.markersFor(2, 4);
    assert.equal(clones.length, 1, 'correct number of clones are created');
    assert.equal(clones[0].value, 'cd', 'marker content correct');
  });

  test('#markersFor clones markers when offset completely surrounds a marker', function (assert) {
    var m1 = builder.createMarker('ab'); // 0-2
    var m2 = builder.createMarker('cd1'); // 2-5
    var m3 = builder.createMarker('cd2'); // 5-8
    var m4 = builder.createMarker('ef'); // 8-10
    var s = builder.createMarkupSection('p', [m1, m2, m3, m4]);
    var clones = s.markersFor(3, 9);
    assert.equal(clones.length, 3, 'correct number of clones are created');
    assert.equal(clones[0].value, 'd1', 'marker content correct');
    assert.equal(clones[1].value, 'cd2', 'marker content correct');
    assert.equal(clones[2].value, 'e', 'marker content correct');
  });

  test('#markersFor clones a single marker with a tail offset', function (assert) {
    var m1 = builder.createMarker(' def');
    var s = builder.createMarkupSection('p', [m1]);
    var clones = s.markersFor(0, 1);
    assert.equal(clones.length, 1);
    assert.equal(clones[0].value, ' ');
  });

  test('instantiating with invalid tagName throws', function (assert) {
    assert.throws(function () {
      builder.createMarkupSection('blah');
    }, /Cannot set.*tagName.*blah/);
  });

  test('markerBeforeOffset returns marker the ends at offset', function (assert) {
    var marker = builder.createMarker;
    var section = builder.createMarkupSection('p', [marker('a'), marker('bc'), marker('def')]);

    assert.ok(section.markerBeforeOffset(1) === section.markers.head);
    assert.ok(section.markerBeforeOffset(3) === section.markers.objectAt(1));
    assert.ok(section.markerBeforeOffset(6) === section.markers.tail);
  });

  test('markerBeforeOffset throws if offset is not between markers', function (assert) {
    var marker = builder.createMarker;
    var section = builder.createMarkupSection('p', [marker('a'), marker('bc'), marker('def')]);

    assert.throws(function () {
      return section.markerBeforeOffset(0);
    }, /not between/);
    assert.throws(function () {
      return section.markerBeforeOffset(2);
    }, /not between/);
    assert.throws(function () {
      return section.markerBeforeOffset(4);
    }, /not between/);
    assert.throws(function () {
      return section.markerBeforeOffset(5);
    }, /not between/);
  });

  test('markerBeforeOffset returns first marker if it is empty and offset is 0', function (assert) {
    var marker = function marker(text) {
      return builder.createMarker(text);
    };
    var section = builder.createMarkupSection('p', [marker(''), marker('bc'), marker('def')]);

    assert.ok(section.markerBeforeOffset(0) === section.markers.head);
  });

  test('splitMarkerAtOffset inserts empty marker when offset is 0', function (assert) {
    var section = builder.createMarkupSection('p', [builder.createMarker('abc')]);

    section.splitMarkerAtOffset(0);

    assert.equal(section.markers.length, 2);
    assert.deepEqual(section.markers.map(function (m) {
      return m.value;
    }), ['', 'abc']);
  });

  test('splitMarkerAtOffset inserts empty marker if section is blank', function (assert) {
    var section = builder.createMarkupSection('p');

    section.splitMarkerAtOffset(0);

    assert.equal(section.markers.length, 1);
    assert.deepEqual(section.markers.map(function (m) {
      return m.value;
    }), ['']);
  });

  test('splitMarkerAtOffset splits marker if offset is contained by marker', function (assert) {
    var section = builder.createMarkupSection('p', [builder.createMarker('abc')]);

    section.splitMarkerAtOffset(1);

    assert.equal(section.markers.length, 2);
    assert.deepEqual(section.markers.map(function (m) {
      return m.value;
    }), ['a', 'bc']);
  });

  test('splitMarkerAtOffset is no-op when offset is at end of marker', function (assert) {
    var section = builder.createMarkupSection('p', [builder.createMarker('abc')]);

    section.splitMarkerAtOffset(3);

    assert.equal(section.markers.length, 1);
    assert.deepEqual(section.markers.map(function (m) {
      return m.value;
    }), ['abc']);
  });

  test('splitMarkerAtOffset does nothing if the is offset is at end', function (assert) {
    var marker = function marker(text) {
      return builder.createMarker(text);
    };
    var section = builder.createMarkupSection('p', [marker('a'), marker('bc')]);

    section.splitMarkerAtOffset(3);

    assert.equal(section.markers.length, 2);
    assert.deepEqual(section.markers.map(function (m) {
      return m.value;
    }), ['a', 'bc']);
  });

  test('splitMarkerAtOffset splits a marker deep in the middle', function (assert) {
    var marker = function marker(text) {
      return builder.createMarker(text);
    };
    var section = builder.createMarkupSection('p', [marker('a'), marker('bc'), marker('def'), marker('ghi')]);

    section.splitMarkerAtOffset(5);

    assert.equal(section.markers.length, 5);
    assert.deepEqual(section.markers.map(function (m) {
      return m.value;
    }), ['a', 'bc', 'de', 'f', 'ghi']);
  });

  test('a section has property `isSection`', function (assert) {
    var section = builder.createMarkupSection();
    assert.ok(section.isSection, 'section.isSection');
  });

  test('#length is correct', function (assert) {
    var expectations = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref) {
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      var atom = _ref.atom;

      expectations = [{
        name: 'blank section',
        length: 0,
        section: markupSection()
      }, {
        name: 'section with empty marker',
        length: 0,
        section: markupSection('p', [marker('')])
      }, {
        name: 'section with single marker',
        length: 'abc'.length,
        section: markupSection('p', [marker('abc')])
      }, {
        name: 'section with multiple markers',
        length: 'abc'.length + 'defg'.length,
        section: markupSection('p', [marker('abc'), marker('defg')])
      }, {
        name: 'section with atom',
        length: 1,
        section: markupSection('p', [atom('mention', 'bob')])
      }, {
        name: 'section with multiple atoms',
        length: 2,
        section: markupSection('p', [atom('mention', 'bob'), atom('mention', 'other')])
      }, {
        name: 'section with atom and markers',
        length: 'abc'.length + 1,
        section: markupSection('p', [marker('abc'), atom('mention', 'bob')])
      }];
    });

    assert.expect(expectations.length);
    expectations.forEach(function (_ref2) {
      var name = _ref2.name;
      var length = _ref2.length;
      var section = _ref2.section;

      assert.equal(section.length, length, name + ' has correct length');
    });
  });

  test('#textUntil is correct', function (assert) {
    var expectations = undefined;

    _testHelpers['default'].postAbstract.build(function (_ref3) {
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;
      var atom = _ref3.atom;

      expectations = [{
        name: 'blank section',
        text: '',
        section: markupSection(),
        offset: 0
      }, {
        name: 'section with empty marker',
        text: '',
        section: markupSection('p', [marker('')]),
        offset: 0
      }, {
        name: 'section with single marker end',
        text: 'abc',
        section: markupSection('p', [marker('abc')]),
        offset: 'abc'.length
      }, {
        name: 'section with single marker middle',
        text: 'ab',
        section: markupSection('p', [marker('abc')]),
        offset: 'ab'.length
      }, {
        name: 'section with single marker start',
        text: '',
        section: markupSection('p', [marker('abc')]),
        offset: 0
      }, {
        name: 'section with multiple markers end',
        text: 'abcdefg',
        section: markupSection('p', [marker('abc'), marker('defg')]),
        offset: 'abc'.length + 'defg'.length
      }, {
        name: 'section with multiple markers middle',
        text: 'abcde',
        section: markupSection('p', [marker('abc'), marker('defg')]),
        offset: 'abc'.length + 'de'.length
      }, {
        name: 'section with atom has no text for atom',
        text: '',
        section: markupSection('p', [atom('mention', 'bob')]),
        offset: 1
      }, {
        name: 'section with multiple atoms has no text for atoms',
        text: '',
        section: markupSection('p', [atom('mention', 'bob'), atom('mention', 'other')]),
        offset: 2
      }, {
        name: 'section with atom and markers has text for markers only',
        text: 'abc',
        section: markupSection('p', [marker('abc'), atom('mention', 'bob')]),
        offset: 'abc'.length + 1
      }];
    });

    assert.expect(expectations.length);
    expectations.forEach(function (_ref4) {
      var name = _ref4.name;
      var text = _ref4.text;
      var section = _ref4.section;
      var offset = _ref4.offset;

      assert.equal(text, section.textUntil(new _mobiledocKitUtilsCursorPosition['default'](section, offset)), name);
    });
  });
});
define('tests/unit/models/post-node-builder-test', ['exports', '../../test-helpers', 'mobiledoc-kit/models/post-node-builder'], function (exports, _testHelpers, _mobiledocKitModelsPostNodeBuilder) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: PostNodeBuilder');

  test('#createMarkup returns singleton markup', function (assert) {
    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    var m1 = builder.createMarkup('strong');
    var m2 = builder.createMarkup('strong');

    assert.ok(m1 === m2, 'markups are singletons');
  });

  test('#createMarkup returns singleton markup when has equal attributes', function (assert) {
    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    var m1 = builder.createMarkup('a', { href: 'bustle.com' });
    var m2 = builder.createMarkup('a', { href: 'bustle.com' });

    assert.ok(m1 === m2, 'markups with attributes are singletons');
  });

  test('#createMarkup returns differents markups when has different attributes', function (assert) {
    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    var m1 = builder.createMarkup('a', { href: 'bustle.com' });
    var m2 = builder.createMarkup('a', { href: 'other.com' });

    assert.ok(m1 !== m2, 'markups with different attributes are different');
  });

  test('#createMarkup normalizes tagName', function (assert) {
    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    var m1 = builder.createMarkup('b');
    var m2 = builder.createMarkup('B');
    var m3 = builder.createMarkup('b', {});
    var m4 = builder.createMarkup('B', {});

    assert.ok(m1 === m2 && m2 === m3 && m3 === m4, 'all markups are the same');
  });

  test('#createCardSection creates card with builder', function (assert) {
    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    var cardSection = builder.createCardSection('test-card');
    assert.ok(cardSection.builder === builder, 'card section has builder');
  });
});
define('tests/unit/models/post-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/cursor/position'], function (exports, _testHelpers, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsCursorPosition) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Post');

  test('#walkMarkerableSections finds no section when range contains only a card', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (builder) {
      var post = builder.post;
      var cardSection = builder.cardSection;

      return post([cardSection('simple-card')]);
    });

    var foundSections = [];

    var card = post.sections.objectAt(0);
    var range = _mobiledocKitUtilsCursorRange['default'].create(card, 0, card, 0);

    post.walkMarkerableSections(range, function (s) {
      return foundSections.push(s);
    });
    assert.equal(foundSections.length, 0, 'found no markerable sections');
  });

  test('#walkMarkerableSections skips non-markerable sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (builder) {
      var post = builder.post;
      var markupSection = builder.markupSection;
      var marker = builder.marker;
      var cardSection = builder.cardSection;

      return post([markupSection('p', ['s1m1'].map(function (t) {
        return marker(t);
      })), markupSection('p', ['s2m1'].map(function (t) {
        return marker(t);
      })), cardSection('simple-card'), markupSection('p', ['s3m1'].map(function (t) {
        return marker(t);
      })), markupSection('p', ['s4m1'].map(function (t) {
        return marker(t);
      }))]);
    });

    var foundSections = [];

    var s1 = post.sections.objectAt(0);
    var s4 = post.sections.objectAt(4);

    assert.equal(s1.text, 's1m1', 'precond - find s1');
    assert.equal(s4.text, 's4m1', 'precond - find s4');

    var range = _mobiledocKitUtilsCursorRange['default'].create(s1, 0, s4, 0);

    post.walkMarkerableSections(range, function (s) {
      return foundSections.push(s);
    });

    assert.deepEqual(foundSections.map(function (s) {
      return s.text;
    }), ['s1m1', 's2m1', 's3m1', 's4m1'], 'iterates correct sections');
  });

  test('#walkAllLeafSections returns markup section that follows a list section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      var listSection = _ref.listSection;
      var listItem = _ref.listItem;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('def')]), listSection('ul', [listItem([marker('123')])]), markupSection('p')]);
    });

    var sections = [];
    post.walkAllLeafSections(function (s) {
      return sections.push(s);
    });

    assert.equal(sections.length, 4);
    assert.ok(sections[0] === post.sections.head, 'section 0');
    assert.ok(sections[1] === post.sections.objectAt(1), 'section 1');
    assert.ok(sections[2] === post.sections.objectAt(2).items.head, 'section 2');
    assert.ok(sections[3] === post.sections.tail, 'section 3');
  });

  test('#markupsInRange returns all markups when range is not collapsed', function (assert) {
    var b = undefined,
        i = undefined,
        a1 = undefined,
        a2 = undefined,
        found = undefined,
        collapsedRange = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (builder) {
      var post = builder.post;
      var markupSection = builder.markupSection;
      var cardSection = builder.cardSection;
      var marker = builder.marker;
      var markup = builder.markup;

      b = markup('strong');
      i = markup('em');
      a1 = markup('a', { href: 'example.com' });
      a2 = markup('a', { href: 'other-example.com' });

      return post([markupSection('p', [marker('plain text'), marker('bold text', [b]), marker('i text', [i]), marker('bold+i text', [b, i])]), markupSection('p', [marker('link 1', [a1])]), cardSection('simple-card'), markupSection('p', [marker('link 2', [a2])])]);
    });

    var _post$sections$toArray = post.sections.toArray();

    var _post$sections$toArray2 = _slicedToArray(_post$sections$toArray, 4);

    var s1 = _post$sections$toArray2[0];
    var s2 = _post$sections$toArray2[1];
    var s3 = _post$sections$toArray2[3];

    assert.equal(s1.text, 'plain textbold texti textbold+i text', 'precond s1');
    assert.equal(s2.text, 'link 1', 'precond s2');
    assert.equal(s3.text, 'link 2', 'precond s3');

    collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 0);
    assert.equal(post.markupsInRange(collapsedRange).length, 0, 'no markups in collapsed range at start');

    collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 'plain text'.length);
    assert.equal(post.markupsInRange(collapsedRange).length, 0, 'no markups in collapsed range at end of plain text');

    collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 'plain textbold'.length);
    found = post.markupsInRange(collapsedRange);
    assert.equal(found.length, 1, 'markup in collapsed range in bold text');
    assert.inArray(b, found, 'finds b in bold text');

    collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 'plain textbold text'.length);
    found = post.markupsInRange(collapsedRange);
    assert.equal(found.length, 1, 'markup in collapsed range at end of bold text');
    assert.inArray(b, found, 'finds b at end of bold text');

    var simpleRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 0, s1, 'plain text'.length);
    assert.equal(post.markupsInRange(simpleRange).length, 0, 'no markups in simple range');

    var singleMarkerRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 'plain textb'.length, s1, 'plain textbold'.length);
    found = post.markupsInRange(singleMarkerRange);
    assert.equal(found.length, 1, 'finds markup in marker');
    assert.inArray(b, found, 'finds b');

    var singleSectionRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 0, s1, s1.length);
    found = post.markupsInRange(singleSectionRange);
    assert.equal(found.length, 2, 'finds both markups in section');
    assert.inArray(b, found, 'finds b');
    assert.inArray(i, found, 'finds i');

    var multiSectionRange = _mobiledocKitUtilsCursorRange['default'].create(s1, 'plain textbold te'.length, s2, 'link'.length);
    found = post.markupsInRange(multiSectionRange);
    assert.equal(found.length, 3, 'finds all markups in multi-section range');
    assert.inArray(b, found, 'finds b');
    assert.inArray(i, found, 'finds i');
    assert.inArray(a1, found, 'finds a1');

    var rangeSpanningCard = _mobiledocKitUtilsCursorRange['default'].create(s1, 0, s3, 'link'.length);
    found = post.markupsInRange(rangeSpanningCard);
    assert.equal(found.length, 4, 'finds all markups in spanning section range');
    assert.inArray(b, found, 'finds b');
    assert.inArray(i, found, 'finds i');
    assert.inArray(a1, found, 'finds a1');
    assert.inArray(a2, found, 'finds a2');
  });

  test('#markupsInRange obeys left- and right-inclusive rules for "A" markups', function (assert) {
    var a = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;
      var markup = _ref2.markup;

      a = markup('a', { href: 'example.com' });
      return post([markupSection('p', [marker('123', [a]), marker(' abc '), marker('def', [a]), marker(' ghi '), marker('jkl', [a])])]);
    });

    var section = post.sections.head;
    var start = _mobiledocKitUtilsCursorRange['default'].create(section, 0);
    var left = _mobiledocKitUtilsCursorRange['default'].create(section, '123 abc '.length);
    var inside = _mobiledocKitUtilsCursorRange['default'].create(section, '123 abc d'.length);
    var right = _mobiledocKitUtilsCursorRange['default'].create(section, '123 abc def'.length);
    var end = _mobiledocKitUtilsCursorRange['default'].create(section, '123 abc def ghi jkl'.length);

    assert.deepEqual(post.markupsInRange(start), [], 'no markups at start');
    assert.deepEqual(post.markupsInRange(left), [], 'no markups at left');
    assert.deepEqual(post.markupsInRange(right), [], 'no markups at right');
    assert.deepEqual(post.markupsInRange(inside), [a], '"A" markup inside range');
    assert.deepEqual(post.markupsInRange(end), [], 'no markups at end');
  });

  test('#markersContainedByRange when range is single marker', function (assert) {
    var found = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var post = _ref3.post;
      var marker = _ref3.marker;
      var markupSection = _ref3.markupSection;

      return post([markupSection('p', [marker('abc')])]);
    });

    var innerRange = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 1, post.sections.head, 2);
    found = post.markersContainedByRange(innerRange);
    assert.equal(found.length, 0, '0 markers in innerRange');

    var outerRange = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 0, post.sections.head, 3);
    found = post.markersContainedByRange(outerRange);
    assert.equal(found.length, 1, '1 marker in outerRange');
    assert.ok(found[0] === post.sections.head.markers.head, 'finds right marker');
  });

  test('#markersContainedByRange when range is single section', function (assert) {
    var found = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var marker = _ref4.marker;
      var markupSection = _ref4.markupSection;

      return post([markupSection('p', [marker('abc'), marker('def'), marker('ghi')])]);
    });

    var section = post.sections.head;

    var innerRange = _mobiledocKitUtilsCursorRange['default'].create(section, 2, section, 4);
    found = post.markersContainedByRange(innerRange);
    assert.equal(found.length, 0, '0 markers in innerRange');

    var middleRange = _mobiledocKitUtilsCursorRange['default'].create(section, 2, section, 7);
    found = post.markersContainedByRange(middleRange);
    assert.equal(found.length, 1, '1 markers in middleRange');
    assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

    var middleRangeLeftFencepost = _mobiledocKitUtilsCursorRange['default'].create(section, 3, section, 7);
    found = post.markersContainedByRange(middleRangeLeftFencepost);
    assert.equal(found.length, 1, '1 markers in middleRangeLeftFencepost');
    assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

    var middleRangeRightFencepost = _mobiledocKitUtilsCursorRange['default'].create(section, 2, section, 6);
    found = post.markersContainedByRange(middleRangeRightFencepost);
    assert.equal(found.length, 1, '1 markers in middleRangeRightFencepost');
    assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

    var middleRangeBothFencepost = _mobiledocKitUtilsCursorRange['default'].create(section, 3, section, 6);
    found = post.markersContainedByRange(middleRangeBothFencepost);
    assert.equal(found.length, 1, '1 markers in middleRangeBothFencepost');
    assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

    var outerRange = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, section.length);
    found = post.markersContainedByRange(outerRange);
    assert.equal(found.length, section.markers.length, 'all markers in outerRange');
  });

  test('#markersContainedByRange when range is contiguous sections', function (assert) {
    var found = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var post = _ref5.post;
      var marker = _ref5.marker;
      var markupSection = _ref5.markupSection;

      return post([markupSection('p', [marker('abc'), marker('def'), marker('ghi')]), markupSection('p', [marker('123'), marker('456'), marker('789')])]);
    });

    var headSection = post.sections.head,
        tailSection = post.sections.tail;

    var innerRange = _mobiledocKitUtilsCursorRange['default'].create(headSection, 7, tailSection, 2);
    found = post.markersContainedByRange(innerRange);
    assert.equal(found.length, 0, '0 markers in innerRange');

    var middleRange = _mobiledocKitUtilsCursorRange['default'].create(headSection, 5, tailSection, 4);
    found = post.markersContainedByRange(middleRange);
    assert.equal(found.length, 2, '2 markers in middleRange');
    assert.ok(found[0] === headSection.markers.objectAt(2), 'finds right head marker');
    assert.ok(found[1] === tailSection.markers.objectAt(0), 'finds right tail marker');

    var middleRangeLeftFencepost = _mobiledocKitUtilsCursorRange['default'].create(headSection, 6, tailSection, 2);
    found = post.markersContainedByRange(middleRangeLeftFencepost);
    assert.equal(found.length, 1, '1 markers in middleRangeLeftFencepost');
    assert.ok(found[0] === headSection.markers.objectAt(2), 'finds right head marker');

    var middleRangeRightFencepost = _mobiledocKitUtilsCursorRange['default'].create(headSection, 7, tailSection, 3);
    found = post.markersContainedByRange(middleRangeRightFencepost);
    assert.equal(found.length, 1, '1 markers in middleRangeRightFencepost');
    assert.ok(found[0] === tailSection.markers.objectAt(0), 'finds right marker');

    var middleRangeBothFencepost = _mobiledocKitUtilsCursorRange['default'].create(headSection, 6, tailSection, 3);
    found = post.markersContainedByRange(middleRangeBothFencepost);
    assert.equal(found.length, 2, '2 markers in middleRangeBothFencepost');
    assert.ok(found[0] === headSection.markers.objectAt(2), 'finds right head marker');
    assert.ok(found[1] === tailSection.markers.objectAt(0), 'finds right tail marker');

    var outerRange = _mobiledocKitUtilsCursorRange['default'].create(headSection, 0, tailSection, tailSection.length);
    found = post.markersContainedByRange(outerRange);
    assert.equal(found.length, headSection.markers.length + tailSection.markers.length, 'all markers in outerRange');
  });

  test('#isBlank is true when there are no sections', function (assert) {
    var _post = undefined,
        _section = undefined;
    _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;

      _post = post();
      _section = markupSection();
    });
    assert.ok(_post.isBlank);
    _post.sections.append(_section);
    assert.ok(!_post.isBlank);
  });

  test('#trimTo creates a post from the given range', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      return post([markupSection('p', [marker('abc')])]);
    });
    var section = post.sections.head;
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 2); // "b"

    post = post.trimTo(range);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref8) {
      var post = _ref8.post;
      var marker = _ref8.marker;
      var markupSection = _ref8.markupSection;

      return post([markupSection('p', [marker('b')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#trimTo copies card sections', function (assert) {
    var cardPayload = { foo: 'bar' };

    var buildPost = _testHelpers['default'].postAbstract.build;

    var post = buildPost(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;
      var cardSection = _ref9.cardSection;

      return post([markupSection('p', [marker('abc')]), cardSection('test-card', cardPayload), markupSection('p', [marker('123')])]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head, 1, // 'b'
    post.sections.tail, 1); // '2'

    post = post.trimTo(range);
    var expected = buildPost(function (_ref10) {
      var post = _ref10.post;
      var marker = _ref10.marker;
      var markupSection = _ref10.markupSection;
      var cardSection = _ref10.cardSection;

      return post([markupSection('p', [marker('bc')]), cardSection('test-card', { foo: 'bar' }), markupSection('p', [marker('1')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#trimTo when range starts and ends in a list item', function (assert) {
    var buildPost = _testHelpers['default'].postAbstract.build;

    var post = buildPost(function (_ref11) {
      var post = _ref11.post;
      var listSection = _ref11.listSection;
      var listItem = _ref11.listItem;
      var marker = _ref11.marker;

      return post([listSection('ul', [listItem([marker('abc')])])]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 0, post.sections.head.items.head, 'ab'.length);

    post = post.trimTo(range);
    var expected = buildPost(function (_ref12) {
      var post = _ref12.post;
      var listSection = _ref12.listSection;
      var listItem = _ref12.listItem;
      var marker = _ref12.marker;

      return post([listSection('ul', [listItem([marker('ab')])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#trimTo when range contains multiple list items', function (assert) {
    var buildPost = _testHelpers['default'].postAbstract.build;

    var post = buildPost(function (_ref13) {
      var post = _ref13.post;
      var listSection = _ref13.listSection;
      var listItem = _ref13.listItem;
      var marker = _ref13.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')]), listItem([marker('ghi')])])]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 'ab'.length, post.sections.head.items.tail, 'gh'.length);

    post = post.trimTo(range);
    var expected = buildPost(function (_ref14) {
      var post = _ref14.post;
      var listSection = _ref14.listSection;
      var listItem = _ref14.listItem;
      var marker = _ref14.marker;

      return post([listSection('ul', [listItem([marker('c')]), listItem([marker('def')]), listItem([marker('gh')])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#trimTo when range contains multiple list items and more sections', function (assert) {
    var buildPost = _testHelpers['default'].postAbstract.build;

    var post = buildPost(function (_ref15) {
      var post = _ref15.post;
      var listSection = _ref15.listSection;
      var listItem = _ref15.listItem;
      var markupSection = _ref15.markupSection;
      var marker = _ref15.marker;

      return post([listSection('ul', [listItem([marker('abc')]), listItem([marker('def')]), listItem([marker('ghi')])]), markupSection('p', [marker('123')])]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(post.sections.head.items.head, 'ab'.length, post.sections.tail, '12'.length);

    post = post.trimTo(range);
    var expected = buildPost(function (_ref16) {
      var post = _ref16.post;
      var listSection = _ref16.listSection;
      var listItem = _ref16.listItem;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;

      return post([listSection('ul', [listItem([marker('c')]), listItem([marker('def')]), listItem([marker('ghi')])]), markupSection('p', [marker('12')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#headPosition and #tailPosition returns head and tail', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var marker = _ref17.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('123')])]);
    });

    var head = post.headPosition();
    var tail = post.tailPosition();

    assert.positionIsEqual(head, post.sections.head.headPosition(), 'head pos');
    assert.positionIsEqual(tail, post.sections.tail.tailPosition(), 'tail pos');
  });

  test('#headPosition and #tailPosition when post is blank return blank', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref18) {
      var post = _ref18.post;

      return post();
    });

    var head = post.headPosition();
    var tail = post.tailPosition();

    assert.positionIsEqual(head, _mobiledocKitUtilsCursorPosition['default'].blankPosition(), 'head pos');
    assert.positionIsEqual(tail, _mobiledocKitUtilsCursorPosition['default'].blankPosition(), 'tail pos');
  });

  test('#hasContent gives correct value', function (assert) {
    var expectations = _testHelpers['default'].postAbstract.build(function (_ref19) {
      var post = _ref19.post;
      var markupSection = _ref19.markupSection;
      var imageSection = _ref19.imageSection;
      var marker = _ref19.marker;

      return {
        hasNoContent: [{
          message: 'no sections',
          post: post()
        }, {
          message: '1 blank section',
          post: post([markupSection('p')])
        }, {
          message: '1 section with blank marker',
          post: post([markupSection('p', [marker('')])])
        }],
        hasContent: [{
          message: '1 section with non-blank marker',
          post: post([markupSection('p', [marker('text')])])
        }, {
          message: '2 sections',
          post: post([markupSection('p'), markupSection('p')])
        }, {
          message: 'image section',
          post: post([imageSection()])
        }]
      };
    });

    expectations.hasNoContent.forEach(function (_ref20) {
      var message = _ref20.message;
      var post = _ref20.post;

      assert.ok(!post.hasContent, message + ' !hasContent');
    });
    expectations.hasContent.forEach(function (_ref21) {
      var message = _ref21.message;
      var post = _ref21.post;

      assert.ok(post.hasContent, message + ' hasContent');
    });
  });
});
define('tests/unit/parsers/dom-test', ['exports', 'mobiledoc-kit/parsers/dom', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers', 'mobiledoc-kit/utils/characters'], function (exports, _mobiledocKitParsersDom, _mobiledocKitModelsPostNodeBuilder, _testHelpers, _mobiledocKitUtilsCharacters) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;
  var buildFromText = _testHelpers['default'].postAbstract.buildFromText;

  var ZWNJ = '‌';

  var editorElement = undefined,
      builder = undefined,
      parser = undefined,
      editor = undefined;
  var editorOpts = undefined;
  var buildDOM = _testHelpers['default'].dom.fromHTML;

  var mentionAtom = {
    name: 'mention',
    type: 'dom',
    render: function render(_ref) {
      var value = _ref.value;

      var element = document.createElement('span');
      element.setAttribute('id', 'mention-atom');
      element.appendChild(document.createTextNode(value));
      return element;
    }
  };

  _module('Unit: Parser: DOMParser', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      parser = new _mobiledocKitParsersDom['default'](builder);
      editorOpts = { element: editorElement, atoms: [mentionAtom] };
    },
    afterEach: function afterEach() {
      builder = null;
      parser = null;
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  var expectations = [['<p>some text</p>', ['some text']], ['<p>some text</p><p>some other text</p>', ['some text', 'some other text']], ['<p>some &nbsp;text &nbsp;&nbsp;for &nbsp; &nbsp;you</p>', ['some  text   for    you']], ['<p>a b</p>', ['a' + _mobiledocKitUtilsCharacters.TAB + 'b']],

  // multiple ps, with and without adjacent text nodes
  ['<p>first line</p>\n<p>second line</p>', ['first line', 'second line']], ['<p>first line</p>middle line<p>third line</p>', ['first line', 'middle line', 'third line']], ['<p>first line</p>second line', ['first line', 'second line']], ['<p>first line</p><p></p><p>third line</p>', ['first line', 'third line']], ['<b>bold text</b>', ['*bold text*']],

  // unrecognized tags
  ['<p>before<span>span</span>after</p>', ['beforespanafter']], ['<p><span><span>inner</span></span></p>', ['inner']],

  //  unrecognized attribute
  ['<p><span style="font-color:red;">was red</span></p>', ['was red']],

  // list elements
  ['<ul><li>first element</li><li>second element</li></ul>', ['* first element', '* second element']],

  // nested list elements
  ['<ul><li>first element</li><li><ul><li>nested element</li></ul></li></ul>', ['* first element', '* nested element']],

  // See https://github.com/bustle/mobiledoc-kit/issues/333
  ['abc\ndef', ['abc def']]];

  var structures = [
  // See https://github.com/bustle/mobiledoc-kit/issues/648
  ['<section><p>first</p><p>second</p></section>', ['first', 'second'], 'one level'], ['<section><div><p>first</p><p>second</p></div></section>', ['first', 'second'], 'two levels'], ['<section><div><div><p>first</p><p>second</p></div></div></section>', ['first', 'second'], 'three levels'], ['<section><div><p>first</p></div><p>second</p></section>', ['first', 'second'], 'offset left'], ['<section><p>first</p><div><p>second</p></div></section>', ['first', 'second'], 'offset right']];

  expectations.forEach(function (_ref2) {
    var _ref22 = _slicedToArray(_ref2, 2);

    var html = _ref22[0];
    var dslText = _ref22[1];

    test('#parse ' + html + ' -> ' + dslText, function (assert) {
      var post = parser.parse(buildDOM(html));

      var _buildFromText = buildFromText(dslText);

      var expected = _buildFromText.post;

      assert.postIsSimilar(post, expected);
    });
  });

  structures.forEach(function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 3);

    var html = _ref32[0];
    var dslText = _ref32[1];
    var name = _ref32[2];

    test('wrapped#parse ' + html + ' -> ' + dslText + ' (' + name + ')', function (assert) {
      var post = parser.parse(buildDOM(html));

      var _buildFromText2 = buildFromText(dslText);

      var expected = _buildFromText2.post;

      assert.postIsSimilar(post, expected);
    });
  });

  test('editor#parse fixes text in atom headTextNode when atom is at start of section', function (assert) {
    var done = assert.async();

    var _buildFromText3 = buildFromText(['X@("name": "mention", "value": "bob")']);

    var expected = _buildFromText3.post;

    editor = _testHelpers['default'].editor.buildFromText('@("name": "mention", "value": "bob")', editorOpts);

    var headTextNode = editor.post.sections.head.markers.head.renderNode.headTextNode;
    assert.ok(!!headTextNode, 'precond - headTextNode');
    headTextNode.textContent = ZWNJ + 'X';

    _testHelpers['default'].wait(function () {
      // wait for mutation
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);

      done();
    });
  });

  test('editor#parse fixes text in atom headTextNode when atom has atom before it', function (assert) {
    var done = assert.async();

    var _buildFromText4 = buildFromText('@("name": "mention", "value": "first")X@("name": "mention", "value": "last")');

    var expected = _buildFromText4.post;

    editor = _testHelpers['default'].editor.buildFromText('@("name": "mention", "value": "first")@("name": "mention", "value": "last")', editorOpts);

    var headTextNode = editor.post.sections.head.markers.tail.renderNode.headTextNode;
    assert.ok(!!headTextNode, 'precond - headTextNode');
    headTextNode.textContent = ZWNJ + 'X';

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('editor#parse fixes text in atom headTextNode when atom has marker before it', function (assert) {
    var done = assert.async();

    var _buildFromText5 = buildFromText('textX@("name":"mention","value":"bob")');

    var expected = _buildFromText5.post;

    editor = _testHelpers['default'].editor.buildFromText('text@("name":"mention","value":"bob")', editorOpts);

    var headTextNode = editor.post.sections.head.markers.objectAt(1).renderNode.headTextNode;
    assert.ok(!!headTextNode, 'precond - headTextNode');
    headTextNode.textContent = ZWNJ + 'X';

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('editor#parse fixes text in atom tailTextNode when atom is at end of section', function (assert) {
    var done = assert.async();

    var _buildFromText6 = buildFromText('@("name":"mention","value":"bob")X');

    var expected = _buildFromText6.post;

    editor = _testHelpers['default'].editor.buildFromText('@("name":"mention","value":"bob")', editorOpts);

    var tailTextNode = editor.post.sections.head.markers.head.renderNode.tailTextNode;
    assert.ok(!!tailTextNode, 'precond - tailTextNode');
    tailTextNode.textContent = ZWNJ + 'X';

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('editor#parse fixes text in atom tailTextNode when atom has atom after it', function (assert) {
    var done = assert.async();

    var _buildFromText7 = buildFromText('@("name":"mention","value":"first")X@("name":"mention","value":"last")');

    var expected = _buildFromText7.post;

    editor = _testHelpers['default'].editor.buildFromText('@("name":"mention","value":"first")@("name":"mention","value":"last")', editorOpts);

    var tailTextNode = editor.post.sections.head.markers.head.renderNode.tailTextNode;
    assert.ok(!!tailTextNode, 'precond - tailTextNode');
    tailTextNode.textContent = ZWNJ + 'X';

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('editor#parse fixes text in atom tailTextNode when atom has marker after it', function (assert) {
    var done = assert.async();

    var _buildFromText8 = buildFromText('@("name":"mention","value":"bob")Xabc');

    var expected = _buildFromText8.post;

    editor = _testHelpers['default'].editor.buildFromText('@("name":"mention","value":"bob")abc', editorOpts);

    var tailTextNode = editor.post.sections.head.markers.head.renderNode.tailTextNode;
    assert.ok(!!tailTextNode, 'precond - tailTextNode');
    tailTextNode.textContent = ZWNJ + 'X';

    _testHelpers['default'].wait(function () {
      assert.postIsSimilar(editor.post, expected);
      assert.renderTreeIsEqual(editor._renderTree, expected);
      done();
    });
  });

  test('parse empty content', function (assert) {
    var element = buildDOM('');
    var post = parser.parse(element);

    assert.ok(post.isBlank, 'post is blank');
  });

  test('plain text creates a section', function (assert) {
    var container = buildDOM('plain text');
    var element = container.firstChild;
    var post = parser.parse(element);

    var _buildFromText9 = buildFromText('plain text');

    var expected = _buildFromText9.post;

    assert.postIsSimilar(post, expected);
  });

  test('strong tag + em + text node creates section', function (assert) {
    var element = buildDOM('<b><em>stray</em> markup tags</b>');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, 'parse 1 section');
    assert.equal(post.sections.objectAt(0).text, 'stray markup tags');

    var markers = post.sections.objectAt(0).markers.toArray();
    assert.equal(markers.length, 2, '2 markers');

    var _markers = _slicedToArray(markers, 2);

    var m1 = _markers[0];
    var m2 = _markers[1];

    assert.equal(m1.value, 'stray');
    assert.equal(m2.value, ' markup tags');

    assert.ok(m1.hasMarkup('b'), 'm1 is b');
    assert.ok(m1.hasMarkup('em'), 'm1 is em');

    assert.ok(m2.hasMarkup('b'), 'm2 is b');
    assert.ok(!m2.hasMarkup('em'), 'm1 is not em');
  });

  test('wrapped strong tag + em + text node creates section', function (assert) {
    var element = buildDOM('<div><b><em>stray</em> markup tags</b></div>');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, 'parse 1 section');
    assert.equal(post.sections.objectAt(0).text, 'stray markup tags');

    var markers = post.sections.objectAt(0).markers.toArray();
    assert.equal(markers.length, 2, '2 markers');

    var _markers2 = _slicedToArray(markers, 2);

    var m1 = _markers2[0];
    var m2 = _markers2[1];

    assert.equal(m1.value, 'stray');
    assert.equal(m2.value, ' markup tags');

    assert.ok(m1.hasMarkup('b'), 'm1 is b');
    assert.ok(m1.hasMarkup('em'), 'm1 is em');

    assert.ok(m2.hasMarkup('b'), 'm2 is b');
    assert.ok(!m2.hasMarkup('em'), 'm1 is not em');
  });

  test('link (A tag) is parsed', function (assert) {
    var url = 'http://bustle.com',
        rel = 'nofollow';
    var element = buildDOM('<a href="' + url + '" rel="' + rel + '">link</a>');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');
    assert.equal(post.sections.objectAt(0).text, 'link');

    var markers = post.sections.objectAt(0).markers.toArray();
    assert.equal(markers.length, 1, '1 marker');

    var _markers3 = _slicedToArray(markers, 1);

    var marker = _markers3[0];

    assert.equal(marker.value, 'link');
    assert.ok(marker.hasMarkup('a'), 'has A markup');

    var markup = marker.markups[0];
    assert.equal(markup.getAttribute('href'), url, 'has href attr');
    assert.equal(markup.getAttribute('rel'), rel, 'has rel attr');
  });

  test('span with font-style italic maps to em', function (assert) {
    var element = buildDOM('<p><span style="font-style:ItaLic;">emph</span></p>');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');

    var section = post.sections.objectAt(0);
    assert.equal(section.markers.length, 1, '1 marker');
    var marker = section.markers.objectAt(0);

    assert.equal(marker.value, 'emph');
    assert.ok(marker.hasMarkup('em'), 'marker is em');
  });

  test('span with font-weight 700 maps to strong', function (assert) {
    var element = buildDOM('<p><span style="font-weight:700;">bold 700</span></p>');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');

    var section = post.sections.objectAt(0);
    assert.equal(section.markers.length, 1, '1 marker');
    var marker = section.markers.objectAt(0);

    assert.equal(marker.value, 'bold 700');
    assert.ok(marker.hasMarkup('strong'), 'marker is strong');
  });

  test('span with font-weight "bold" maps to strong', function (assert) {
    var element = buildDOM('<p><span style="font-weight:bold;">bold bold</span></p>');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');

    var section = post.sections.objectAt(0);
    assert.equal(section.markers.length, 1, '1 marker');
    var marker = section.markers.objectAt(0);

    assert.equal(marker.value, 'bold bold');
    assert.ok(marker.hasMarkup('strong'), 'marker is strong');
  });

  var recognizedTags = ['aside', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
  recognizedTags.forEach(function (tag) {
    test('recognized markup section tags are parsed (' + tag + ')', function (assert) {
      var element = buildDOM('<' + tag + '>' + tag + ' text</' + tag + '>');
      var post = parser.parse(element);

      assert.equal(post.sections.length, 1, '1 section');
      assert.equal(post.sections.objectAt(0).text, tag + ' text');
      assert.equal(post.sections.objectAt(0).tagName, tag);
    });
  });

  test('unrecognized attributes are ignored', function (assert) {
    var element = buildDOM('\n    <a href="http://bustle.com"\n       style="text-decoration: none">not-underlined link</a>');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');
    assert.equal(post.sections.objectAt(0).text, 'not-underlined link');
    var marker = post.sections.objectAt(0).markers.objectAt(0);
    assert.equal(marker.value, 'not-underlined link');
    assert.ok(marker.hasMarkup('a'), 'has <a> markup');
    var markup = marker.getMarkup('a');
    assert.equal(markup.getAttribute('href'), 'http://bustle.com');
    assert.ok(!markup.getAttribute('style'), 'style attribute not included');
  });

  test('singly-nested ol lis are parsed correctly', function (assert) {
    var element = buildDOM('\n    <ol><li>first element</li><li>second element</li></ol>\n  ');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');
    var section = post.sections.objectAt(0);
    assert.equal(section.tagName, 'ol');
    assert.equal(section.items.length, 2, '2 items');
    assert.equal(section.items.objectAt(0).text, 'first element');
    assert.equal(section.items.objectAt(1).text, 'second element');
  });

  test('nested html doesn\'t create unneccessary whitespace', function (assert) {
    var element = buildDOM('\n    <div>\n      <p>\n        One\n      <p>\n      <p>\n        Two\n      </p>\n    </div>\n  ');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 2, '2 sections');
    assert.equal(post.sections.objectAt(0).text, 'One');
    assert.equal(post.sections.objectAt(1).text, 'Two');
  });

  // Google docs nests uls like this
  test('lis in nested uls are flattened (when ul is child of ul)', function (assert) {
    var element = buildDOM('\n    <ul>\n      <li>outer</li>\n      <ul><li>inner</li></ul>\n    </ul>\n  ');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');
    var section = post.sections.objectAt(0);
    assert.equal(section.tagName, 'ul');
    assert.equal(section.items.length, 2, '2 items');
    assert.equal(section.items.objectAt(0).text, 'outer');
    assert.equal(section.items.objectAt(1).text, 'inner');
  });

  test('#appendSection does not skip sections containing a single atom with no text value', function (assert) {
    var options = {
      plugins: [function (node, builder, _ref4) {
        var addMarkerable = _ref4.addMarkerable;
        var nodeFinished = _ref4.nodeFinished;

        if (node.nodeType !== 1 || node.tagName !== 'BR') {
          return;
        }

        var softReturn = builder.createAtom('soft-return');
        addMarkerable(softReturn);

        nodeFinished();
      }]
    };
    parser = new _mobiledocKitParsersDom['default'](builder, options);

    var element = buildDOM('Testing<br>Atoms');
    var post = parser.parse(element);

    assert.equal(post.sections.length, 1, '1 section');
    var section = post.sections.objectAt(0);
    assert.equal(section.tagName, 'p');
    assert.equal(section.markers.length, 3, '3 markers');
    assert.equal(section.markers.objectAt(0).value, 'Testing');
    assert.equal(section.markers.objectAt(1).name, 'soft-return');
    assert.equal(section.markers.objectAt(2).value, 'Atoms');
  });
});
define('tests/unit/parsers/html-google-docs-test', ['exports', 'mobiledoc-kit/parsers/html', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers', '../../fixtures/google-docs', 'mobiledoc-kit/utils/array-utils', 'mobiledoc-kit/models/types'], function (exports, _mobiledocKitParsersHtml, _mobiledocKitModelsPostNodeBuilder, _testHelpers, _fixturesGoogleDocs, _mobiledocKitUtilsArrayUtils, _mobiledocKitModelsTypes) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  function parseHTML(html) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    return new _mobiledocKitParsersHtml['default'](builder, options).parse(html);
  }

  _module('Unit: Parser: HTMLParser Google Docs');

  function equalToExpected(assert, rawHTML, expectedHTML) {
    var raw = parseHTML(rawHTML),
        expected = parseHTML(expectedHTML);

    assert.equal(raw.sections.length, expected.sections.length, 'matches section length');
    raw.sections.forEach(function (section, sectionIndex) {
      var expectedSection = expected.sections.objectAt(sectionIndex);

      if (section.type === _mobiledocKitModelsTypes.CARD_TYPE) {
        assert.equal(section.name, expectedSection.name, 'card section at index ' + sectionIndex + ' has equal name');

        assert.deepEqual(section.payload, expectedSection.payload, 'card section at index ' + sectionIndex + ' has equal payload');

        return;
      }

      assert.equal(section.markers.length, expectedSection.markers.length, 'section at index ' + sectionIndex + ' has equal marker length');
      assert.equal(section.text, expectedSection.text, 'section at index ' + sectionIndex + ' has equal text');
      assert.equal(section.tagName, expectedSection.tagName, 'section at index ' + sectionIndex + ' has equal tagName');

      section.markers.forEach(function (marker, markerIndex) {
        var expectedMarker = expectedSection.markers.objectAt(markerIndex);

        assert.equal(marker.value, expectedMarker.value, 'marker #' + markerIndex + ' at section #' + sectionIndex + ' matches value');

        assert.equal(marker.markups.length, expectedMarker.markups.length, 'marker #' + markerIndex + ' at section #' + sectionIndex + ' matches markups length');

        (0, _mobiledocKitUtilsArrayUtils.forEach)(expectedMarker.markups, function (expectedMarkup) {
          var markup = marker.getMarkup(expectedMarkup.tagName);
          assert.ok(markup, 'has markup with tagName ' + expectedMarkup.tagName);
          var attributes = expectedMarkup.attributes;
          (0, _mobiledocKitUtilsArrayUtils.forEach)(Object.keys(attributes), function (key) {
            assert.equal(expectedMarkup.getAttribute(key), markup.getAttribute(key), 'equal attribute value for ' + key);
          });
        });
      });
    });
  }

  Object.keys(_fixturesGoogleDocs['default']).forEach(function (key) {
    test(key, function (assert) {
      var example = _fixturesGoogleDocs['default'][key];
      equalToExpected(assert, example.raw, example.expected);
    });
  });

  test('img in span can use a cardParser to turn img into image-card', function (assert) {
    var example = _fixturesGoogleDocs['default']['img in span'];
    var options = {
      plugins: [function (element, builder, _ref) {
        var addSection = _ref.addSection;

        if (element.tagName === 'IMG') {
          var _payload = { url: element.src };
          var cardSection = builder.createCardSection('image-card', _payload);
          addSection(cardSection);
        }
      }]
    };
    var parsed = parseHTML(example.raw, options);

    var sections = parsed.sections.toArray();
    var found = false,
        payload = undefined;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].name === 'image-card') {
        found = true;
        payload = sections[i].payload;
      }
    }
    assert.ok(found, 'found image-card');
    assert.ok(payload.url, 'has url in payload');
  });
});
define('tests/unit/parsers/html-google-sheets-test', ['exports', 'mobiledoc-kit/parsers/html', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers'], function (exports, _mobiledocKitParsersHtml, _mobiledocKitModelsPostNodeBuilder, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var parser = undefined;

  _module('Unit: Parser: HTMLParser Google Sheets', {
    beforeEach: function beforeEach() {
      var options = {};
      var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      parser = new _mobiledocKitParsersHtml['default'](builder, options);
    },
    afterEach: function afterEach() {
      parser = null;
    }
  });

  // No formatting
  test('#parse returns a markup section when given a cell without formatting', function (assert) {
    var text = '<meta http-equiv="content-type" content="text/html; charset=utf-8"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,513,[null,0],null,null,null,null,null,null,null,null,0]">Ways of climbing over the wall</span>';
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('Ways of climbing over the wall')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  // No formatting (Chrome - Windows)
  test('#parse returns a markup section when given a cell without formatting (Chrome - Windows)', function (assert) {
    var text = '<html><body><!--StartFragment--><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,513,[null,0],null,null,null,null,null,null,null,null,0]">Ways of climbing over the wall</span><!--EndFragment--></body></html>';
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      return post([markupSection('p', [marker('Ways of climbing over the wall')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  // Cell in bold
  test('#parse returns a markup section with bold when given a cell in bold', function (assert) {
    var text = '<meta http-equiv="content-type" content="text/html; charset=utf-8"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;font-weight:bold;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,16897,[null,0],null,null,null,null,null,null,null,null,0,null,null,null,null,1]">Ways of climbing over the wall</span>';
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;
      var markup = _ref3.markup;

      var b = markup('strong');
      return post([markupSection('p', [marker('Ways of climbing over the wall', [b])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  // Cell in bold (Chrome - Windows)
  test('#parse returns a markup section with bold when given a cell in bold (Chrome - Windows)', function (assert) {
    var text = '<html><body><!--StartFragment--><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;font-weight:bold;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,16897,[null,0],null,null,null,null,null,null,null,null,0,null,null,null,null,1]">Ways of climbing over the wall</span><!--EndFragment--></body></html>';
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;
      var markup = _ref4.markup;

      var b = markup('strong');
      return post([markupSection('p', [marker('Ways of climbing over the wall', [b])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  // Two adjacent cells without formatting
  test('#parse returns a single markup section when given two cells on top of each other without formatting', function (assert) {
    var text = '<meta http-equiv="content-type" content="text/html; charset=utf-8"><meta name="generator" content="Sheets"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><table cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:13px;font-family:arial,sans,sans-serif;border-collapse:collapse;border:1px solid #ccc"><colgroup><col width="361"></colgroup><tbody><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Ostalgia&quot;]">Ostalgia</td></tr><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Photo&quot;]">Photo</td></tr></tbody></table>';
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;

      return post([markupSection('p', [marker('OstalgiaPhoto')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  // Two adjacent cells without formatting (Chrome - Windows)
  test('#parse returns a single markup section when given two cells on top of each other without formatting (Chrome - Windows)', function (assert) {
    var text = '<html><body><!--StartFragment--><meta name="generator" content="Sheets"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><table cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:13px;font-family:arial,sans,sans-serif;border-collapse:collapse;border:1px solid #ccc"><colgroup><col width="361"></colgroup><tbody><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Ostalgia&quot;]">Ostalgia</td></tr><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Photo&quot;]">Photo</td></tr></tbody></table><!--EndFragment--></body></html>';
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;

      return post([markupSection('p', [marker('OstalgiaPhoto')])]);
    });

    assert.postIsSimilar(post, expected);
  });
});
define('tests/unit/parsers/html-test', ['exports', 'mobiledoc-kit/parsers/html', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers'], function (exports, _mobiledocKitParsersHtml, _mobiledocKitModelsPostNodeBuilder, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  function parseHTML(html) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    return new _mobiledocKitParsersHtml['default'](builder, options).parse(html);
  }

  var didParseVideo = undefined;
  function videoParserPlugin(node) {
    if (node.tagName === 'VIDEO') {
      didParseVideo = true;
    }
  }

  _module('Unit: Parser: HTMLParser', {
    beforeEach: function beforeEach() {
      didParseVideo = false;
    }
  });

  test('style tags are ignored', function (assert) {
    // This is the html you get when copying a message from Slack's desktop app
    var html = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="Content-Style-Type" content="text/css"> <title></title> <meta name="Generator" content="Cocoa HTML Writer"> <meta name="CocoaVersion" content="1348.17"> <style type="text/css"> p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 15.0px Times; color: #2c2d30; -webkit-text-stroke: #2c2d30; background-color: #f9f9f9} span.s1 {font-kerning: none} </style> </head> <body> <p class="p1"><span class="s1">cool</span></p> </body> </html>';
    var post = parseHTML(html);

    var expected = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('cool')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  // See https://github.com/bustle/mobiledoc-kit/issues/333
  test('newlines ("\\n") are replaced with space characters', function (assert) {
    var html = "abc\ndef";
    var post = parseHTML(html);

    var _Helpers$postAbstract$buildFromText = _testHelpers['default'].postAbstract.buildFromText(['abc def']);

    var expected = _Helpers$postAbstract$buildFromText.post;

    assert.postIsSimilar(post, expected);
  });

  // see https://github.com/bustlelabs/mobiledoc-kit/issues/494
  test('top-level unknown void elements are parsed', function (assert) {
    var html = '<video />';
    var post = parseHTML(html, { plugins: [videoParserPlugin] });

    var _Helpers$postAbstract$buildFromText2 = _testHelpers['default'].postAbstract.buildFromText([]);

    var expected = _Helpers$postAbstract$buildFromText2.post;

    assert.ok(didParseVideo);
    assert.postIsSimilar(post, expected);
  });

  // see https://github.com/bustlelabs/mobiledoc-kit/issues/494
  test('top-level unknown elements are parsed', function (assert) {
    var html = '<video>...inner...</video>';
    var post = parseHTML(html, { plugins: [videoParserPlugin] });

    var _Helpers$postAbstract$buildFromText3 = _testHelpers['default'].postAbstract.buildFromText(['...inner...']);

    var expected = _Helpers$postAbstract$buildFromText3.post;

    assert.ok(didParseVideo);
    assert.postIsSimilar(post, expected);
  });

  test('nested void unknown elements are parsed', function (assert) {
    var html = '<p>...<video />...</p>';
    var post = parseHTML(html, { plugins: [videoParserPlugin] });

    var _Helpers$postAbstract$buildFromText4 = _testHelpers['default'].postAbstract.buildFromText(['......']);

    var expected = _Helpers$postAbstract$buildFromText4.post;

    assert.ok(didParseVideo);
    assert.postIsSimilar(post, expected);
  });

  test('nested unknown elements are parsed', function (assert) {
    var html = '<p>...<video>inner</video>...</p>';
    var post = parseHTML(html, { plugins: [videoParserPlugin] });

    var _Helpers$postAbstract$buildFromText5 = _testHelpers['default'].postAbstract.buildFromText(['...inner...']);

    var expected = _Helpers$postAbstract$buildFromText5.post;

    assert.ok(didParseVideo);
    assert.postIsSimilar(post, expected);
  });
});
define('tests/unit/parsers/mobiledoc-test', ['exports', 'mobiledoc-kit/parsers/mobiledoc', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers'], function (exports, _mobiledocKitParsersMobiledoc, _mobiledocKitRenderersMobiledoc02, _mobiledocKitModelsPostNodeBuilder, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined,
      post = undefined;

  function parse(mobiledoc) {
    return _mobiledocKitParsersMobiledoc['default'].parse(builder, mobiledoc);
  }

  _module('Unit: Parsers: Mobiledoc', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      post = builder.createPost();
    },
    afterEach: function afterEach() {
      builder = null;
      post = null;
    }
  });

  test('#parse empty doc returns an empty post', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], []]
    };

    var parsed = parse(mobiledoc);
    assert.equal(parsed.sections.length, 0, '0 sections');
  });

  test('#parse basic mobiledoc from renderer works', function (assert) {
    var mobiledoc = _testHelpers['default'].mobiledoc.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('Howdy')])]);
    });

    var parsed = parse(mobiledoc);
    assert.equal(parsed.sections.length, 1, '1 section');
  });
});
define('tests/unit/parsers/mobiledoc/0-2-test', ['exports', 'mobiledoc-kit/parsers/mobiledoc/0-2', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/models/post-node-builder', '../../../test-helpers'], function (exports, _mobiledocKitParsersMobiledoc02, _mobiledocKitRenderersMobiledoc02, _mobiledocKitModelsPostNodeBuilder, _testHelpers) {
  'use strict';

  var DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var parser = undefined,
      builder = undefined,
      post = undefined;

  _module('Unit: Parsers: Mobiledoc 0.2', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      parser = new _mobiledocKitParsersMobiledoc02['default'](builder);
      post = builder.createPost();
    },
    afterEach: function afterEach() {
      parser = null;
      builder = null;
      post = null;
    }
  });

  test('#parse empty doc returns an empty post', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], []]
    };

    var parsed = parser.parse(mobiledoc);
    assert.equal(parsed.sections.length, 0, '0 sections');
  });

  test('#parse empty markup section returns an empty post', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[1, 'p', []]]]
    };

    var section = builder.createMarkupSection('p');
    post.sections.append(section);
    assert.deepEqual(parser.parse(mobiledoc), post);
  });

  test('#parse doc without marker types', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[1, 'P', [[[], 0, 'hello world']]]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var marker = builder.createMarker('hello world');
    section.markers.append(marker);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with blank marker', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[1, 'P', [[[], 0, '']]]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with marker type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[['B'], ['A', ['href', 'google.com']]], [[1, 'P', [[[1], 0, 'hello'], // a tag open
      [[0], 1, 'brave new'], // b tag open/close
      [[], 1, 'world'] // a tag close
      ]]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var aMarkerType = builder.createMarkup('A', { href: 'google.com' });
    var bMarkerType = builder.createMarkup('B');

    var markers = [builder.createMarker('hello', [aMarkerType]), builder.createMarker('brave new', [aMarkerType, bMarkerType]), builder.createMarker('world', [aMarkerType])];
    markers.forEach(function (marker) {
      return section.markers.append(marker);
    });
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse pull-quote section to aside node', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[1, 'PULL-QUOTE', [[[], 0, 'quoted']]]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('ASIDE', [], false);
    var markers = [builder.createMarker('quoted', [])];
    markers.forEach(function (marker) {
      return section.markers.append(marker);
    });
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with image section', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[2, DATA_URL]]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createImageSection(DATA_URL);
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });

  test('#parse doc with custom card type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[10, 'custom-card', {}]]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createCardSection('custom-card');
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });

  test('#parse a mobile doc with list-section and list-item', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[3, 'ul', [[[[], 0, "first item"]], [[[], 0, "second item"]]]]]]
    };

    var parsed = parser.parse(mobiledoc);

    var items = [builder.createListItem([builder.createMarker('first item')]), builder.createListItem([builder.createMarker('second item')])];
    var section = builder.createListSection('ul', items);
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });
});
define('tests/unit/parsers/mobiledoc/0-3-2-test', ['exports', 'mobiledoc-kit/parsers/mobiledoc/0-3-2', 'mobiledoc-kit/renderers/mobiledoc/0-3-2', 'mobiledoc-kit/models/post-node-builder', '../../../test-helpers'], function (exports, _mobiledocKitParsersMobiledoc032, _mobiledocKitRenderersMobiledoc032, _mobiledocKitModelsPostNodeBuilder, _testHelpers) {
  'use strict';

  var DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var parser = undefined,
      builder = undefined,
      post = undefined;

  _module('Unit: Parsers: Mobiledoc 0.3.2', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      parser = new _mobiledocKitParsersMobiledoc032['default'](builder);
      post = builder.createPost();
    },
    afterEach: function afterEach() {
      parser = null;
      builder = null;
      post = null;
    }
  });

  test('#parse empty doc returns an empty post', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: []
    };

    var parsed = parser.parse(mobiledoc);
    assert.equal(parsed.sections.length, 0, '0 sections');
  });

  test('#parse empty markup section returns an empty post', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'p', []]]
    };

    var section = builder.createMarkupSection('p');
    post.sections.append(section);
    assert.deepEqual(parser.parse(mobiledoc), post);
  });

  test('#parse doc without marker types', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'P', [[0, [], 0, 'hello world']]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var marker = builder.createMarker('hello world');
    section.markers.append(marker);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with blank marker', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'P', [[0, [], 0, '']]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with marker type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['B'], ['A', ['href', 'google.com']]],
      sections: [[1, 'P', [[0, [1], 0, 'hello'], // a tag open
      [0, [0], 1, 'brave new'], // b tag open/close
      [0, [], 1, 'world'] // a tag close
      ]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var aMarkerType = builder.createMarkup('A', { href: 'google.com' });
    var bMarkerType = builder.createMarkup('B');

    var markers = [builder.createMarker('hello', [aMarkerType]), builder.createMarker('brave new', [aMarkerType, bMarkerType]), builder.createMarker('world', [aMarkerType])];
    markers.forEach(function (marker) {
      return section.markers.append(marker);
    });
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with image section', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[2, DATA_URL]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createImageSection(DATA_URL);
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });

  test('#parse doc with custom card type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [['custom-card', {}]],
      markups: [],
      sections: [[10, 0]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createCardSection('custom-card');
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });

  test('#parse doc with custom atom type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [],
      sections: [[1, 'P', [[1, [], 0, 0]]]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var atom = builder.createAtom('mention', '@bob', { id: 42 });
    section.markers.append(atom);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse a mobile doc with list-section and list-item', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[3, 'ul', [[[0, [], 0, "first item"]], [[0, [], 0, "second item"]]]]]
    };

    var parsed = parser.parse(mobiledoc);

    var items = [builder.createListItem([builder.createMarker('first item')]), builder.createListItem([builder.createMarker('second item')])];
    var section = builder.createListSection('ul', items);
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });

  test('#parse doc with paragraph with text alignment', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'P', [[0, [], 0, 'hello world']], ['data-md-text-align', 'center']]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false, { 'data-md-text-align': 'center' });
    var marker = builder.createMarker('hello world');
    section.markers.append(marker);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse a mobile doc with list-section with text align', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[3, 'ul', [[[0, [], 0, "first item"]], [[0, [], 0, "second item"]]], ['data-md-text-align', 'center']]]
    };

    var parsed = parser.parse(mobiledoc);

    var items = [builder.createListItem([builder.createMarker('first item')]), builder.createListItem([builder.createMarker('second item')])];
    var section = builder.createListSection('ul', items, { 'data-md-text-align': 'center' });
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });
});
define('tests/unit/parsers/mobiledoc/0-3-test', ['exports', 'mobiledoc-kit/parsers/mobiledoc/0-3', 'mobiledoc-kit/renderers/mobiledoc/0-3', 'mobiledoc-kit/models/post-node-builder', '../../../test-helpers'], function (exports, _mobiledocKitParsersMobiledoc03, _mobiledocKitRenderersMobiledoc03, _mobiledocKitModelsPostNodeBuilder, _testHelpers) {
  'use strict';

  var DATA_URL = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var parser = undefined,
      builder = undefined,
      post = undefined;

  _module('Unit: Parsers: Mobiledoc 0.3', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      parser = new _mobiledocKitParsersMobiledoc03['default'](builder);
      post = builder.createPost();
    },
    afterEach: function afterEach() {
      parser = null;
      builder = null;
      post = null;
    }
  });

  test('#parse empty doc returns an empty post', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: []
    };

    var parsed = parser.parse(mobiledoc);
    assert.equal(parsed.sections.length, 0, '0 sections');
  });

  test('#parse empty markup section returns an empty post', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'p', []]]
    };

    var section = builder.createMarkupSection('p');
    post.sections.append(section);
    assert.deepEqual(parser.parse(mobiledoc), post);
  });

  test('#parse doc without marker types', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'P', [[0, [], 0, 'hello world']]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var marker = builder.createMarker('hello world');
    section.markers.append(marker);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with blank marker', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'P', [[0, [], 0, '']]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with marker type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['B'], ['A', ['href', 'google.com']]],
      sections: [[1, 'P', [[0, [1], 0, 'hello'], // a tag open
      [0, [0], 1, 'brave new'], // b tag open/close
      [0, [], 1, 'world'] // a tag close
      ]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var aMarkerType = builder.createMarkup('A', { href: 'google.com' });
    var bMarkerType = builder.createMarkup('B');

    var markers = [builder.createMarker('hello', [aMarkerType]), builder.createMarker('brave new', [aMarkerType, bMarkerType]), builder.createMarker('world', [aMarkerType])];
    markers.forEach(function (marker) {
      return section.markers.append(marker);
    });
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse pull-quote section to aside node', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'PULL-QUOTE', [[0, [], 0, 'quoted']]]]
    };
    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('ASIDE', [], false);
    var markers = [builder.createMarker('quoted', [])];
    markers.forEach(function (marker) {
      return section.markers.append(marker);
    });
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse doc with image section', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[2, DATA_URL]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createImageSection(DATA_URL);
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });

  test('#parse doc with custom card type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [['custom-card', {}]],
      markups: [],
      sections: [[10, 0]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createCardSection('custom-card');
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });

  test('#parse doc with custom atom type', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [],
      sections: [[1, 'P', [[1, [], 0, 0]]]]
    };

    var parsed = parser.parse(mobiledoc);

    var section = builder.createMarkupSection('P', [], false);
    var atom = builder.createAtom('mention', '@bob', { id: 42 });
    section.markers.append(atom);
    post.sections.append(section);

    assert.deepEqual(parsed, post);
  });

  test('#parse a mobile doc with list-section and list-item', function (assert) {
    var mobiledoc = {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[3, 'ul', [[[0, [], 0, "first item"]], [[0, [], 0, "second item"]]]]]
    };

    var parsed = parser.parse(mobiledoc);

    var items = [builder.createListItem([builder.createMarker('first item')]), builder.createListItem([builder.createMarker('second item')])];
    var section = builder.createListSection('ul', items);
    post.sections.append(section);
    assert.deepEqual(parsed, post);
  });
});
define('tests/unit/parsers/section-test', ['exports', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/parsers/section', '../../test-helpers', 'mobiledoc-kit/utils/dom-utils'], function (exports, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitParsersSection, _testHelpers, _mobiledocKitUtilsDomUtils) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined,
      parser = undefined;
  var buildDOM = _testHelpers['default'].dom.fromHTML;

  _module('Unit: Parser: SectionParser', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      parser = new _mobiledocKitParsersSection['default'](builder);
    },
    afterEach: function afterEach() {
      builder = null;
      parser = null;
    }
  });

  test('#parse parses simple dom', function (assert) {
    var container = buildDOM('<p>hello there<b>i am bold</b><p>');
    var element = container.firstChild;

    var _parser$parse = parser.parse(element);

    var _parser$parse2 = _slicedToArray(_parser$parse, 1);

    var section = _parser$parse2[0];

    assert.equal(section.tagName, 'p');
    assert.equal(section.markers.length, 2, 'has 2 markers');

    var _section$markers$toArray = section.markers.toArray();

    var _section$markers$toArray2 = _slicedToArray(_section$markers$toArray, 2);

    var m1 = _section$markers$toArray2[0];
    var m2 = _section$markers$toArray2[1];

    assert.equal(m1.value, 'hello there');
    assert.equal(m2.value, 'i am bold');
    assert.ok(m2.hasMarkup('b'), 'm2 is bold');
  });

  test('#parse parses nested markups', function (assert) {
    var container = buildDOM('\n    <p><b>i am bold<i>i am bold and italic</i>i am bold again</b></p>\n  ');
    var element = container.firstChild;

    var _parser$parse3 = parser.parse(element);

    var _parser$parse32 = _slicedToArray(_parser$parse3, 1);

    var section = _parser$parse32[0];

    assert.equal(section.markers.length, 3, 'has 3 markers');

    var _section$markers$toArray3 = section.markers.toArray();

    var _section$markers$toArray32 = _slicedToArray(_section$markers$toArray3, 3);

    var m1 = _section$markers$toArray32[0];
    var m2 = _section$markers$toArray32[1];
    var m3 = _section$markers$toArray32[2];

    assert.equal(m1.value, 'i am bold');
    assert.equal(m2.value, 'i am bold and italic');
    assert.equal(m3.value, 'i am bold again');
    assert.ok(m1.hasMarkup('b'), 'm1 is bold');
    assert.ok(m2.hasMarkup('b') && m2.hasMarkup('i'), 'm2 is bold and i');
    assert.ok(m3.hasMarkup('b'), 'm3 is bold');
    assert.ok(!m1.hasMarkup('i') && !m3.hasMarkup('i'), 'm1 and m3 are not i');
  });

  test('#parse ignores non-markup elements like spans', function (assert) {
    var container = buildDOM('\n    <p><span>i was in span</span></p>\n  ');
    var element = container.firstChild;

    var _parser$parse4 = parser.parse(element);

    var _parser$parse42 = _slicedToArray(_parser$parse4, 1);

    var section = _parser$parse42[0];

    assert.equal(section.tagName, 'p');
    assert.equal(section.markers.length, 1, 'has 1 markers');

    var _section$markers$toArray4 = section.markers.toArray();

    var _section$markers$toArray42 = _slicedToArray(_section$markers$toArray4, 1);

    var m1 = _section$markers$toArray42[0];

    assert.equal(m1.value, 'i was in span');
  });

  test('#parse reads attributes', function (assert) {
    var container = buildDOM('\n    <p><a href="google.com">i am a link</a></p>\n  ');
    var element = container.firstChild;

    var _parser$parse5 = parser.parse(element);

    var _parser$parse52 = _slicedToArray(_parser$parse5, 1);

    var section = _parser$parse52[0];

    assert.equal(section.markers.length, 1, 'has 1 markers');

    var _section$markers$toArray5 = section.markers.toArray();

    var _section$markers$toArray52 = _slicedToArray(_section$markers$toArray5, 1);

    var m1 = _section$markers$toArray52[0];

    assert.equal(m1.value, 'i am a link');
    assert.ok(m1.hasMarkup('a'), 'has "a" markup');
    assert.equal(m1.getMarkup('a').attributes.href, 'google.com');
  });

  test('#parse joins contiguous text nodes separated by non-markup elements', function (assert) {
    var container = buildDOM('\n    <p><span>span 1</span><span>span 2</span></p>\n  ');
    var element = container.firstChild;

    var _parser$parse6 = parser.parse(element);

    var _parser$parse62 = _slicedToArray(_parser$parse6, 1);

    var section = _parser$parse62[0];

    assert.equal(section.tagName, 'p');
    assert.equal(section.markers.length, 1, 'has 1 marker');

    var _section$markers$toArray6 = section.markers.toArray();

    var _section$markers$toArray62 = _slicedToArray(_section$markers$toArray6, 1);

    var m1 = _section$markers$toArray62[0];

    assert.equal(m1.value, 'span 1span 2');
  });

  test('#parse turns a textNode into a section', function (assert) {
    var container = buildDOM('I am a text node');
    var element = container.firstChild;

    var _parser$parse7 = parser.parse(element);

    var _parser$parse72 = _slicedToArray(_parser$parse7, 1);

    var section = _parser$parse72[0];

    assert.equal(section.tagName, 'p');
    assert.equal(section.markers.length, 1, 'has 1 marker');

    var _section$markers$toArray7 = section.markers.toArray();

    var _section$markers$toArray72 = _slicedToArray(_section$markers$toArray7, 1);

    var m1 = _section$markers$toArray72[0];

    assert.equal(m1.value, 'I am a text node');
  });

  test('#parse allows passing in parserPlugins that can override element parsing', function (assert) {
    var container = buildDOM('\n    <p>text 1<img src="https://placehold.it/100x100">text 2</p>\n  ');

    var element = container.firstChild;
    var plugins = [function (element, builder, _ref) {
      var addSection = _ref.addSection;

      if (element.tagName !== 'IMG') {
        return;
      }
      var payload = { url: element.src };
      var cardSection = builder.createCardSection('test-image', payload);
      addSection(cardSection);
    }];
    parser = new _mobiledocKitParsersSection['default'](builder, { plugins: plugins });
    var sections = parser.parse(element);

    assert.equal(sections.length, 3, '3 sections');

    assert.equal(sections[0].text, 'text 1');
    assert.equal(sections[2].text, 'text 2');

    var cardSection = sections[1];
    assert.equal(cardSection.name, 'test-image');
    assert.deepEqual(cardSection.payload, { url: 'https://placehold.it/100x100' });
  });

  test('#parse allows passing in parserPlugins that can override text parsing', function (assert) {
    var container = buildDOM('\n    <p>text 1<img src="https://placehold.it/100x100">text 2</p>\n  ');

    var element = container.firstChild;
    var plugins = [function (element, builder, _ref2) {
      var addMarkerable = _ref2.addMarkerable;
      var nodeFinished = _ref2.nodeFinished;

      if (element.nodeType === _mobiledocKitUtilsDomUtils.NODE_TYPES.TEXT) {
        if (element.textContent === 'text 1') {
          addMarkerable(builder.createMarker('oh my'));
        }
        nodeFinished();
      }
    }];
    parser = new _mobiledocKitParsersSection['default'](builder, { plugins: plugins });
    var sections = parser.parse(element);

    assert.equal(sections.length, 1, '1 section');
    assert.equal(sections[0].text, 'oh my');
  });

  test('#parse only runs text nodes through parserPlugins once', function (assert) {
    var container = buildDOM('text');
    var textNode = container.firstChild;

    assert.equal(textNode.nodeType, _mobiledocKitUtilsDomUtils.NODE_TYPES.TEXT);

    var pluginRunCount = 0;
    var plugins = [function (element) {
      if (element.nodeType === _mobiledocKitUtilsDomUtils.NODE_TYPES.TEXT && element.textContent === 'text') {
        pluginRunCount++;
      }
    }];
    parser = new _mobiledocKitParsersSection['default'](builder, { plugins: plugins });
    parser.parse(textNode);

    assert.equal(pluginRunCount, 1);
  });

  test('#parse ignores blank markup sections', function (assert) {
    var container = buildDOM('\n    <div><p>One</p><p></p><p>Three</p></div>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 2, 'Two sections');
    assert.equal(sections[0].text, 'One');
    assert.equal(sections[1].text, 'Three');
  });

  test('#parse handles section-level elements in list item', function (assert) {
    var container = buildDOM('\n    <ol><li>One</li><li><h4>Two</h4><p>Two - P</p></li><li>Three</li></ol>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 4, '4 sections');

    assert.equal(sections[0].type, 'list-section', 'first section type');
    assert.equal(sections[0].tagName, 'ol', 'first section tagName');
    assert.equal(sections[0].items.length, 1, '1 list item in first list section');
    assert.equal(sections[0].items.objectAt(0).text, 'One');

    assert.equal(sections[1].type, 'markup-section', 'second section type');
    assert.equal(sections[1].tagName, 'h4');
    assert.equal(sections[1].text, 'Two');

    assert.equal(sections[2].type, 'markup-section', 'third section type');
    assert.equal(sections[2].tagName, 'p');
    assert.equal(sections[2].text, 'Two - P');

    assert.equal(sections[3].type, 'list-section', 'fourth section type');
    assert.equal(sections[3].tagName, 'ol', 'fourth section tagName');
    assert.equal(sections[3].items.length, 1, '1 list item in last list section');
    assert.equal(sections[3].items.objectAt(0).text, 'Three');
  });

  test("#parse handles single paragraph in list item", function (assert) {
    var container = buildDOM('\n    <ul><li><p>One</p></li>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 1, "single list section");

    var list = sections[0];
    assert.equal(list.type, "list-section");
    assert.equal(list.items.length, 1, "1 list item");
    assert.equal(list.items.objectAt(0).text, "One");
  });

  test("#parse handles multiple paragraphs in list item", function (assert) {
    var container = buildDOM('\n    <ul><li><p>One</p><p>Two</p></li>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 2, '2 sections');

    var p1 = sections[0];
    assert.equal(p1.type, 'markup-section', 'first section type');
    assert.equal(p1.text, 'One');
    var p2 = sections[1];
    assert.equal(p2.type, "markup-section", "second section type");
    assert.equal(p2.text, "Two");
  });

  test("#parse handles multiple headers in list item", function (assert) {
    var container = buildDOM('\n    <ul><li><h1>One</h1><h2>Two</h2></li>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 2, '2 sections');

    var h1 = sections[0];
    assert.equal(h1.type, 'markup-section', 'first section type');
    assert.equal(h1.text, 'One');
    assert.equal(h1.tagName, 'h1');
    var h2 = sections[1];
    assert.equal(h2.type, 'markup-section', 'second section type');
    assert.equal(h2.text, 'Two');
    assert.equal(h2.tagName, 'h2');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/656
  test('#parse handles list following node handled by parserPlugin', function (assert) {
    var container = buildDOM('\n    <div><img src="https://placehold.it/100x100"><ul><li>LI One</li></ul></div>\n  ');

    var element = container.firstChild;
    var plugins = [function (element, builder, _ref3) {
      var addSection = _ref3.addSection;
      var nodeFinished = _ref3.nodeFinished;

      if (element.tagName !== 'IMG') {
        return;
      }
      var payload = { url: element.src };
      var cardSection = builder.createCardSection('test-image', payload);
      addSection(cardSection);
      nodeFinished();
    }];

    parser = new _mobiledocKitParsersSection['default'](builder, { plugins: plugins });
    var sections = parser.parse(element);

    assert.equal(sections.length, 2, '2 sections');

    var cardSection = sections[0];
    assert.equal(cardSection.name, 'test-image');
    assert.deepEqual(cardSection.payload, { url: 'https://placehold.it/100x100' });

    var listSection = sections[1];
    assert.equal(listSection.type, 'list-section');
    assert.equal(listSection.items.length, 1, '1 list item');
  });

  test('#parse handles insignificant whitespace', function (assert) {
    var container = buildDOM('\n    <ul>\n      <li>\n        One\n      </li>\n    </ul>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 1, '1 section');

    var _sections = _slicedToArray(sections, 1);

    var list = _sections[0];

    assert.equal(list.type, 'list-section');
    assert.equal(list.items.length, 1, '1 list item');
    assert.equal(list.items.objectAt(0).text, 'One');
  });

  test('#parse handles insignificant whitespace (wrapped)', function (assert) {
    var container = buildDOM('\n    <div>\n      <ul>\n        <li>\n          One\n        </li>\n      </ul>\n    </div>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 1, '1 section');

    var _sections2 = _slicedToArray(sections, 1);

    var list = _sections2[0];

    assert.equal(list.type, 'list-section');
    assert.equal(list.items.length, 1, '1 list item');
    assert.equal(list.items.objectAt(0).text, 'One');
  });

  test('#parse avoids empty paragraph around wrapped list', function (assert) {
    var container = buildDOM('\n    <div><ul><li>One</li></ul></div>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 1, 'single list section');
  });

  test('#parse handles nested lists of different types', function (assert) {
    var container = buildDOM('\n    <ol><li>One</li><li><ul><li>A</li><li>B</li></ul><li>Two</li></ol>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 3, '3 sections');

    assert.equal(sections[0].type, 'list-section', 'first section type');
    assert.equal(sections[0].tagName, 'ol', 'first section tagName');
    assert.equal(sections[0].items.length, 1, '1 list item in first list section');
    assert.equal(sections[0].items.objectAt(0).text, 'One');

    assert.equal(sections[1].type, 'list-section', 'second section type');
    assert.equal(sections[1].tagName, 'ul', 'fourth section tagName');
    assert.equal(sections[1].items.length, 2, '2 list items in second list section');
    assert.equal(sections[1].items.objectAt(0).text, 'A');
    assert.equal(sections[1].items.objectAt(1).text, 'B');

    assert.equal(sections[2].type, 'list-section', 'third section type');
    assert.equal(sections[2].tagName, 'ol', 'third section tagName');
    assert.equal(sections[2].items.length, 1, '1 list item in third list section');
    assert.equal(sections[2].items.objectAt(0).text, 'Two');
  });

  test('#parse handles grouping nested lists', function (assert) {
    var container = buildDOM('\n    <div><ul><li>Outer-One<ul><li>Inner-Two</li><li>Inner-Three</li></ul></li><li>Outer-Four</li></ul></div>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 1, 'single list section');

    var list = sections[0];
    assert.equal(list.type, 'list-section');
    assert.equal(list.items.length, 4, '4 list items');
    assert.equal(list.items.objectAt(0).text, 'Outer-One');
    assert.equal(list.items.objectAt(1).text, 'Inner-Two');
    assert.equal(list.items.objectAt(2).text, 'Inner-Three');
    assert.equal(list.items.objectAt(3).text, 'Outer-Four');
  });

  test('#parse handles grouping of consecutive lists of same type', function (assert) {
    var container = buildDOM('\n    <div><ul><li>One</li></ul><ul><li>Two</li></ul>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 1, 'single list section');
    var list = sections[0];
    assert.equal(list.items.objectAt(0).text, 'One');
    assert.equal(list.items.objectAt(1).text, 'Two');
  });

  test('#parse doesn\'t group consecutive lists of different types', function (assert) {
    var container = buildDOM('\n    <div><ul><li>One</li></ul><ol><li>Two</li></ol>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 2, 'two list sections');
    var ul = sections[0];
    assert.equal(ul.items.objectAt(0).text, 'One');
    var ol = sections[1];
    assert.equal(ol.items.objectAt(0).text, 'Two');
  });

  test('#parse handles p following list', function (assert) {
    var container = buildDOM('\n    <div><ol><li>li1</li><li>li2</li><p>para</p></div>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 2, 'two sections');

    var ol = sections[0];
    assert.equal(ol.items.length, 2, 'two list items');

    var p = sections[1];
    assert.equal(p.text, 'para');
  });

  test('#parse handles link in a heading followed by paragraph', function (assert) {
    var container = buildDOM('\n    <div><h4><a href="https://example.com">Linked header</a></h4><p>test</p></div>\n  ');

    var element = container.firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 2, '2 sections');
    assert.equal(sections[0].text, 'Linked header');

    var markers = sections[0].markers.toArray();
    assert.equal(markers.length, 1, '1 marker');

    var _markers = _slicedToArray(markers, 1);

    var marker = _markers[0];

    assert.equal(marker.value, 'Linked header');
    assert.ok(marker.hasMarkup('a'), 'has A markup');

    var markup = marker.markups[0];
    assert.equal(markup.getAttribute('href'), 'https://example.com');
  });

  test('#parse skips STYLE nodes', function (assert) {
    var element = buildDOM('\n    <style>.rule { font-color: red; }</style>\n  ').firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 0, 'does not parse style');
  });

  test('#parse skips top-level Comment nodes', function (assert) {
    var element = buildDOM('\n    <!--Some comment-->\n  ').firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 0, 'does not parse comments');
  });

  test('#parse skips nested Comment nodes', function (assert) {
    var element = buildDOM('\n   <p><!--Some comment-->some text<!-- another comment --></p>\n  ').firstChild;
    parser = new _mobiledocKitParsersSection['default'](builder);
    var sections = parser.parse(element);

    assert.equal(sections.length, 1);
    var section = sections[0];
    assert.equal(section.text, 'some text', 'parses text surrounded by comments');
    assert.equal(section.markers.length, 1, 'only 1 marker');
  });

  // https://github.com/bustle/mobiledoc-kit/issues/683
  test('#parse handles card-creating element after plain text', function (assert) {
    var container = buildDOM('\n    <div><p>Before<a href="https:/example.com/image.png"><img src="https://example.com/image.png"></a></p><p>After</p></div>\n  ');

    var element = container.firstChild;
    var plugins = [function (element, builder, _ref4) {
      var addSection = _ref4.addSection;
      var nodeFinished = _ref4.nodeFinished;

      if (element.tagName !== 'IMG') {
        return;
      }
      var payload = { url: element.src };
      var cardSection = builder.createCardSection('test-image', payload);
      addSection(cardSection);
      nodeFinished();
    }];
    parser = new _mobiledocKitParsersSection['default'](builder, { plugins: plugins });
    var sections = parser.parse(element);

    assert.equal(sections.length, 3, '3 sections');
    assert.equal(sections[0].text.trim(), 'Before');
    assert.equal(sections[1].type, 'card-section');
    assert.equal(sections[2].text.trim(), 'After');
  });
});
define('tests/unit/parsers/text-test', ['exports', 'mobiledoc-kit/parsers/text', 'mobiledoc-kit/models/post-node-builder', '../../test-helpers'], function (exports, _mobiledocKitParsersText, _mobiledocKitModelsPostNodeBuilder, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var parser = undefined;

  _module('Unit: Parser: TextParser', {
    beforeEach: function beforeEach() {
      var builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      parser = new _mobiledocKitParsersText['default'](builder);
    },
    afterEach: function afterEach() {
      parser = null;
    }
  });

  test('#parse returns a markup section when given single line of text', function (assert) {
    var text = 'some text';
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('some text')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse returns multiple markup sections when given multiple lines', function (assert) {
    var text = ['first', 'second', 'third'].join(_mobiledocKitParsersText.SECTION_BREAK);
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      return post([markupSection('p', [marker('first')]), markupSection('p', [marker('second')]), markupSection('p', [marker('third')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse returns multiple sections when lines are separated by CR+LF', function (assert) {
    var text = ['first', 'second', 'third'].join('\r\n');
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      return post([markupSection('p', [marker('first')]), markupSection('p', [marker('second')]), markupSection('p', [marker('third')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse returns multiple sections when lines are separated by CR', function (assert) {
    var text = ['first', 'second', 'third'].join('\r');
    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      return post([markupSection('p', [marker('first')]), markupSection('p', [marker('second')]), markupSection('p', [marker('third')])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse returns list section when text starts with "*"', function (assert) {
    var text = '* a list item';

    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var post = _ref5.post;
      var listSection = _ref5.listSection;
      var listItem = _ref5.listItem;
      var marker = _ref5.marker;

      return post([listSection('ul', [listItem([marker('a list item')])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse returns list section with multiple items when text starts with "*"', function (assert) {
    var text = ['* first', '* second'].join(_mobiledocKitParsersText.SECTION_BREAK);

    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var listSection = _ref6.listSection;
      var listItem = _ref6.listItem;
      var marker = _ref6.marker;

      return post([listSection('ul', [listItem([marker('first')]), listItem([marker('second')])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse returns list sections separated by markup sections', function (assert) {
    var text = ['* first list', 'middle section', '* second list'].join(_mobiledocKitParsersText.SECTION_BREAK);

    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref7) {
      var post = _ref7.post;
      var listSection = _ref7.listSection;
      var listItem = _ref7.listItem;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      return post([listSection('ul', [listItem([marker('first list')])]), markupSection('p', [marker('middle section')]), listSection('ul', [listItem([marker('second list')])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse returns ordered list items', function (assert) {
    var text = '1. first list';

    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref8) {
      var post = _ref8.post;
      var listSection = _ref8.listSection;
      var listItem = _ref8.listItem;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;

      return post([listSection('ol', [listItem([marker('first list')])])]);
    });

    assert.postIsSimilar(post, expected);
  });

  test('#parse can have ordered and unordered lists together', function (assert) {
    var text = ['1. ordered list', '* unordered list'].join(_mobiledocKitParsersText.SECTION_BREAK);

    var post = parser.parse(text);
    var expected = _testHelpers['default'].postAbstract.build(function (_ref9) {
      var post = _ref9.post;
      var listSection = _ref9.listSection;
      var listItem = _ref9.listItem;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      return post([listSection('ol', [listItem([marker('ordered list')])]), listSection('ul', [listItem([marker('unordered list')])])]);
    });

    assert.postIsSimilar(post, expected);
  });
});
define('tests/unit/renderers/editor-dom-test', ['exports', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/models/render-tree', '../../test-helpers', 'mobiledoc-kit/utils/characters', 'mobiledoc-kit/utils/placeholder-image-src'], function (exports, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitRenderersEditorDom, _mobiledocKitModelsRenderTree, _testHelpers, _mobiledocKitUtilsCharacters, _mobiledocKitUtilsPlaceholderImageSrc) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var builder = undefined;

  var renderer = undefined;
  function render(renderTree) {
    var cards = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var atoms = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

    var editor = {};
    renderer = new _mobiledocKitRenderersEditorDom['default'](editor, cards, atoms);
    return renderer.render(renderTree);
  }

  var editor = undefined,
      editorElement = undefined;
  _module('Unit: Renderer: Editor-Dom', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (renderer) {
        renderer.destroy();
        renderer = null;
      }
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test("renders a dirty post", function (assert) {
    /*
     * renderTree is:
     *
     * renderNode
     *
     */
    var renderTree = new _mobiledocKitModelsRenderTree['default'](builder.createPost());
    render(renderTree);

    assert.ok(renderTree.rootElement, 'renderTree renders element for post');
    assert.ok(!renderTree.rootNode.isDirty, 'dirty node becomes clean');
    assert.equal(renderTree.rootElement.tagName, 'DIV', 'renderTree renders element for post');
  });

  test("renders a dirty post with un-rendered sections", function (assert) {
    var post = builder.createPost();
    var sectionA = builder.createMarkupSection('P');
    post.sections.append(sectionA);
    var sectionB = builder.createMarkupSection('P');
    post.sections.append(sectionB);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><br></p><p><br></p>', 'correct HTML is rendered');

    assert.ok(renderTree.rootNode.childNodes.head, 'sectionA creates a first child');
    assert.equal(renderTree.rootNode.childNodes.head.postNode, sectionA, 'sectionA is first renderNode child');
    assert.ok(!renderTree.rootNode.childNodes.head.isDirty, 'sectionA node is clean');
    assert.equal(renderTree.rootNode.childNodes.tail.postNode, sectionB, 'sectionB is second renderNode child');
    assert.ok(!renderTree.rootNode.childNodes.tail.isDirty, 'sectionB node is clean');
  });

  [{
    name: 'markup',
    section: function section(builder) {
      return builder.createMarkupSection('P');
    }
  }, {
    name: 'image',
    section: function section(builder) {
      return builder.createImageSection(_mobiledocKitUtilsPlaceholderImageSrc['default']);
    }
  }, {
    name: 'card',
    section: function section(builder) {
      return builder.createCardSection('new-card');
    }
  }, {
    name: 'list-section',
    section: function section(builder) {
      return builder.createListSection('ul', [builder.createListItem([builder.createMarker('item')])]);
    }
  }].forEach(function (testInfo) {
    test('removes nodes with ' + testInfo.name + ' section', function (assert) {
      var post = builder.createPost();
      var section = testInfo.section(builder);
      post.sections.append(section);

      var postElement = document.createElement('div');
      var sectionElement = document.createElement('p');
      postElement.appendChild(sectionElement);

      var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
      var postRenderNode = renderTree.rootNode;
      postRenderNode.element = postElement;

      var sectionRenderNode = renderTree.buildRenderNode(section);
      sectionRenderNode.element = sectionElement;
      sectionRenderNode.scheduleForRemoval();
      postRenderNode.childNodes.append(sectionRenderNode);

      render(renderTree);

      assert.equal(renderTree.rootElement, postElement, 'post element remains');

      assert.equal(renderTree.rootElement.firstChild, null, 'section element removed');

      assert.equal(renderTree.rootNode.childNodes.length, 0, 'section renderNode is removed');
    });
  });

  test('renders a post with marker', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('P');
    post.sections.append(section);
    section.markers.append(builder.createMarker('Hi', [builder.createMarkup('STRONG')]));

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);
    assert.equal(renderTree.rootElement.innerHTML, '<p><strong>Hi</strong></p>');
  });

  test('renders a post with marker with a tab', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('a' + _mobiledocKitUtilsCharacters.TAB + 'b')])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);
    assert.equal(renderTree.rootElement.innerHTML, '<p>a b</p>', 'HTML for a tab character is correct');
  });

  test('renders a post with markup empty section', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('P');
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);
    assert.equal(renderTree.rootElement.innerHTML, '<p><br></p>');
  });

  test('renders a post with multiple markers', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('P');
    post.sections.append(section);

    var b = builder.createMarkup('B');
    var i = builder.createMarkup('I');

    section.markers.append(builder.createMarker('hello '));
    section.markers.append(builder.createMarker('bold, ', [b]));
    section.markers.append(builder.createMarker('italic,', [b, i]));
    section.markers.append(builder.createMarker(' world.'));

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);
    assert.equal(renderTree.rootElement.innerHTML, '<p>hello <b>bold, <i>italic,</i></b> world.</p>');
  });

  test('renders a post with marker with link markup', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('P');
    post.sections.append(section);

    var href = 'http://google.com';
    var rel = 'nofollow';
    var linkMarkup = builder.createMarkup('A', { href: href, rel: rel });

    section.markers.append(builder.createMarker('hello', [linkMarkup]));

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);
    var html = renderTree.rootElement.innerHTML;

    assert.ok(html.match(/<p><a .*>hello<\/a><\/p>/), 'a tag present');
    assert.ok(html.match(new RegExp('href="' + href + '"')), 'href present');
    assert.ok(html.match(new RegExp('rel="' + rel + '"')), 'rel present');
  });

  test('renders a post with image', function (assert) {
    var url = _mobiledocKitUtilsPlaceholderImageSrc['default'];
    var post = builder.createPost();
    var section = builder.createImageSection(url);
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);
    assert.equal(renderTree.rootElement.innerHTML, '<img src="' + url + '">');
  });

  test('renders a post with atom', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var markupSection = _ref2.markupSection;
      var post = _ref2.post;
      var atom = _ref2.atom;

      return post([markupSection('p', [atom('mention', '@bob', {})])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree, [], [{
      name: 'mention',
      type: 'dom',
      render: function render(_ref3) /*, options, env, payload*/{
        var value = _ref3.value;

        return document.createTextNode(value);
      }
    }]);
    assert.equal(renderTree.rootElement.innerHTML, '<p><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">@bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></p>');
  });

  test('rerenders an atom with markup correctly when adjacent nodes change', function (assert) {
    var bold = undefined,
        italic = undefined,
        marker1 = undefined,
        marker2 = undefined,
        atom1 = undefined,
        markupSection1 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var markupSection = _ref4.markupSection;
      var post = _ref4.post;
      var atom = _ref4.atom;
      var marker = _ref4.marker;
      var markup = _ref4.markup;

      bold = markup('b');
      italic = markup('em');
      marker1 = marker('abc');
      atom1 = atom('mention', 'bob', {}, [bold]);
      marker2 = marker('def');
      markupSection1 = markupSection('p', [marker1, atom1, marker2]);
      return post([markupSection1]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    var cards = [],
        atoms = [{
      name: 'mention',
      type: 'dom',
      render: function render(_ref5) /*, options, env, payload*/{
        var value = _ref5.value;

        return document.createTextNode(value);
      }
    }];
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p>abc<b><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></b>def</p>', 'initial render correct');

    marker1.value = 'ABC';
    marker1.renderNode.markDirty();

    // rerender
    render(renderTree, cards, atoms);

    assert.equal(renderTree.rootElement.innerHTML, '<p>ABC<b><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></b>def</p>', 'rerender is correct');

    atom1.removeMarkup(bold);
    atom1.renderNode.markDirty();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p>ABC<span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span>def</p>', 'rerender is correct');

    marker2.renderNode.scheduleForRemoval();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p>ABC<span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></p>', 'rerender is correct');

    marker1.addMarkup(bold);
    marker1.renderNode.markDirty();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><b>ABC</b><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></p>', 'rerender is correct');

    marker1.renderNode.scheduleForRemoval();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></p>', 'rerender is correct');

    atom1.renderNode.scheduleForRemoval();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><br></p>', 'rerender is correct');

    var newAtom = builder.createAtom('mention', 'bob2', {}, [bold, italic]);
    markupSection1.markers.append(newAtom);
    markupSection1.renderNode.markDirty();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><b><em><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob2</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></em></b></p>', 'rerender is correct');

    var newMarker = builder.createMarker('pre', [bold, italic]);
    markupSection1.markers.insertBefore(newMarker, newAtom);
    markupSection1.renderNode.markDirty();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><b><em>pre<span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob2</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></em></b></p>', 'rerender is correct');

    newMarker = builder.createMarker('post', [bold, italic]);
    markupSection1.markers.append(newMarker);
    markupSection1.renderNode.markDirty();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><b><em>pre<span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob2</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span>post</em></b></p>', 'rerender is correct');

    newAtom.removeMarkup(bold);
    newAtom.renderNode.markDirty();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><b><em>pre</em></b><em><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">bob2</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></em><b><em>post</em></b></p>', 'rerender is correct');

    newAtom.renderNode.scheduleForRemoval();

    // rerender
    render(renderTree, cards, atoms);
    assert.equal(renderTree.rootElement.innerHTML, '<p><b><em>prepost</em></b></p>', 'rerender is correct');
  });

  test('renders a post with atom with markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var markupSection = _ref6.markupSection;
      var post = _ref6.post;
      var atom = _ref6.atom;
      var marker = _ref6.marker;
      var markup = _ref6.markup;

      var b = markup('B');
      var i = markup('I');

      return post([markupSection('p', [atom('mention', '@bob', {}, [b, i])])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree, [], [{
      name: 'mention',
      type: 'dom',
      render: function render(_ref7) /*, options, env, payload*/{
        var fragment = _ref7.fragment;
        var value = _ref7.value;

        return document.createTextNode(value);
      }
    }]);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b><i><span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">@bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></i></b></p>');
  });

  test('renders a post with mixed markups and atoms', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref8) {
      var markupSection = _ref8.markupSection;
      var post = _ref8.post;
      var atom = _ref8.atom;
      var marker = _ref8.marker;
      var markup = _ref8.markup;

      var b = markup('B');
      var i = markup('I');

      return post([markupSection('p', [marker('bold', [b]), marker('italic ', [b, i]), atom('mention', '@bob', {}, [b, i]), marker(' bold', [b]), builder.createMarker('text.')])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree, [], [{
      name: 'mention',
      type: 'dom',
      render: function render(_ref9) /*, options, env, payload*/{
        var fragment = _ref9.fragment;
        var value = _ref9.value;

        return document.createTextNode(value);
      }
    }]);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b>bold<i>italic <span class="-mobiledoc-kit__atom">' + _mobiledocKitRenderersEditorDom.ZWNJ + '<span contenteditable="false">@bob</span>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</span></i> bold</b>text.</p>');
  });

  test('renders a card section', function (assert) {
    var post = builder.createPost();
    var cardSection = builder.createCardSection('my-card');
    var card = {
      name: 'my-card',
      type: 'dom',
      render: function render() {
        return document.createTextNode('I am a card');
      }
    };
    post.sections.append(cardSection);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree, [card]);

    // Use a wrapper an innerHTML to satisfy different browser attribute
    // ordering quirks
    var expectedWrapper = $('<div>' + _mobiledocKitRenderersEditorDom.ZWNJ + '<div contenteditable="false" class="__mobiledoc-card">I am a card</div>' + _mobiledocKitRenderersEditorDom.ZWNJ + '</div>');
    assert.equal(renderTree.rootElement.firstChild.innerHTML, expectedWrapper.html(), 'card is rendered');
  });

  test('rerender a marker after adding a markup to it', function (assert) {
    var bold = undefined,
        marker2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref10) {
      var post = _ref10.post;
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;
      var markup = _ref10.markup;

      bold = markup('B');
      marker2 = marker('text2');
      return post([markupSection('p', [marker('text1', [bold]), marker2])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b>text1</b>text2</p>');

    marker2.addMarkup(bold);
    marker2.renderNode.markDirty();

    // rerender
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b>text1text2</b></p>');
  });

  test('rerender a marker after removing a markup from it', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('p');
    var bMarkup = builder.createMarkup('B');
    var marker1 = builder.createMarker('text1');
    var marker2 = builder.createMarker('text2', [bMarkup]);

    section.markers.append(marker1);
    section.markers.append(marker2);
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p>text1<b>text2</b></p>');

    marker2.removeMarkup(bMarkup);
    marker2.renderNode.markDirty();

    // rerender
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p>text1text2</p>');
  });

  test('rerender a marker after removing a markup from it (when changed marker is first marker)', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('p');
    var bMarkup = builder.createMarkup('B');
    var marker1 = builder.createMarker('text1', [bMarkup]);
    var marker2 = builder.createMarker('text2');

    section.markers.append(marker1);
    section.markers.append(marker2);
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b>text1</b>text2</p>');

    marker1.removeMarkup(bMarkup);
    marker1.renderNode.markDirty();

    // rerender
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p>text1text2</p>');
  });

  test('rerender a marker after removing a markup from it (when both markers have same markup)', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('p');
    var bMarkup = builder.createMarkup('B');
    var marker1 = builder.createMarker('text1', [bMarkup]);
    var marker2 = builder.createMarker('text2', [bMarkup]);

    section.markers.append(marker1);
    section.markers.append(marker2);
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b>text1text2</b></p>');

    marker1.removeMarkup(bMarkup);
    marker1.renderNode.markDirty();

    // rerender
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p>text1<b>text2</b></p>');
  });

  test('rerender a marker after removing a markup from it (when both markers have same markup)', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('p');
    var bMarkup = builder.createMarkup('B');
    var marker1 = builder.createMarker('text1', [bMarkup]);
    var marker2 = builder.createMarker('text2', [bMarkup]);

    section.markers.append(marker1);
    section.markers.append(marker2);
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b>text1text2</b></p>');

    marker1.removeMarkup(bMarkup);
    marker1.renderNode.markDirty();

    // rerender
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p>text1<b>text2</b></p>');
  });

  test('render when contiguous markers have out-of-order markups', function (assert) {
    var post = builder.createPost();
    var section = builder.createMarkupSection('p');

    var b = builder.createMarkup('B'),
        i = builder.createMarkup('I');

    var markers = [builder.createMarker('BI', [b, i]), builder.createMarker('IB', [i, b]), builder.createMarker('plain', [])];
    var m1 = markers[0];

    markers.forEach(function (m) {
      return section.markers.append(m);
    });
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><b><i>BI</i></b><i><b>IB</b></i>plain</p>');

    // remove 'b' from 1st marker, rerender
    m1.removeMarkup(b);
    m1.renderNode.markDirty();
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><i>BI<b>IB</b></i>plain</p>');
  });

  test('contiguous markers have overlapping markups', function (assert) {
    var b = builder.createMarkup('b'),
        i = builder.createMarkup('i');
    var post = builder.createPost();
    var markers = [builder.createMarker('W', [i]), builder.createMarker('XY', [i, b]), builder.createMarker('Z', [b])];
    var section = builder.createMarkupSection('P', markers);
    post.sections.append(section);

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, '<p><i>W<b>XY</b></i><b>Z</b></p>');
  });

  test('renders and rerenders list items', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref11) {
      var post = _ref11.post;
      var listSection = _ref11.listSection;
      var listItem = _ref11.listItem;
      var marker = _ref11.marker;
      return post([listSection('ul', [listItem([marker('first item')]), listItem([marker('second item')])])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('ul', {}, [t('li', {}, [t.text('first item')]), t('li', {}, [t.text('second item')])]);
    });
    var expectedHTML = expectedDOM.outerHTML;

    assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'correct html on initial render');

    // test rerender after dirtying list section
    var listSection = post.sections.head;
    listSection.renderNode.markDirty();
    render(renderTree);
    assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'correct html on rerender after dirtying list-section');

    // test rerender after dirtying list item
    var listItem = post.sections.head.items.head;
    listItem.renderNode.markDirty();
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'correct html on rerender after diryting list-item');
  });

  test('removes list items', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref12) {
      var post = _ref12.post;
      var listSection = _ref12.listSection;
      var listItem = _ref12.listItem;
      var marker = _ref12.marker;
      return post([listSection('ul', [listItem([marker('first item')]), listItem([marker('second item')]), listItem([marker('third item')])])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    // return HTML for a list with the given items
    var htmlWithItems = function htmlWithItems(itemTexts) {
      var expectedDOM = _testHelpers['default'].dom.build(function (t) {
        return t('ul', {}, itemTexts.map(function (text) {
          return t('li', {}, [t.text(text)]);
        }));
      });
      return expectedDOM.outerHTML;
    };

    var listItem2 = post.sections.head. // listSection
    items.objectAt(1); // li
    listItem2.renderNode.scheduleForRemoval();
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, htmlWithItems(['first item', 'third item']), 'removes middle list item');

    var listItemLast = post.sections.head. // listSection
    items.tail;
    listItemLast.renderNode.scheduleForRemoval();
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, htmlWithItems(['first item']), 'removes last list item');
  });

  test('removes list sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref13) {
      var post = _ref13.post;
      var listSection = _ref13.listSection;
      var markupSection = _ref13.markupSection;
      var listItem = _ref13.listItem;
      var marker = _ref13.marker;
      return post([markupSection('p', [marker('something')]), listSection('ul', [listItem([marker('first item')])])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('p', {}, [t.text('something')]);
    });
    var expectedHTML = expectedDOM.outerHTML;

    var listSection = post.sections.objectAt(1);
    listSection.renderNode.scheduleForRemoval();
    render(renderTree);

    assert.equal(renderTree.rootElement.innerHTML, expectedHTML, 'removes list section');
  });

  test('includes card sections in renderTree element map', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref14) {
      var post = _ref14.post;
      var cardSection = _ref14.cardSection;
      return post([cardSection('simple-card')]);
    });
    var cards = [{
      name: 'simple-card',
      type: 'dom',
      render: function render() {
        return $('<div id="simple-card"></div>')[0];
      }
    }];

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree, cards);

    $('#qunit-fixture').append(renderTree.rootElement);

    var element = $('#simple-card')[0].parentNode.parentNode;
    assert.ok(!!element, 'precond - simple card is rendered');
    assert.ok(!!renderTree.getElementRenderNode(element), 'has render node for card element');
  });

  test('removes nested children of removed render nodes', function (assert) {
    var section = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref15) {
      var post = _ref15.post;
      var markupSection = _ref15.markupSection;
      var marker = _ref15.marker;

      section = markupSection('p', [marker('abc')]);
      return post([section]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var marker = section.markers.head;
    assert.ok(!!section.renderNode, 'precond - section has render node');
    assert.ok(!!marker.renderNode, 'precond - marker has render node');

    section.renderNode.scheduleForRemoval();
    render(renderTree);

    assert.ok(!marker.renderNode.parent, 'marker render node is orphaned');
    assert.ok(!marker.renderNode.element, 'marker render node has no element');
    assert.equal(section.renderNode.childNodes.length, 0, 'section render node has all children removed');
  });

  test('renders markup section "aside" as <aside></aside>', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref16) {
      var post = _ref16.post;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;

      return post([markupSection('aside', [marker('abc')])]);
    });
    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('aside', {}, [t.text('abc')]);
    });

    assert.equal(renderTree.rootElement.innerHTML, expectedDOM.outerHTML);
  });

  test('renders characters and spaces with nbsps', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var marker = _ref17.marker;

      return post([markupSection('p', [marker('a b  c    d ')])]);
    });
    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('p', {}, [t.text('a b ' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + 'c ' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + ' ' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + 'd' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE)]);
    });

    assert.equal(renderTree.rootElement.innerHTML, expectedDOM.outerHTML);
  });

  test('renders all spaces with nbsps', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref18) {
      var post = _ref18.post;
      var markupSection = _ref18.markupSection;
      var marker = _ref18.marker;

      return post([markupSection('p', [marker('   ')])]);
    });
    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('p', {}, [t.text('' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE)]);
    });

    assert.equal(renderTree.rootElement.innerHTML, expectedDOM.outerHTML);
  });

  test('renders leading space with nbsp', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref19) {
      var post = _ref19.post;
      var markupSection = _ref19.markupSection;
      var marker = _ref19.marker;

      return post([markupSection('p', [marker(' a')])]);
    });
    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('p', {}, [t.text(_mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + 'a')]);
    });

    assert.equal(renderTree.rootElement.innerHTML, expectedDOM.outerHTML);
  });

  test('renders trailing space with nbsp', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref20) {
      var post = _ref20.post;
      var markupSection = _ref20.markupSection;
      var marker = _ref20.marker;

      return post([markupSection('p', [marker('a ')])]);
    });
    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('p', {}, [t.text('a' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE)]);
    });

    assert.equal(renderTree.rootElement.innerHTML, expectedDOM.outerHTML);
  });

  test('renders leading and trailing space with nbsp', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref21) {
      var post = _ref21.post;
      var markupSection = _ref21.markupSection;
      var marker = _ref21.marker;

      return post([markupSection('p', [marker(' a ')])]);
    });
    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var expectedDOM = _testHelpers['default'].dom.build(function (t) {
      return t('p', {}, [t.text(_mobiledocKitRenderersEditorDom.NO_BREAK_SPACE + 'a' + _mobiledocKitRenderersEditorDom.NO_BREAK_SPACE)]);
    });

    assert.equal(renderTree.rootElement.innerHTML, expectedDOM.outerHTML);
  });

  test('#destroy is safe to call if renderer has not rendered', function (assert) {
    var mockEditor = {},
        cards = [];
    var renderer = new _mobiledocKitRenderersEditorDom['default'](mockEditor, cards);

    assert.ok(!renderer.hasRendered, 'precond - has not rendered');

    renderer.destroy();

    assert.ok(true, 'ok to destroy');
  });

  // see https://github.com/bustle/mobiledoc-kit/issues/306
  test('rerender after adding markup to a marker when the marker siblings have that markup', function (assert) {
    var strong = undefined,
        expected = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref22) {
      var post = _ref22.post;
      var markupSection = _ref22.markupSection;
      var marker = _ref22.marker;
      var markup = _ref22.markup;

      strong = markup('strong');
      expected = post([markupSection('p', [marker('aXc', [strong])])]);
      return post([markupSection('p', [marker('a', [strong]), marker('X'), marker('c', [strong])])]);
    });

    var renderTree = new _mobiledocKitModelsRenderTree['default'](post);
    render(renderTree);

    var markers = post.sections.head.markers.toArray();
    assert.equal(markers.length, 3);

    // step 1: add markup to the marker
    markers[1].addMarkup(strong);

    // step 2, join the markers
    markers[1].value = 'aX';
    markers[1].renderNode.markDirty();
    markers[0].renderNode.scheduleForRemoval();
    markers[0].section.markers.remove(markers[0]);

    markers[2].value = 'aXc';
    markers[2].renderNode.markDirty();
    markers[1].renderNode.scheduleForRemoval();
    markers[1].section.markers.remove(markers[1]);

    render(renderTree);

    assert.renderTreeIsEqual(renderTree, expected);

    markers = post.sections.head.markers.toArray();
    assert.equal(markers.length, 1);
    assert.ok(markers[0].hasMarkup(strong), 'marker has strong');
    assert.equal(markers[0].value, 'aXc');
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
});
define('tests/unit/renderers/mobiledoc-test', ['exports', 'mobiledoc-kit/renderers/mobiledoc', '../../test-helpers'], function (exports, _mobiledocKitRenderersMobiledoc, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  function render(post) {
    return _mobiledocKitRenderersMobiledoc['default'].render(post);
  }

  _module('Unit: Mobiledoc Renderer');

  test('renders a blank post', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      return post();
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: []
    });
  });
});
define('tests/unit/renderers/mobiledoc/0-2-test', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-2', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/utils/dom-utils', '../../../test-helpers'], function (exports, _mobiledocKitRenderersMobiledoc02, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitUtilsDomUtils, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  function render(post) {
    return _mobiledocKitRenderersMobiledoc02['default'].render(post);
  }
  var builder = undefined;

  _module('Unit: Mobiledoc Renderer 0.2', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    }
  });

  test('renders a blank post', function (assert) {
    var post = builder.createPost();
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], []]
    });
  });

  test('renders a post with marker', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      var markup = _ref.markup;

      return post([markupSection('p', [marker('Hi', [markup('strong')])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[['strong']], [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[[0], 1, 'Hi']]]]]
    });
  });

  test('renders a post section with markers sharing a markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;
      var markup = _ref2.markup;

      var strong = markup('strong');
      return post([markupSection('p', [marker('Hi', [strong]), marker(' Guy', [strong])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[['strong']], [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[[0], 0, 'Hi'], [[], 1, ' Guy']]]]]
    });
  });

  test('renders a post with markers with markers with complex attributes', function (assert) {
    var link1 = undefined,
        link2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;
      var markup = _ref3.markup;

      link1 = markup('a', { href: 'bustle.com' });
      link2 = markup('a', { href: 'other.com' });
      return post([markupSection('p', [marker('Hi', [link1]), marker(' Guy', [link2]), marker(' other guy', [link1])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[['a', ['href', 'bustle.com']], ['a', ['href', 'other.com']]], [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[[0], 1, 'Hi'], [[1], 1, ' Guy'], [[0], 1, ' other guy']]]]]
    });
  });

  test('renders a post with image', function (assert) {
    var url = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
    var post = builder.createPost();
    var section = builder.createImageSection(url);
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[2, url]]]
    });
  });

  test('renders a post with image and null src', function (assert) {
    var post = builder.createPost();
    var section = builder.createImageSection();
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[2, null]]]
    });
  });

  test('renders a post with card', function (assert) {
    var cardName = 'super-card';
    var payload = { bar: 'baz' };
    var post = builder.createPost();
    var section = builder.createCardSection(cardName, payload);
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[10, cardName, payload]]]
    });
  });

  test('renders a post with a list', function (assert) {
    var items = [builder.createListItem([builder.createMarker('first item')]), builder.createListItem([builder.createMarker('second item')])];
    var section = builder.createListSection('ul', items);
    var post = builder.createPost([section]);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[3, 'ul', [[[[], 0, 'first item']], [[[], 0, 'second item']]]]]]
    });
  });

  test('renders an aside as markup section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;

      return post([markupSection('aside', [marker('abc')])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc02.MOBILEDOC_VERSION,
      sections: [[], [[1, 'aside', [[[], 0, 'abc']]]]]
    });
  });
});
define('tests/unit/renderers/mobiledoc/0-3-2-test', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-3-2', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/utils/dom-utils', '../../../test-helpers'], function (exports, _mobiledocKitRenderersMobiledoc032, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitUtilsDomUtils, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  function render(post) {
    return _mobiledocKitRenderersMobiledoc032['default'].render(post);
  }
  var builder = undefined;

  _module('Unit: Mobiledoc Renderer 0.3.2', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    }
  });

  test('renders a blank post', function (assert) {
    var post = builder.createPost();
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: []
    });
  });

  test('renders a post with marker', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      var markup = _ref.markup;

      return post([markupSection('p', [marker('Hi', [markup('strong')])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 1, 'Hi']], []]]
    });
  });

  test('renders a post section with markers sharing a markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;
      var markup = _ref2.markup;

      var strong = markup('strong');
      return post([markupSection('p', [marker('Hi', [strong]), marker(' Guy', [strong])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 0, 'Hi'], [0, [], 1, ' Guy']], []]]
    });
  });

  test('renders a post with markers with markers with complex attributes', function (assert) {
    var link1 = undefined,
        link2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;
      var markup = _ref3.markup;

      link1 = markup('a', { href: 'bustle.com' });
      link2 = markup('a', { href: 'other.com' });
      return post([markupSection('p', [marker('Hi', [link1]), marker(' Guy', [link2]), marker(' other guy', [link1])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['a', ['href', 'bustle.com']], ['a', ['href', 'other.com']]],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 1, 'Hi'], [0, [1], 1, ' Guy'], [0, [0], 1, ' other guy']], []]]
    });
  });

  test('renders a post with image', function (assert) {
    var url = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
    var post = builder.createPost();
    var section = builder.createImageSection(url);
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[2, url]]
    });
  });

  test('renders a post with image and null src', function (assert) {
    var post = builder.createPost();
    var section = builder.createImageSection();
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[2, null]]
    });
  });

  test('renders a post with atom', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;
      var atom = _ref4.atom;

      return post([markupSection('p', [marker('Hi'), atom('mention', '@bob', { id: 42 })])]);
    });

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [], 0, 'Hi'], [1, [], 0, 0]], []]]
    });
  });

  test('renders a post with atom and markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;
      var markup = _ref5.markup;
      var atom = _ref5.atom;

      var strong = markup('strong');
      return post([markupSection('p', [atom('mention', '@bob', { id: 42 }, [strong])])]);
    });

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[1, [0], 1, 0]], []]]
    });
  });

  test('renders a post with atom inside markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;
      var markup = _ref6.markup;
      var atom = _ref6.atom;

      var strong = markup('strong');
      return post([markupSection('p', [marker('Hi ', [strong]), atom('mention', '@bob', { id: 42 }, [strong]), marker(' Bye', [strong])])]);
    });

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 0, 'Hi '], [1, [], 0, 0], [0, [], 1, ' Bye']], []]]
    });
  });

  test('renders a post with card', function (assert) {
    var cardName = 'super-card';
    var payload = { bar: 'baz' };
    var post = builder.createPost();
    var section = builder.createCardSection(cardName, payload);
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [[cardName, payload]],
      markups: [],
      sections: [[10, 0]]
    });
  });

  test('renders a post with multiple cards with identical payloads', function (assert) {
    var cardName = 'super-card';
    var payload1 = { bar: 'baz' };
    var payload2 = { bar: 'baz' };
    var post = builder.createPost();

    var section1 = builder.createCardSection(cardName, payload1);
    post.sections.append(section1);

    var section2 = builder.createCardSection(cardName, payload2);
    post.sections.append(section2);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [[cardName, payload1], [cardName, payload2]],
      markups: [],
      sections: [[10, 0], [10, 1]]
    });
  });

  test('renders a post with cards with differing payloads', function (assert) {
    var cardName = 'super-card';
    var payload1 = { bar: 'baz1' };
    var payload2 = { bar: 'baz2' };
    var post = builder.createPost();

    var section1 = builder.createCardSection(cardName, payload1);
    post.sections.append(section1);

    var section2 = builder.createCardSection(cardName, payload2);
    post.sections.append(section2);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [[cardName, payload1], [cardName, payload2]],
      markups: [],
      sections: [[10, 0], [10, 1]]
    });
  });

  test('renders a post with a list', function (assert) {
    var items = [builder.createListItem([builder.createMarker('first item')]), builder.createListItem([builder.createMarker('second item')])];
    var section = builder.createListSection('ul', items);
    var post = builder.createPost([section]);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[3, 'ul', [[[0, [], 0, 'first item']], [[0, [], 0, 'second item']]], []]]
    });
  });

  test('renders an aside as markup section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      return post([markupSection('aside', [marker('abc')])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'aside', [[0, [], 0, 'abc']], []]]
    });
  });

  test('renders a post with a paragraph with attribute', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;
      var markup = _ref8.markup;

      return post([markupSection('p', [], true, { 'data-md-text-align': 'center' })]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [], ['data-md-text-align', 'center']]]
    });
  });

  test('renders a post with a list with attribute', function (assert) {
    var section = builder.createListSection('ul', [], { 'data-md-text-align': 'center' });
    var post = builder.createPost([section]);
    var mobiledoc = render(post);

    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc032.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[3, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('UL'), [], ['data-md-text-align', 'center']]]
    });
  });
});
define('tests/unit/renderers/mobiledoc/0-3-test', ['exports', 'mobiledoc-kit/renderers/mobiledoc/0-3', 'mobiledoc-kit/models/post-node-builder', 'mobiledoc-kit/utils/dom-utils', '../../../test-helpers'], function (exports, _mobiledocKitRenderersMobiledoc03, _mobiledocKitModelsPostNodeBuilder, _mobiledocKitUtilsDomUtils, _testHelpers) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  function render(post) {
    return _mobiledocKitRenderersMobiledoc03['default'].render(post);
  }
  var builder = undefined;

  _module('Unit: Mobiledoc Renderer 0.3', {
    beforeEach: function beforeEach() {
      builder = new _mobiledocKitModelsPostNodeBuilder['default']();
    }
  });

  test('renders a blank post', function (assert) {
    var post = builder.createPost();
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: []
    });
  });

  test('renders a post with marker', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;
      var markup = _ref.markup;

      return post([markupSection('p', [marker('Hi', [markup('strong')])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 1, 'Hi']]]]
    });
  });

  test('renders a post section with markers sharing a markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;
      var markup = _ref2.markup;

      var strong = markup('strong');
      return post([markupSection('p', [marker('Hi', [strong]), marker(' Guy', [strong])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 0, 'Hi'], [0, [], 1, ' Guy']]]]
    });
  });

  test('renders a post with markers with markers with complex attributes', function (assert) {
    var link1 = undefined,
        link2 = undefined;
    var post = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;
      var markup = _ref3.markup;

      link1 = markup('a', { href: 'bustle.com' });
      link2 = markup('a', { href: 'other.com' });
      return post([markupSection('p', [marker('Hi', [link1]), marker(' Guy', [link2]), marker(' other guy', [link1])])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [['a', ['href', 'bustle.com']], ['a', ['href', 'other.com']]],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 1, 'Hi'], [0, [1], 1, ' Guy'], [0, [0], 1, ' other guy']]]]
    });
  });

  test('renders a post with image', function (assert) {
    var url = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
    var post = builder.createPost();
    var section = builder.createImageSection(url);
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[2, url]]
    });
  });

  test('renders a post with image and null src', function (assert) {
    var post = builder.createPost();
    var section = builder.createImageSection();
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[2, null]]
    });
  });

  test('renders a post with atom', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;
      var atom = _ref4.atom;

      return post([markupSection('p', [marker('Hi'), atom('mention', '@bob', { id: 42 })])]);
    });

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [], 0, 'Hi'], [1, [], 0, 0]]]]
    });
  });

  test('renders a post with atom and markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var post = _ref5.post;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;
      var markup = _ref5.markup;
      var atom = _ref5.atom;

      var strong = markup('strong');
      return post([markupSection('p', [atom('mention', '@bob', { id: 42 }, [strong])])]);
    });

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[1, [0], 1, 0]]]]
    });
  });

  test('renders a post with atom inside markup', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;
      var markup = _ref6.markup;
      var atom = _ref6.atom;

      var strong = markup('strong');
      return post([markupSection('p', [marker('Hi ', [strong]), atom('mention', '@bob', { id: 42 }, [strong]), marker(' Bye', [strong])])]);
    });

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [['mention', '@bob', { id: 42 }]],
      cards: [],
      markups: [['strong']],
      sections: [[1, (0, _mobiledocKitUtilsDomUtils.normalizeTagName)('P'), [[0, [0], 0, 'Hi '], [1, [], 0, 0], [0, [], 1, ' Bye']]]]
    });
  });

  test('renders a post with card', function (assert) {
    var cardName = 'super-card';
    var payload = { bar: 'baz' };
    var post = builder.createPost();
    var section = builder.createCardSection(cardName, payload);
    post.sections.append(section);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [[cardName, payload]],
      markups: [],
      sections: [[10, 0]]
    });
  });

  test('renders a post with multiple cards with identical payloads', function (assert) {
    var cardName = 'super-card';
    var payload1 = { bar: 'baz' };
    var payload2 = { bar: 'baz' };
    var post = builder.createPost();

    var section1 = builder.createCardSection(cardName, payload1);
    post.sections.append(section1);

    var section2 = builder.createCardSection(cardName, payload2);
    post.sections.append(section2);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [[cardName, payload1], [cardName, payload2]],
      markups: [],
      sections: [[10, 0], [10, 1]]
    });
  });

  test('renders a post with cards with differing payloads', function (assert) {
    var cardName = 'super-card';
    var payload1 = { bar: 'baz1' };
    var payload2 = { bar: 'baz2' };
    var post = builder.createPost();

    var section1 = builder.createCardSection(cardName, payload1);
    post.sections.append(section1);

    var section2 = builder.createCardSection(cardName, payload2);
    post.sections.append(section2);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [[cardName, payload1], [cardName, payload2]],
      markups: [],
      sections: [[10, 0], [10, 1]]
    });
  });

  test('renders a post with a list', function (assert) {
    var items = [builder.createListItem([builder.createMarker('first item')]), builder.createListItem([builder.createMarker('second item')])];
    var section = builder.createListSection('ul', items);
    var post = builder.createPost([section]);

    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[3, 'ul', [[[0, [], 0, 'first item']], [[0, [], 0, 'second item']]]]]
    });
  });

  test('renders an aside as markup section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref7) {
      var post = _ref7.post;
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;

      return post([markupSection('aside', [marker('abc')])]);
    });
    var mobiledoc = render(post);
    assert.deepEqual(mobiledoc, {
      version: _mobiledocKitRenderersMobiledoc03.MOBILEDOC_VERSION,
      atoms: [],
      cards: [],
      markups: [],
      sections: [[1, 'aside', [[0, [], 0, 'abc']]]]
    });
  });
});
define('tests/unit/utils/array-utils-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/array-utils'], function (exports, _testHelpers, _mobiledocKitUtilsArrayUtils) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: Array Utils');

  test('#objectToSortedKVArray works', function (assert) {
    assert.deepEqual((0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)({ a: 1, b: 2 }), ['a', 1, 'b', 2]);
    assert.deepEqual((0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)({ b: 1, a: 2 }), ['a', 2, 'b', 1]);
    assert.deepEqual((0, _mobiledocKitUtilsArrayUtils.objectToSortedKVArray)({}), []);
  });

  test('#kvArrayToObject works', function (assert) {
    assert.deepEqual((0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)(['a', 1, 'b', 2]), { a: 1, b: 2 });
    assert.deepEqual((0, _mobiledocKitUtilsArrayUtils.kvArrayToObject)([]), {});
  });
});
define('tests/unit/utils/assert-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/assert', 'mobiledoc-kit/utils/mobiledoc-error'], function (exports, _testHelpers, _mobiledocKitUtilsAssert, _mobiledocKitUtilsMobiledocError) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: assert');

  test('#throws a MobiledocError when conditional is false', function (assert) {
    try {
      (0, _mobiledocKitUtilsAssert['default'])('The message', false);
    } catch (e) {
      assert.ok(true, 'caught error');
      assert.equal(e.message, 'The message');
      assert.ok(e instanceof _mobiledocKitUtilsMobiledocError['default'], 'e instanceof MobiledocError');
    }
  });
});
define('tests/unit/utils/copy-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/copy'], function (exports, _testHelpers, _mobiledocKitUtilsCopy) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: copy');

  test('#shallowCopyObject breaks references', function (assert) {
    var obj = { a: 1, b: 'b' };
    var obj2 = (0, _mobiledocKitUtilsCopy.shallowCopyObject)(obj);
    obj.a = 2;
    obj.b = 'new b';

    assert.ok(obj !== obj2, 'obj !== obj2');
    assert.equal(obj2.a, 1, 'obj2 "a" preserved');
    assert.equal(obj2.b, 'b', 'obj2 "b" preserved');
  });
});
define('tests/unit/utils/cursor-position-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/cursor/position', 'mobiledoc-kit/renderers/editor-dom', 'mobiledoc-kit/utils/key'], function (exports, _testHelpers, _mobiledocKitUtilsCursorPosition, _mobiledocKitRenderersEditorDom, _mobiledocKitUtilsKey) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  var FORWARD = _mobiledocKitUtilsKey.DIRECTION.FORWARD;
  var BACKWARD = _mobiledocKitUtilsKey.DIRECTION.BACKWARD;
  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var editor = undefined,
      editorElement = undefined;

  _module('Unit: Utils: Position', {
    beforeEach: function beforeEach() {
      editorElement = $('#editor')[0];
    },
    afterEach: function afterEach() {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    }
  });

  test('#move moves forward and backward in markup section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref) {
      var post = _ref.post;
      var markupSection = _ref.markupSection;
      var marker = _ref.marker;

      return post([markupSection('p', [marker('abcd')])]);
    });
    var position = post.sections.head.toPosition('ab'.length);
    var rightPosition = post.sections.head.toPosition('abc'.length);
    var leftPosition = post.sections.head.toPosition('a'.length);

    assert.positionIsEqual(position.move(FORWARD), rightPosition, 'right position');
    assert.positionIsEqual(position.move(BACKWARD), leftPosition, 'left position');
  });

  test('#move is emoji-aware', function (assert) {
    var emoji = '🙈';
    var post = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var post = _ref2.post;
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;

      return post([markupSection('p', [marker('a' + emoji + 'z')])]);
    });
    var marker = post.sections.head.markers.head;
    assert.equal(marker.length, 'a'.length + 2 + 'z'.length); // precond
    var position = post.sections.head.headPosition();

    position = position.move(FORWARD);
    assert.equal(position.offset, 1);
    position = position.move(FORWARD);
    assert.equal(position.offset, 3); // l-to-r across emoji
    position = position.move(FORWARD);
    assert.equal(position.offset, 4);

    position = position.move(BACKWARD);
    assert.equal(position.offset, 3);

    position = position.move(BACKWARD); // r-to-l across emoji
    assert.equal(position.offset, 1);

    position = position.move(BACKWARD);
    assert.equal(position.offset, 0);
  });

  test('#move moves forward and backward between markup sections', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var post = _ref3.post;
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;

      return post([markupSection('p', [marker('a')]), markupSection('p', [marker('b')]), markupSection('p', [marker('c')])]);
    });
    var midHead = post.sections.objectAt(1).headPosition();
    var midTail = post.sections.objectAt(1).tailPosition();

    var aTail = post.sections.head.tailPosition();
    var cHead = post.sections.tail.headPosition();

    assert.positionIsEqual(midHead.move(BACKWARD), aTail, 'left to prev section');
    assert.positionIsEqual(midTail.move(FORWARD), cHead, 'right to next section');
  });

  test('#move from one nested section to another', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var post = _ref4.post;
      var listSection = _ref4.listSection;
      var listItem = _ref4.listItem;
      var marker = _ref4.marker;

      return post([listSection('ul', [listItem([marker('a')]), listItem([marker('b')]), listItem([marker('c')])])]);
    });
    var midHead = post.sections.head.items.objectAt(1).headPosition();
    var midTail = post.sections.head.items.objectAt(1).tailPosition();

    var aTail = post.sections.head.items.head.tailPosition();
    var cHead = post.sections.tail.items.tail.headPosition();

    assert.positionIsEqual(midHead.move(BACKWARD), aTail, 'left to prev section');
    assert.positionIsEqual(midTail.move(FORWARD), cHead, 'right to next section');
  });

  test('#move from last nested section to next un-nested section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var post = _ref5.post;
      var listSection = _ref5.listSection;
      var listItem = _ref5.listItem;
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;

      return post([markupSection('p', [marker('a')]), listSection('ul', [listItem([marker('b')])]), markupSection('p', [marker('c')])]);
    });
    var midHead = post.sections.objectAt(1).items.head.headPosition();
    var midTail = post.sections.objectAt(1).items.head.tailPosition();

    var aTail = post.sections.head.tailPosition();
    var cHead = post.sections.tail.headPosition();

    assert.positionIsEqual(midHead.move(BACKWARD), aTail, 'left to prev section');
    assert.positionIsEqual(midTail.move(FORWARD), cHead, 'right to next section');
  });

  test('#move across and beyond card section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var post = _ref6.post;
      var cardSection = _ref6.cardSection;
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;

      return post([markupSection('p', [marker('a')]), cardSection('my-card'), markupSection('p', [marker('c')])]);
    });
    var midHead = post.sections.objectAt(1).headPosition();
    var midTail = post.sections.objectAt(1).tailPosition();

    var aTail = post.sections.head.tailPosition();
    var cHead = post.sections.tail.headPosition();

    assert.positionIsEqual(midHead.move(BACKWARD), aTail, 'left to prev section');
    assert.positionIsEqual(midTail.move(FORWARD), cHead, 'right to next section');
    assert.positionIsEqual(midHead.move(FORWARD), midTail, 'move l-to-r across card');
    assert.positionIsEqual(midTail.move(BACKWARD), midHead, 'move r-to-l across card');
  });

  test('#move across and beyond card section into list section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref7) {
      var post = _ref7.post;
      var cardSection = _ref7.cardSection;
      var listSection = _ref7.listSection;
      var listItem = _ref7.listItem;
      var marker = _ref7.marker;

      return post([listSection('ul', [listItem([marker('a1')]), listItem([marker('a2')])]), cardSection('my-card'), listSection('ul', [listItem([marker('c1')]), listItem([marker('c2')])])]);
    });
    var midHead = post.sections.objectAt(1).headPosition();
    var midTail = post.sections.objectAt(1).tailPosition();

    var aTail = post.sections.head.items.tail.tailPosition();
    var cHead = post.sections.tail.items.head.headPosition();

    assert.positionIsEqual(midHead.move(BACKWARD), aTail, 'left to prev section');
    assert.positionIsEqual(midTail.move(FORWARD), cHead, 'right to next section');
  });

  test('#move left at headPosition or right at tailPosition returns self', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref8) {
      var post = _ref8.post;
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('def')])]);
    });

    var head = post.headPosition(),
        tail = post.tailPosition();
    assert.positionIsEqual(head.move(BACKWARD), head, 'head move left is head');
    assert.positionIsEqual(tail.move(FORWARD), tail, 'tail move right is tail');
  });

  test('#move can move multiple units', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref9) {
      var post = _ref9.post;
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      return post([markupSection('p', [marker('abc')]), markupSection('p', [marker('def')])]);
    });

    var head = post.headPosition(),
        tail = post.tailPosition();

    assert.positionIsEqual(head.move(FORWARD * ('abc'.length + 1 + 'def'.length)), tail, 'head can move to tail');
    assert.positionIsEqual(tail.move(BACKWARD * ('abc'.length + 1 + 'def'.length)), head, 'tail can move to head');

    assert.positionIsEqual(head.move(0), head, 'move(0) is no-op');
  });

  test('#moveWord in text (backward)', function (assert) {
    var expectations = [['abc def|', 'abc |def'], ['abc d|ef', 'abc |def'], ['abc |def', '|abc def'], ['abc| def', '|abc def'], ['|abc def', '|abc def'], ['abc-|', '|abc-'], ['abc|', '|abc'], ['ab|c', '|abc'], ['|abc', '|abc'], ['abc  |', '|abc'], ['abcdéf|', '|abcdéf']];

    expectations.forEach(function (_ref10) {
      var _ref102 = _slicedToArray(_ref10, 2);

      var before = _ref102[0];
      var after = _ref102[1];

      var _Helpers$postAbstract$buildFromText = _testHelpers['default'].postAbstract.buildFromText(before);

      var post = _Helpers$postAbstract$buildFromText.post;
      var pos = _Helpers$postAbstract$buildFromText.range.head;

      var _Helpers$postAbstract$buildFromText2 = _testHelpers['default'].postAbstract.buildFromText(after);

      var afterPos = _Helpers$postAbstract$buildFromText2.range.head;

      var expectedPos = post.sections.head.toPosition(afterPos.offset);
      assert.positionIsEqual(pos.moveWord(BACKWARD), expectedPos, 'move word "' + before + '"->"' + after + '"');
    });
  });

  test('#moveWord stops on word-separators', function (assert) {
    var separators = ['-', '+', '=', '|'];
    separators.forEach(function (sep) {
      var text = 'abc' + sep + 'def';
      var post = _testHelpers['default'].postAbstract.build(function (_ref11) {
        var post = _ref11.post;
        var markupSection = _ref11.markupSection;
        var marker = _ref11.marker;

        return post([markupSection('p', [marker(text)])]);
      });
      var pos = post.tailPosition();
      var expectedPos = post.sections.head.toPosition('abc '.length);

      assert.positionIsEqual(pos.moveWord(BACKWARD), expectedPos, 'move word <- "' + text + '|"');
    });
  });

  test('#moveWord does not stop on non-word-separators', function (assert) {
    var nonSeparators = ['_', ':'];
    nonSeparators.forEach(function (sep) {
      var text = 'abc' + sep + 'def';

      // Have to use `build` function here because "_" is a special char for `buildFromText`
      var post = _testHelpers['default'].postAbstract.build(function (_ref12) {
        var post = _ref12.post;
        var markupSection = _ref12.markupSection;
        var marker = _ref12.marker;

        return post([markupSection('p', [marker(text)])]);
      });
      var pos = post.tailPosition();
      var nextPos = post.headPosition();

      assert.positionIsEqual(pos.moveWord(BACKWARD), nextPos, 'move word <- "' + text + '|"');
    });
  });

  test('#moveWord across markerable sections', function (assert) {
    var _Helpers$postAbstract$buildFromText3 = _testHelpers['default'].postAbstract.buildFromText(['abc def', '123 456']);

    var post = _Helpers$postAbstract$buildFromText3.post;

    var _post$sections$toArray = post.sections.toArray();

    var _post$sections$toArray2 = _slicedToArray(_post$sections$toArray, 2);

    var first = _post$sections$toArray2[0];
    var second = _post$sections$toArray2[1];

    var pos = function pos(section, text) {
      return section.toPosition(text.length);
    };
    var firstTail = first.tailPosition();
    var secondHead = second.headPosition();

    assert.positionIsEqual(secondHead.moveWord(BACKWARD), pos(first, 'abc '), 'secondHead <- "abc "');
    assert.positionIsEqual(firstTail.moveWord(FORWARD), pos(second, '123'), 'firstTail <- "123"');
  });

  test('#moveWord across markerable/non-markerable section boundaries', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref13) {
      var post = _ref13.post;
      var markupSection = _ref13.markupSection;
      var cardSection = _ref13.cardSection;
      var marker = _ref13.marker;

      return post([markupSection('p', [marker('abc')]), cardSection('some-card'), markupSection('p', [marker('def')])]);
    });

    var _post$sections$toArray3 = post.sections.toArray();

    var _post$sections$toArray32 = _slicedToArray(_post$sections$toArray3, 3);

    var before = _post$sections$toArray32[0];
    var card = _post$sections$toArray32[1];
    var after = _post$sections$toArray32[2];

    var cardHead = card.headPosition();
    var cardTail = card.tailPosition();
    var beforeTail = before.tailPosition();
    var afterHead = after.headPosition();

    assert.positionIsEqual(cardHead.moveWord(BACKWARD), beforeTail, 'cardHead <- beforeTail');
    assert.positionIsEqual(cardHead.moveWord(FORWARD), cardTail, 'cardHead -> cardTail');
    assert.positionIsEqual(cardTail.moveWord(BACKWARD), cardHead, 'cardTail <- cardHead');
    assert.positionIsEqual(afterHead.moveWord(BACKWARD), cardHead, 'afterHead <- cardHead');
    assert.positionIsEqual(beforeTail.moveWord(FORWARD), cardTail, 'beforeTail -> cardTail');
  });

  test('#moveWord with atoms (backward)', function (assert) {
    var expectations = [['abc @|', 'abc |@'], ['abc |@', '|abc @'], ['@|', '|@'], ['@  |', '@|  '], ['@@|', '@|@'], ['@|@', '|@@'], ['|@@', '|@@']];

    expectations.forEach(function (_ref14) {
      var _ref142 = _slicedToArray(_ref14, 2);

      var before = _ref142[0];
      var after = _ref142[1];

      var _Helpers$postAbstract$buildFromText4 = _testHelpers['default'].postAbstract.buildFromText(before);

      var post = _Helpers$postAbstract$buildFromText4.post;
      var pos = _Helpers$postAbstract$buildFromText4.range.head;

      var _Helpers$postAbstract$buildFromText5 = _testHelpers['default'].postAbstract.buildFromText(after);

      var nextPos = _Helpers$postAbstract$buildFromText5.range.head;

      var section = post.sections.head;
      nextPos = section.toPosition(nextPos.offset);

      assert.positionIsEqual(pos.moveWord(BACKWARD), nextPos, 'move word with atoms "' + before + '" -> "' + after + '"');
    });
  });

  test('#moveWord in text (forward)', function (assert) {
    var expectations = [['|abc def', 'abc| def'], ['a|bc def', 'abc| def'], ['abc| def', 'abc def|'], ['abc |def', 'abc def|'], ['abc def|', 'abc def|'], ['abc|', 'abc|'], ['ab|c', 'abc|'], ['|abc', 'abc|'], ['|  abc', '  abc|']];

    expectations.forEach(function (_ref15) {
      var _ref152 = _slicedToArray(_ref15, 2);

      var before = _ref152[0];
      var after = _ref152[1];

      var _Helpers$postAbstract$buildFromText6 = _testHelpers['default'].postAbstract.buildFromText(before);

      var post = _Helpers$postAbstract$buildFromText6.post;
      var pos = _Helpers$postAbstract$buildFromText6.range.head;

      var _Helpers$postAbstract$buildFromText7 = _testHelpers['default'].postAbstract.buildFromText(after);

      var nextPos = _Helpers$postAbstract$buildFromText7.range.head;

      var section = post.sections.head;
      nextPos = section.toPosition(nextPos.offset); // fix section

      assert.positionIsEqual(pos.moveWord(FORWARD), nextPos, 'move word "' + before + '"->"' + after + '"');
    });
  });

  test('#moveWord with atoms (forward)', function (assert) {
    var expectations = [['|@', '@|'], ['@|', '@|'], ['|  @', '  @|'], ['|  @ x', '  @ |x'], ['abc| @', 'abc @|'], ['|@@', '@|@'], ['@|@', '@@|'], ['@@|', '@@|']];

    expectations.forEach(function (_ref16) {
      var _ref162 = _slicedToArray(_ref16, 2);

      var before = _ref162[0];
      var after = _ref162[1];

      var _Helpers$postAbstract$buildFromText8 = _testHelpers['default'].postAbstract.buildFromText(before);

      var post = _Helpers$postAbstract$buildFromText8.post;
      var pos = _Helpers$postAbstract$buildFromText8.range.head;

      var _Helpers$postAbstract$buildFromText9 = _testHelpers['default'].postAbstract.buildFromText(after);

      var nextPos = _Helpers$postAbstract$buildFromText9.range.head;

      var section = post.sections.head;
      nextPos = section.toPosition(nextPos.offset);

      assert.positionIsEqual(pos.moveWord(FORWARD), nextPos, 'move word with atoms "' + before + '" -> "' + after + '"');
    });
  });

  test('#fromNode when node is marker text node', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref17) {
      var post = _ref17.post;
      var markupSection = _ref17.markupSection;
      var marker = _ref17.marker;

      return post([markupSection('p', [marker('abc'), marker('123')])]);
    });

    var textNode = editorElement.firstChild // p
    .lastChild; // textNode

    assert.equal(textNode.textContent, '123', 'precond - correct text node');

    var renderTree = editor._renderTree;
    var position = _mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, textNode, 2);

    var section = editor.post.sections.head;
    assert.positionIsEqual(position, section.toPosition('abc'.length + 2));
  });

  test('#fromNode when node is section node with offset', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref18) {
      var post = _ref18.post;
      var markupSection = _ref18.markupSection;
      var marker = _ref18.marker;

      return post([markupSection('p', [marker('abc'), marker('123')])]);
    });

    var pNode = editorElement.firstChild;
    assert.equal(pNode.tagName.toLowerCase(), 'p', 'precond - correct node');

    var renderTree = editor._renderTree;
    var position = _mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, pNode, 0);

    assert.positionIsEqual(position, editor.post.sections.head.headPosition());
  });

  test('#fromNode when node is root element and offset is 0', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref19) {
      var post = _ref19.post;
      var markupSection = _ref19.markupSection;
      var marker = _ref19.marker;

      return post([markupSection('p', [marker('abc'), marker('123')])]);
    });

    var renderTree = editor._renderTree;
    var position = _mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, editorElement, 0);

    assert.positionIsEqual(position, editor.post.headPosition());
  });

  test('#fromNode when node is root element and offset is > 0', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref20) {
      var post = _ref20.post;
      var markupSection = _ref20.markupSection;
      var marker = _ref20.marker;

      return post([markupSection('p', [marker('abc'), marker('123')])]);
    });

    var renderTree = editor._renderTree;
    var position = _mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, editorElement, 1);

    assert.positionIsEqual(position, editor.post.tailPosition());
  });

  /**
   * On Firefox, triple-clicking results in a different selection that on Chrome
   * and others. Imagine we have the following content:
   *
   * <p>abc</p>
   *
   * Chrome:
   * anchorNode: <TextNode>
   * anchorOffset: 0
   * focusNode: <TextNode>
   * focusOffset: 3
   *
   * Firefox:
   * anchorNode: <p>
   * anchorOffset: 0
   * focusNode: <p>
   * focusOffset: 1
   *
   * So when getting the position for `focusNode`/`focusOffset`, we have to get
   * the tail of section.
   */
  test('#fromNode when offset refers to one past the number of child nodes of the node', function (assert) {
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref21) {
      var post = _ref21.post;
      var markupSection = _ref21.markupSection;
      var marker = _ref21.marker;

      return post([markupSection('p', [marker('abc')])]);
    });

    var renderTree = editor._renderTree;
    var elementNode = editorElement.firstChild;
    var position = _mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, elementNode, 1);

    assert.positionIsEqual(position, editor.post.tailPosition());
  });

  test('#fromNode when node is card section element or next to it', function (assert) {
    var editorOptions = { cards: [{
        name: 'some-card',
        type: 'dom',
        render: function render() {
          return $('<div id="the-card">this is the card</div>')[0];
        }
      }] };
    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref22) {
      var post = _ref22.post;
      var cardSection = _ref22.cardSection;

      return post([cardSection('some-card')]);
    }, editorOptions);

    var nodes = {
      wrapper: editorElement.firstChild,
      leftCursor: editorElement.firstChild.firstChild,
      rightCursor: editorElement.firstChild.lastChild,
      cardDiv: editorElement.firstChild.childNodes[1]
    };

    assert.ok(nodes.wrapper && nodes.leftCursor && nodes.rightCursor && nodes.cardDiv, 'precond - nodes');

    assert.equal(nodes.wrapper.tagName.toLowerCase(), 'div', 'precond - wrapper');
    assert.equal(nodes.leftCursor.textContent, _mobiledocKitRenderersEditorDom.ZWNJ, 'precond - left cursor');
    assert.equal(nodes.rightCursor.textContent, _mobiledocKitRenderersEditorDom.ZWNJ, 'precond - right cursor');
    assert.ok(nodes.cardDiv.className.indexOf(_mobiledocKitRenderersEditorDom.CARD_ELEMENT_CLASS_NAME) !== -1, 'precond -card div');

    var renderTree = editor._renderTree;
    var cardSection = editor.post.sections.head;

    var leftPos = cardSection.headPosition();
    var rightPos = cardSection.tailPosition();

    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.wrapper, 0), leftPos, 'wrapper offset 0');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.wrapper, 1), leftPos, 'wrapper offset 1');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.wrapper, 2), rightPos, 'wrapper offset 2');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.leftCursor, 0), leftPos, 'left cursor offset 0');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.leftCursor, 1), leftPos, 'left cursor offset 1');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.rightCursor, 0), rightPos, 'right cursor offset 0');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.rightCursor, 1), rightPos, 'right cursor offset 1');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.cardDiv, 0), leftPos, 'card div offset 0');
    assert.positionIsEqual(_mobiledocKitUtilsCursorPosition['default'].fromNode(renderTree, nodes.cardDiv, 1), leftPos, 'card div offset 1');
  });

  /**
   * When triple-clicking text in a disabled editor, some browsers will
   * expand the selection to include the start of a node outside the editor.
   * See: https://github.com/bustle/mobiledoc-kit/issues/486
   *
   * Chrome and Safari appear to extend the selection to the next node in the document
   * that has a textNode in it. Firefox does not suffer from this issue.
   */
  test('#fromNode when selection is outside (after) the editor element', function (assert) {
    var done = assert.async();
    var div$ = $('<div><p>AFTER</p></div>').insertAfter($(editorElement));
    var p = div$[0].firstChild;

    editor = _testHelpers['default'].mobiledoc.renderInto(editorElement, function (_ref23) {
      var post = _ref23.post;
      var markupSection = _ref23.markupSection;
      var marker = _ref23.marker;
      return post([markupSection('p', [marker('abcdef')])]);
    });

    // If the editor isn't disabled, some browsers will "fix" the selection range we are
    // about to add by constraining it within the contentEditable container div
    editor.disableEditing();

    var anchorNode = $(editorElement).find('p:contains(abcdef)')[0].firstChild;
    var focusNode = p;
    _testHelpers['default'].dom.selectRange(anchorNode, 0, focusNode, 0);

    _testHelpers['default'].wait(function () {
      assert.ok(window.getSelection().anchorNode === anchorNode, 'precond - anchor node');
      assert.ok(window.getSelection().focusNode === focusNode, 'precond - focus node');
      var range = editor.range;

      assert.positionIsEqual(range.head, editor.post.headPosition(), 'head');
      assert.positionIsEqual(range.tail, editor.post.tailPosition(), 'tail');

      div$.remove();
      done();
    });
  });

  test('Position cannot be on list section', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref24) {
      var post = _ref24.post;
      var listSection = _ref24.listSection;
      var listItem = _ref24.listItem;

      return post([listSection('ul', [listItem()])]);
    });

    var listSection = post.sections.head;
    var listItem = listSection.items.head;

    var position = undefined;
    assert.throws(function () {
      position = listSection.toPosition(0);
    }, /addressable by the cursor/);

    position = listItem.toPosition(0);
    assert.ok(position, 'position with list item is ok');
  });
});
define('tests/unit/utils/cursor-range-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/cursor/range', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/array-utils'], function (exports, _testHelpers, _mobiledocKitUtilsCursorRange, _mobiledocKitUtilsKey, _mobiledocKitUtilsArrayUtils) {
  'use strict';

  var FORWARD = _mobiledocKitUtilsKey.DIRECTION.FORWARD;
  var BACKWARD = _mobiledocKitUtilsKey.DIRECTION.BACKWARD;
  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: Range');

  test('#trimTo(section) when range covers only one section', function (assert) {
    var section = _testHelpers['default'].postAbstract.build(function (_ref) {
      var markupSection = _ref.markupSection;
      return markupSection();
    });
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, 5);

    var newRange = range.trimTo(section);
    assert.ok(newRange.head.section === section, 'head section is correct');
    assert.ok(newRange.tail.section === section, 'tail section is correct');
    assert.equal(newRange.head.offset, 0, 'head offset');
    assert.equal(newRange.tail.offset, 0, 'tail offset');
  });

  test('#trimTo head section', function (assert) {
    var text = 'abcdef';
    var section1 = _testHelpers['default'].postAbstract.build(function (_ref2) {
      var markupSection = _ref2.markupSection;
      var marker = _ref2.marker;
      return markupSection('p', [marker(text)]);
    });
    var section2 = _testHelpers['default'].postAbstract.build(function (_ref3) {
      var markupSection = _ref3.markupSection;
      var marker = _ref3.marker;
      return markupSection('p', [marker(text)]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(section1, 0, section2, 5);
    var newRange = range.trimTo(section1);

    assert.ok(newRange.head.section === section1, 'head section');
    assert.ok(newRange.tail.section === section1, 'tail section');
    assert.equal(newRange.head.offset, 0, 'head offset');
    assert.equal(newRange.tail.offset, text.length, 'tail offset');
  });

  test('#trimTo tail section', function (assert) {
    var text = 'abcdef';
    var section1 = _testHelpers['default'].postAbstract.build(function (_ref4) {
      var markupSection = _ref4.markupSection;
      var marker = _ref4.marker;
      return markupSection('p', [marker(text)]);
    });
    var section2 = _testHelpers['default'].postAbstract.build(function (_ref5) {
      var markupSection = _ref5.markupSection;
      var marker = _ref5.marker;
      return markupSection('p', [marker(text)]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(section1, 0, section2, 5);
    var newRange = range.trimTo(section2);

    assert.ok(newRange.head.section === section2, 'head section');
    assert.ok(newRange.tail.section === section2, 'tail section');
    assert.equal(newRange.head.offset, 0, 'head offset');
    assert.equal(newRange.tail.offset, 5, 'tail offset');
  });

  test('#trimTo middle section', function (assert) {
    var text = 'abcdef';
    var section1 = _testHelpers['default'].postAbstract.build(function (_ref6) {
      var markupSection = _ref6.markupSection;
      var marker = _ref6.marker;
      return markupSection('p', [marker(text)]);
    });
    var section2 = _testHelpers['default'].postAbstract.build(function (_ref7) {
      var markupSection = _ref7.markupSection;
      var marker = _ref7.marker;
      return markupSection('p', [marker(text)]);
    });
    var section3 = _testHelpers['default'].postAbstract.build(function (_ref8) {
      var markupSection = _ref8.markupSection;
      var marker = _ref8.marker;
      return markupSection('p', [marker(text)]);
    });

    var range = _mobiledocKitUtilsCursorRange['default'].create(section1, 0, section3, 5);
    var newRange = range.trimTo(section2);

    assert.ok(newRange.head.section === section2, 'head section');
    assert.ok(newRange.tail.section === section2, 'tail section');
    assert.equal(newRange.head.offset, 0, 'head offset');
    assert.equal(newRange.tail.offset, section2.text.length, 'tail offset');
  });

  test('#move moves collapsed range 1 character in direction', function (assert) {
    var section = _testHelpers['default'].postAbstract.build(function (_ref9) {
      var markupSection = _ref9.markupSection;
      var marker = _ref9.marker;

      return markupSection('p', [marker('abc')]);
    });
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 0);
    var nextRange = _mobiledocKitUtilsCursorRange['default'].create(section, 1);

    assert.ok(range.isCollapsed, 'precond - range.isCollapsed');
    assert.rangeIsEqual(range.move(_mobiledocKitUtilsKey.DIRECTION.FORWARD), nextRange, 'move forward');

    assert.rangeIsEqual(nextRange.move(_mobiledocKitUtilsKey.DIRECTION.BACKWARD), range, 'move backward');
  });

  test('#move collapses non-collapsd range in direction', function (assert) {
    var section = _testHelpers['default'].postAbstract.build(function (_ref10) {
      var markupSection = _ref10.markupSection;
      var marker = _ref10.marker;

      return markupSection('p', [marker('abcd')]);
    });
    var range = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 3);
    var collapseForward = _mobiledocKitUtilsCursorRange['default'].create(section, 3);
    var collapseBackward = _mobiledocKitUtilsCursorRange['default'].create(section, 1);

    assert.ok(!range.isCollapsed, 'precond - !range.isCollapsed');
    assert.rangeIsEqual(range.move(FORWARD), collapseForward, 'collapse forward');
    assert.rangeIsEqual(range.move(BACKWARD), collapseBackward, 'collapse forward');
  });

  test('#extend expands range in direction', function (assert) {
    var section = _testHelpers['default'].postAbstract.build(function (_ref11) {
      var markupSection = _ref11.markupSection;
      var marker = _ref11.marker;

      return markupSection('p', [marker('abcd')]);
    });
    var collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(section, 1);
    var collapsedRangeForward = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 2, FORWARD);
    var collapsedRangeBackward = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, 1, BACKWARD);

    var nonCollapsedRange = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 2);
    var nonCollapsedRangeForward = _mobiledocKitUtilsCursorRange['default'].create(section, 1, section, 3, FORWARD);
    var nonCollapsedRangeBackward = _mobiledocKitUtilsCursorRange['default'].create(section, 0, section, 2, BACKWARD);

    assert.ok(collapsedRange.isCollapsed, 'precond - collapsedRange.isCollapsed');
    assert.rangeIsEqual(collapsedRange.extend(FORWARD), collapsedRangeForward, 'collapsedRange extend forward');
    assert.rangeIsEqual(collapsedRange.extend(BACKWARD), collapsedRangeBackward, 'collapsedRange extend backward');

    assert.ok(!nonCollapsedRange.isCollapsed, 'precond -nonCollapsedRange.isCollapsed');
    assert.rangeIsEqual(nonCollapsedRange.extend(FORWARD), nonCollapsedRangeForward, 'nonCollapsedRange extend forward');
    assert.rangeIsEqual(nonCollapsedRange.extend(BACKWARD), nonCollapsedRangeBackward, 'nonCollapsedRange extend backward');
  });

  test('#extend expands range in multiple units in direction', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref12) {
      var post = _ref12.post;
      var markupSection = _ref12.markupSection;
      var marker = _ref12.marker;

      return post([markupSection('p', [marker('abcd')]), markupSection('p', [marker('1234')])]);
    });

    var headSection = post.sections.head;
    var tailSection = post.sections.tail;

    // FORWARD
    var collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(headSection, 0);
    var nonCollapsedRange = _mobiledocKitUtilsCursorRange['default'].create(headSection, 0, headSection, 1);
    assert.rangeIsEqual(collapsedRange.extend(FORWARD * 2), _mobiledocKitUtilsCursorRange['default'].create(headSection, 0, headSection, 2, FORWARD), 'extend forward 2');

    assert.rangeIsEqual(collapsedRange.extend(FORWARD * ('abcd12'.length + 1)), _mobiledocKitUtilsCursorRange['default'].create(headSection, 0, tailSection, 2, FORWARD), 'extend forward across sections');

    assert.rangeIsEqual(nonCollapsedRange.extend(FORWARD * 2), _mobiledocKitUtilsCursorRange['default'].create(headSection, 0, headSection, 3, FORWARD), 'extend non-collapsed forward 2');

    assert.rangeIsEqual(nonCollapsedRange.extend(FORWARD * ('bcd12'.length + 1)), _mobiledocKitUtilsCursorRange['default'].create(headSection, 0, tailSection, 2, FORWARD), 'extend non-collapsed across sections');

    // BACKWARD
    collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(tailSection, '1234'.length);
    nonCollapsedRange = _mobiledocKitUtilsCursorRange['default'].create(tailSection, '12'.length, tailSection, '1234'.length);
    assert.rangeIsEqual(collapsedRange.extend(BACKWARD * '12'.length), _mobiledocKitUtilsCursorRange['default'].create(tailSection, '12'.length, tailSection, '1234'.length, BACKWARD), 'extend backward 2');

    assert.rangeIsEqual(collapsedRange.extend(BACKWARD * ('1234cd'.length + 1)), _mobiledocKitUtilsCursorRange['default'].create(headSection, 'ab'.length, tailSection, '1234'.length, BACKWARD), 'extend backward across sections');

    assert.rangeIsEqual(nonCollapsedRange.extend(BACKWARD * 2), _mobiledocKitUtilsCursorRange['default'].create(tailSection, 0, tailSection, '1234'.length, BACKWARD), 'extend non-collapsed backward 2');

    assert.rangeIsEqual(nonCollapsedRange.extend(BACKWARD * ('bcd12'.length + 1)), _mobiledocKitUtilsCursorRange['default'].create(headSection, 'a'.length, tailSection, '1234'.length, BACKWARD), 'extend non-collapsed backward across sections');
  });

  test('#extend(0) returns same range', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref13) {
      var post = _ref13.post;
      var markupSection = _ref13.markupSection;
      var marker = _ref13.marker;

      return post([markupSection('p', [marker('abcd')]), markupSection('p', [marker('1234')])]);
    });

    var headSection = post.sections.head;

    var collapsedRange = _mobiledocKitUtilsCursorRange['default'].create(headSection, 0);
    var nonCollapsedRange = _mobiledocKitUtilsCursorRange['default'].create(headSection, 0, headSection, 1);

    assert.rangeIsEqual(collapsedRange.extend(0), collapsedRange, 'extending collapsed range 0 is no-op');
    assert.rangeIsEqual(nonCollapsedRange.extend(0), nonCollapsedRange, 'extending non-collapsed range 0 is no-op');
  });

  test('#expandByMarker processed markers in a callback and continues as long as the callback returns true', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref14) {
      var post = _ref14.post;
      var markupSection = _ref14.markupSection;
      var marker = _ref14.marker;
      var markup = _ref14.markup;

      var bold = markup('b');
      var italic = markup('i');
      return post([markupSection('p', [marker('aiya', []), marker('biya', [bold, italic]), marker('ciya', [bold]), marker('diya', [bold])])]);
    });

    var section = post.sections.head;
    var head = section.toPosition(9); // i in the third hiya
    var tail = section.toPosition(15); // y in the last hiya
    var range = head.toRange(tail);
    var expandedRange = range.expandByMarker(function (marker) {
      return !!(0, _mobiledocKitUtilsArrayUtils.detect)(marker.markups, function (markup) {
        return markup.tagName === 'b';
      });
    });

    assert.positionIsEqual(expandedRange.head, section.toPosition(4), 'range head is start of second marker');
    assert.positionIsEqual(expandedRange.tail, section.toPosition(16), 'range tail did not change');
  });

  // https://github.com/bustle/mobiledoc-kit/issues/676
  test('#expandByMarker can expand to beginning of section with matching markups', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref15) {
      var post = _ref15.post;
      var markupSection = _ref15.markupSection;
      var marker = _ref15.marker;
      var markup = _ref15.markup;

      var bold = markup('b');
      var italic = markup('i');
      return post([markupSection('p', [marker('aiya', [bold]), marker('biya', [bold, italic]), marker('ciya', [bold]), marker('diya', [bold])])]);
    });

    var section = post.sections.head;
    var head = section.toPosition(14); // i in 4th hiya
    var tail = section.toPosition(14); // i in 4th hiya
    var range = head.toRange(tail);
    var expandedRange = range.expandByMarker(function (marker) {
      return !!(0, _mobiledocKitUtilsArrayUtils.detect)(marker.markups, function (markup) {
        return markup.tagName === 'b';
      });
    });

    assert.positionIsEqual(expandedRange.head, section.toPosition(0), 'range head is start of first marker');
    assert.positionIsEqual(expandedRange.tail, section.toPosition(16), 'range tail is at end of last marker');
  });

  test('#expandByMarker can expand to end of section with matching markups', function (assert) {
    var post = _testHelpers['default'].postAbstract.build(function (_ref16) {
      var post = _ref16.post;
      var markupSection = _ref16.markupSection;
      var marker = _ref16.marker;
      var markup = _ref16.markup;

      var bold = markup('b');
      var italic = markup('i');
      return post([markupSection('p', [marker('aiya', [bold]), marker('biya', [bold, italic]), marker('ciya', [bold]), marker('diya', [bold])])]);
    });

    var section = post.sections.head;
    var head = section.toPosition(2); // i in 4th hiya
    var tail = section.toPosition(2); // i in 4th hiya
    var range = head.toRange(tail);
    var expandedRange = range.expandByMarker(function (marker) {
      return !!(0, _mobiledocKitUtilsArrayUtils.detect)(marker.markups, function (markup) {
        return markup.tagName === 'b';
      });
    });

    assert.positionIsEqual(expandedRange.head, section.toPosition(0), 'range head is start of first marker');
    assert.positionIsEqual(expandedRange.tail, section.toPosition(16), 'range tail is at end of last marker');
  });
});
define('tests/unit/utils/fixed-queue-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/fixed-queue'], function (exports, _testHelpers, _mobiledocKitUtilsFixedQueue) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: FixedQueue');

  test('basic implementation', function (assert) {
    var queue = new _mobiledocKitUtilsFixedQueue['default'](3);
    for (var i = 0; i < 3; i++) {
      queue.push(i);
    }

    assert.equal(queue.length, 3);

    var popped = [];
    while (queue.length) {
      popped.push(queue.pop());
    }

    assert.deepEqual(popped, [2, 1, 0]);
  });

  test('empty queue', function (assert) {
    var queue = new _mobiledocKitUtilsFixedQueue['default'](0);
    assert.equal(queue.length, 0);
    assert.equal(queue.pop(), undefined);
    queue.push(1);

    assert.equal(queue.length, 0);
    assert.deepEqual(queue.toArray(), []);
  });

  test('push onto full queue ejects first item', function (assert) {
    var queue = new _mobiledocKitUtilsFixedQueue['default'](1);
    queue.push(0);
    queue.push(1);

    assert.deepEqual(queue.toArray(), [1]);
  });
});
define('tests/unit/utils/key-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/key', 'mobiledoc-kit/utils/keys', 'mobiledoc-kit/utils/keycodes'], function (exports, _testHelpers, _mobiledocKitUtilsKey, _mobiledocKitUtilsKeys, _mobiledocKitUtilsKeycodes) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: Key');

  test('#hasModifier with no modifier', function (assert) {
    var event = _testHelpers['default'].dom.createMockEvent('keydown', null, { keyCode: 42 });
    var key = _mobiledocKitUtilsKey['default'].fromEvent(event);

    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.META), "META not pressed");
    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.CTRL), "CTRL not pressed");
    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.SHIFT), "SHIFT not pressed");
  });

  test('#hasModifier with META', function (assert) {
    var event = _testHelpers['default'].dom.createMockEvent('keyup', null, { metaKey: true });
    var key = _mobiledocKitUtilsKey['default'].fromEvent(event);

    assert.ok(key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.META), "META pressed");
    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.CTRL), "CTRL not pressed");
    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.SHIFT), "SHIFT not pressed");
  });

  test('#hasModifier with CTRL', function (assert) {
    var event = _testHelpers['default'].dom.createMockEvent('keypress', null, { ctrlKey: true });
    var key = _mobiledocKitUtilsKey['default'].fromEvent(event);

    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.META), "META not pressed");
    assert.ok(key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.CTRL), "CTRL pressed");
    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.SHIFT), "SHIFT not pressed");
  });

  test('#hasModifier with SHIFT', function (assert) {
    var event = _testHelpers['default'].dom.createMockEvent('keydown', null, { shiftKey: true });
    var key = _mobiledocKitUtilsKey['default'].fromEvent(event);

    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.META), "META not pressed");
    assert.ok(!key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.CTRL), "CTRL not pressed");
    assert.ok(key.hasModifier(_mobiledocKitUtilsKey.MODIFIERS.SHIFT), "SHIFT pressed");
  });

  // Firefox will fire keypress events for some keys that should not be printable
  test('firefox: non-printable are treated as not printable', function (assert) {
    var KEYS = [_mobiledocKitUtilsKeys['default'].DOWN, _mobiledocKitUtilsKeys['default'].HOME, _mobiledocKitUtilsKeys['default'].END, _mobiledocKitUtilsKeys['default'].PAGEUP, _mobiledocKitUtilsKeys['default'].PAGEDOWN, _mobiledocKitUtilsKeys['default'].INS, _mobiledocKitUtilsKeys['default'].CLEAR, _mobiledocKitUtilsKeys['default'].PAUSE, _mobiledocKitUtilsKeys['default'].ESC];

    KEYS.forEach(function (key) {
      var element = $('#qunit-fixture')[0];
      var event = _testHelpers['default'].dom.createMockEvent('keypress', element, {
        key: key
      });
      var keyInstance = _mobiledocKitUtilsKey['default'].fromEvent(event);

      assert.ok(!keyInstance.isPrintable(), 'key ' + key + ' is not printable');
    });
  });

  test('uses keyCode as a fallback if key is not supported', function (assert) {
    var element = $('#qunit-fixture')[0];

    var event = _testHelpers['default'].dom.createMockEvent('keypress', element, {
      key: _mobiledocKitUtilsKeys['default'].ESC,
      keyCode: _mobiledocKitUtilsKeycodes['default'].SPACE
    });
    var keyInstance = _mobiledocKitUtilsKey['default'].fromEvent(event);
    assert.ok(keyInstance.isEscape(), 'key is preferred over keyCode if supported');

    event = _testHelpers['default'].dom.createMockEvent('keypress', element, {
      keyCode: _mobiledocKitUtilsKeycodes['default'].SPACE
    });
    keyInstance = _mobiledocKitUtilsKey['default'].fromEvent(event);
    assert.ok(keyInstance.isSpace(), 'keyCode is used if key is not supported');
  });
});
define('tests/unit/utils/linked-list-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/linked-list', 'mobiledoc-kit/utils/linked-item'], function (exports, _testHelpers, _mobiledocKitUtilsLinkedList, _mobiledocKitUtilsLinkedItem) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  var INSERTION_METHODS = ['append', 'prepend', 'insertBefore', 'insertAfter'];

  _module('Unit: Utils: LinkedList');

  test('initial state', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    assert.equal(list.head, null, 'head is null');
    assert.equal(list.tail, null, 'tail is null');
    assert.equal(list.length, 0, 'length is one');
    assert.equal(list.isEmpty, true, 'isEmpty is true');
  });

  INSERTION_METHODS.forEach(function (method) {
    test('#' + method + ' initial item', function (assert) {
      var list = new _mobiledocKitUtilsLinkedList['default']();
      var item = new _mobiledocKitUtilsLinkedItem['default']();
      list[method](item);
      assert.equal(list.length, 1, 'length is one');
      assert.equal(list.isEmpty, false, 'isEmpty is false');
      assert.equal(list.head, item, 'head is item');
      assert.equal(list.tail, item, 'tail is item');
      assert.equal(item.next, null, 'item next is null');
      assert.equal(item.prev, null, 'item prev is null');
    });

    test('#' + method + ' calls adoptItem', function (assert) {
      var adoptedItem = undefined;
      var list = new _mobiledocKitUtilsLinkedList['default']({
        adoptItem: function adoptItem(item) {
          adoptedItem = item;
        }
      });
      var item = new _mobiledocKitUtilsLinkedItem['default']();
      list[method](item);
      assert.equal(adoptedItem, item, 'item is adopted');
    });

    test('#' + method + ' throws when inserting item that is already in this list', function (assert) {
      var list = new _mobiledocKitUtilsLinkedList['default']();
      var item = new _mobiledocKitUtilsLinkedItem['default']();
      list[method](item);

      assert.throws(function () {
        return list[method](item);
      }, /Cannot insert.*already in a list/);
    });

    test('#' + method + ' throws if item is in another list', function (assert) {
      var list = new _mobiledocKitUtilsLinkedList['default']();
      var otherList = new _mobiledocKitUtilsLinkedList['default']();
      var item = new _mobiledocKitUtilsLinkedItem['default']();
      var otherItem = new _mobiledocKitUtilsLinkedItem['default']();

      list[method](item);
      otherList[method](otherItem);

      assert.throws(function () {
        return list[method](otherItem);
      }, /Cannot insert.*already in a list/);
    });
  });

  test('#append second item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    assert.equal(list.length, 2, 'length is two');
    assert.equal(list.head, itemOne, 'head is itemOne');
    assert.equal(list.tail, itemTwo, 'tail is itemTwo');
    assert.equal(itemOne.prev, null, 'itemOne prev is null');
    assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
    assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
    assert.equal(itemTwo.next, null, 'itemTwo next is null');
  });

  test('#prepend additional item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    list.prepend(itemTwo);
    list.prepend(itemOne);
    assert.equal(list.length, 2, 'length is two');
    assert.equal(list.head, itemOne, 'head is itemOne');
    assert.equal(list.tail, itemTwo, 'tail is itemTwo');
    assert.equal(itemOne.prev, null, 'itemOne prev is null');
    assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
    assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
    assert.equal(itemTwo.next, null, 'itemTwo next is null');
  });

  test('#insertBefore a middle item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.prepend(itemOne);
    list.append(itemThree);
    list.insertBefore(itemTwo, itemThree);
    assert.equal(list.length, 3, 'length is three');
    assert.equal(list.head, itemOne, 'head is itemOne');
    assert.equal(list.tail, itemThree, 'tail is itemThree');
    assert.equal(itemOne.prev, null, 'itemOne prev is null');
    assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
    assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
    assert.equal(itemTwo.next, itemThree, 'itemTwo next is itemThree');
    assert.equal(itemThree.prev, itemTwo, 'itemThree prev is itemTwo');
    assert.equal(itemThree.next, null, 'itemThree next is null');
  });

  test('#insertBefore null reference item appends the item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var item1 = new _mobiledocKitUtilsLinkedItem['default']();
    var item2 = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(item1);
    list.insertBefore(item2, null);

    assert.equal(list.length, 2);
    assert.equal(list.tail, item2, 'item2 is appended');
    assert.equal(list.head, item1, 'item1 is at head');
    assert.equal(item2.prev, item1, 'item2.prev');
    assert.equal(item1.next, item2, 'item1.next');
    assert.equal(item2.next, null);
    assert.equal(item1.prev, null);
  });

  test('#insertAfter a middle item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.prepend(itemOne);
    list.append(itemThree);
    list.insertAfter(itemTwo, itemOne);

    assert.equal(list.length, 3);
    assert.equal(list.head, itemOne, 'head is itemOne');
    assert.equal(list.tail, itemThree, 'tail is itemThree');
    assert.equal(itemOne.prev, null, 'itemOne prev is null');
    assert.equal(itemOne.next, itemTwo, 'itemOne next is itemTwo');
    assert.equal(itemTwo.prev, itemOne, 'itemTwo prev is itemOne');
    assert.equal(itemTwo.next, itemThree, 'itemTwo next is itemThree');
    assert.equal(itemThree.prev, itemTwo, 'itemThree prev is itemTwo');
    assert.equal(itemThree.next, null, 'itemThree next is null');
  });

  test('#insertAfter null reference item prepends the item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var item1 = new _mobiledocKitUtilsLinkedItem['default']();
    var item2 = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(item2);
    list.insertAfter(item1, null);

    assert.equal(list.length, 2);
    assert.equal(list.head, item1, 'item2 is appended');
    assert.equal(list.tail, item2, 'item1 is at tail');
    assert.equal(item1.next, item2, 'item1.next = item2');
    assert.equal(item1.prev, null, 'item1.prev = null');
    assert.equal(item2.prev, item1, 'item2.prev = item1');
    assert.equal(item2.next, null, 'item2.next = null');
  });

  test('#remove an only item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var item = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(item);
    list.remove(item);
    assert.equal(list.length, 0, 'length is zero');
    assert.equal(list.isEmpty, true, 'isEmpty is true');
    assert.equal(list.head, null, 'head is null');
    assert.equal(list.tail, null, 'tail is null');
    assert.equal(item.prev, null, 'item prev is null');
    assert.equal(item.next, null, 'item next is null');
  });

  test('#remove calls freeItem', function (assert) {
    var freed = [];
    var list = new _mobiledocKitUtilsLinkedList['default']({
      freeItem: function freeItem(item) {
        freed.push(item);
      }
    });
    var item = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(item);
    list.remove(item);
    assert.deepEqual(freed, [item]);
  });

  test('#remove a first item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.remove(itemOne);

    assert.equal(list.length, 1);
    assert.equal(list.head, itemTwo, 'head is itemTwo');
    assert.equal(list.tail, itemTwo, 'tail is itemTwo');
    assert.equal(itemOne.prev, null, 'itemOne prev is null');
    assert.equal(itemOne.next, null, 'itemOne next is null');
    assert.equal(itemTwo.prev, null, 'itemTwo prev is null');
    assert.equal(itemTwo.next, null, 'itemTwo next is null');
  });

  test('#remove a last item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.remove(itemTwo);
    assert.equal(list.length, 1);
    assert.equal(list.head, itemOne, 'head is itemOne');
    assert.equal(list.tail, itemOne, 'tail is itemOne');
    assert.equal(itemOne.prev, null, 'itemOne prev is null');
    assert.equal(itemOne.next, null, 'itemOne next is null');
    assert.equal(itemTwo.prev, null, 'itemTwo prev is null');
    assert.equal(itemTwo.next, null, 'itemTwo next is null');
  });

  test('#remove a middle item', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);
    list.remove(itemTwo);

    assert.equal(list.length, 2);
    assert.equal(list.head, itemOne, 'head is itemOne');
    assert.equal(list.tail, itemThree, 'tail is itemThree');
    assert.equal(itemOne.prev, null, 'itemOne prev is null');
    assert.equal(itemOne.next, itemThree, 'itemOne next is itemThree');
    assert.equal(itemTwo.prev, null, 'itemTwo prev is null');
    assert.equal(itemTwo.next, null, 'itemTwo next is null');
    assert.equal(itemThree.prev, itemOne, 'itemThree prev is itemOne');
    assert.equal(itemThree.next, null, 'itemThree next is null');
  });

  test('#remove item that is not in the list is no-op', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var otherItem = new _mobiledocKitUtilsLinkedItem['default']();

    list.remove(otherItem);
    assert.equal(list.length, 0);
  });

  test('#remove throws if item is in another list', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var otherList = new _mobiledocKitUtilsLinkedList['default']();
    var otherItem = new _mobiledocKitUtilsLinkedItem['default']();

    otherList.append(otherItem);

    assert.throws(function () {
      return list.remove(otherItem);
    }, /Cannot remove.*other list/);
  });

  test('#forEach iterates many', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);
    var items = [];
    var indexes = [];
    list.forEach(function (item, index) {
      items.push(item);
      indexes.push(index);
    });
    assert.deepEqual(items, [itemOne, itemTwo, itemThree], 'items correct');
    assert.deepEqual(indexes, [0, 1, 2], 'indexes correct');
  });

  test('#forEach iterates one', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    var items = [];
    var indexes = [];
    list.forEach(function (item, index) {
      items.push(item);
      indexes.push(index);
    });
    assert.deepEqual(items, [itemOne], 'items correct');
    assert.deepEqual(indexes, [0], 'indexes correct');
  });

  test('#forEach exits early if item is removed by callback', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    [0, 1, 2].forEach(function (val) {
      var i = new _mobiledocKitUtilsLinkedItem['default']();
      i.value = val;
      list.append(i);
    });

    var iterated = [];
    list.forEach(function (item, index) {
      iterated.push(item.value);
      if (index === 1) {
        list.remove(item); // iteration stops, skipping value 2
      }
    });

    assert.deepEqual(iterated, [0, 1], 'iteration stops when item.next is null');
  });

  test('#readRange walks from start to end', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);
    var items = [];
    var indexes = [];
    list.forEach(function (item, index) {
      items.push(item);
      indexes.push(index);
    });
    assert.deepEqual(list.readRange(itemOne, itemOne), [itemOne], 'items correct');
    assert.deepEqual(list.readRange(itemTwo, itemThree), [itemTwo, itemThree], 'items correct');
    assert.deepEqual(list.readRange(itemOne, itemTwo), [itemOne, itemTwo], 'items correct');
    assert.deepEqual(list.readRange(itemOne, null), [itemOne, itemTwo, itemThree], 'items correct');
  });

  test('#toArray builds array', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    assert.deepEqual(list.toArray(), [itemOne], 'items correct');
  });

  test('#toArray builds many array', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);
    assert.deepEqual(list.toArray(), [itemOne, itemTwo, itemThree], 'items correct');
  });

  test('#detect finds', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);
    assert.equal(list.detect(function (item) {
      return item === itemOne;
    }), itemOne, 'itemOne detected');
    assert.equal(list.detect(function (item) {
      return item === itemTwo;
    }), itemTwo, 'itemTwo detected');
    assert.equal(list.detect(function (item) {
      return item === itemThree;
    }), itemThree, 'itemThree detected');
    assert.equal(list.detect(function () {
      return false;
    }), undefined, 'no item detected');
  });

  test('#detect finds w/ start', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);
    assert.equal(list.detect(function (item) {
      return item === itemOne;
    }, itemOne), itemOne, 'itemOne detected');
    assert.equal(list.detect(function (item) {
      return item === itemTwo;
    }, itemThree), null, 'no item detected');
  });

  test('#detect finds w/ reverse', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);
    assert.equal(list.detect(function (item) {
      return item === itemOne;
    }, itemOne, true), itemOne, 'itemTwo detected');
    assert.equal(list.detect(function (item) {
      return item === itemThree;
    }, itemThree, true), itemThree, 'itemThree');
  });

  test('#objectAt looks up by index', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    assert.equal(list.objectAt(0), itemOne, 'itemOne looked up');

    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemTwo);
    list.append(itemThree);
    assert.equal(list.objectAt(0), itemOne, 'itemOne looked up');
    assert.equal(list.objectAt(1), itemTwo, 'itemTwo looked up');
    assert.equal(list.objectAt(2), itemThree, 'itemThree looked up');
  });

  test('#splice removes a target and inserts an array of items', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemThree);

    list.splice(itemOne, 1, [itemTwo]);

    assert.equal(list.head, itemTwo, 'itemOne is head');
    assert.equal(list.objectAt(1), itemThree, 'itemThree is present');
  });

  test('#splice remove nothing and inserts an array of nothing', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);

    list.splice(itemTwo, 0, []);

    assert.equal(list.head, itemOne, 'itemOne is head');
    assert.equal(list.objectAt(1), itemTwo, 'itemTwo is present');
  });

  test('#splice can reorganize items', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var itemOne = new _mobiledocKitUtilsLinkedItem['default']();
    var itemTwo = new _mobiledocKitUtilsLinkedItem['default']();
    var itemThree = new _mobiledocKitUtilsLinkedItem['default']();
    list.append(itemOne);
    list.append(itemTwo);
    list.append(itemThree);

    list.splice(itemOne, 3, [itemThree, itemOne, itemTwo]);

    assert.equal(list.head, itemThree, 'itemThree is head');
    assert.equal(list.objectAt(1), itemOne, 'itemOne is present');
    assert.equal(list.objectAt(2), itemTwo, 'itemTwo is present');
  });

  test('#removeBy mutates list when item is in middle', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var items = [new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default']()];
    items[1].shouldRemove = true;
    items.forEach(function (i) {
      return list.append(i);
    });

    assert.equal(list.length, 4);
    list.removeBy(function (i) {
      return i.shouldRemove;
    });
    assert.equal(list.length, 3);
    assert.equal(list.head, items[0]);
    assert.equal(list.objectAt(1), items[2]);
    assert.equal(list.objectAt(2), items[3]);
    assert.equal(list.tail, items[3]);
  });

  test('#removeBy mutates list when item is first', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var items = [new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default']()];
    items[0].shouldRemove = true;
    items.forEach(function (i) {
      return list.append(i);
    });

    assert.equal(list.length, 4);
    list.removeBy(function (i) {
      return i.shouldRemove;
    });
    assert.equal(list.length, 3);
    assert.equal(list.head, items[1]);
    assert.equal(list.objectAt(1), items[2]);
    assert.equal(list.tail, items[3]);
  });

  test('#removeBy mutates list when item is last', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    var items = [new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default']()];
    items[3].shouldRemove = true;
    items.forEach(function (i) {
      return list.append(i);
    });

    assert.equal(list.length, 4);
    list.removeBy(function (i) {
      return i.shouldRemove;
    });
    assert.equal(list.length, 3);
    assert.equal(list.head, items[0]);
    assert.equal(list.objectAt(1), items[1]);
    assert.equal(list.tail, items[2]);
  });

  test('#removeBy calls `freeItem` for each item removed', function (assert) {
    var freed = [];

    var list = new _mobiledocKitUtilsLinkedList['default']({
      freeItem: function freeItem(item) {
        freed.push(item);
      }
    });

    var items = [new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default'](), new _mobiledocKitUtilsLinkedItem['default']()];
    items[0].name = '0';
    items[1].name = '1';
    items[2].name = '2';

    items[0].shouldRemove = true;
    items[1].shouldRemove = true;

    items.forEach(function (i) {
      return list.append(i);
    });

    list.removeBy(function (i) {
      return i.shouldRemove;
    });

    assert.deepEqual(freed, [items[0], items[1]]);
  });

  test('#every', function (assert) {
    var list = new _mobiledocKitUtilsLinkedList['default']();
    [2, 3, 4].forEach(function (n) {
      return list.append({ val: n });
    });

    assert.ok(list.every(function (i) {
      return i.val > 0;
    }), '> 0');
    assert.ok(!list.every(function (i) {
      return i.val % 2 === 0;
    }), 'even');
  });
});
define('tests/unit/utils/object-utils-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/object-utils'], function (exports, _testHelpers, _mobiledocKitUtilsObjectUtils) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: Object Utils');

  test('#entries works', function (assert) {
    assert.deepEqual((0, _mobiledocKitUtilsObjectUtils.entries)({ hello: 'world', goodbye: 'moon' }), [['hello', 'world'], ['goodbye', 'moon']]);
  });
});
define('tests/unit/utils/parse-utils-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/parse-utils'], function (exports, _testHelpers, _mobiledocKitUtilsParseUtils) {
  'use strict';

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: Parse Utils');

  test('#getContentFromPasteEvent reads from clipboardData', function (assert) {
    var _expected;

    var element = null;
    var expected = (_expected = {}, _defineProperty(_expected, _mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN, 'text'), _defineProperty(_expected, _mobiledocKitUtilsParseUtils.MIME_TEXT_HTML, '<p>html</p>'), _expected);
    var event = _testHelpers['default'].dom.createMockEvent('paste', element, {
      clipboardData: {
        getData: function getData(type) {
          return expected[type];
        }
      }
    });
    var mockWindow = {
      clipboardData: {
        getData: function getData() {
          assert.ok(false, 'should not get clipboard data from window');
        }
      }
    };

    var _getContentFromPasteEvent = (0, _mobiledocKitUtilsParseUtils.getContentFromPasteEvent)(event, mockWindow);

    var html = _getContentFromPasteEvent.html;
    var text = _getContentFromPasteEvent.text;

    assert.equal(html, expected[_mobiledocKitUtilsParseUtils.MIME_TEXT_HTML], 'correct html');
    assert.equal(text, expected[_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN], 'correct text');
  });

  test('#getContentFromPasteEvent reads data from window.clipboardData when event.clipboardData is not present (IE compat)', function (assert) {
    assert.expect(3);
    var element = null;
    var event = _testHelpers['default'].dom.createMockEvent('paste', element, { clipboardData: null });
    var requestedType = undefined;
    var expectedHTML = 'hello';
    var expectedText = '';
    var mockWindow = {
      clipboardData: {
        getData: function getData(type) {
          requestedType = type;
          return expectedHTML;
        }
      }
    };

    var _getContentFromPasteEvent2 = (0, _mobiledocKitUtilsParseUtils.getContentFromPasteEvent)(event, mockWindow);

    var html = _getContentFromPasteEvent2.html;
    var text = _getContentFromPasteEvent2.text;

    assert.equal(requestedType, _mobiledocKitUtilsParseUtils.NONSTANDARD_IE_TEXT_TYPE, 'requests IE nonstandard mime type');
    assert.equal(html, expectedHTML, 'correct html');
    assert.equal(text, expectedText, 'correct text');
  });

  test('#setClipboardData uses event.clipboardData.setData when available', function (assert) {
    var element = null;
    var _setData = {};
    var data = {
      html: '<p>html</p>',
      text: 'text'
    };
    var event = _testHelpers['default'].dom.createMockEvent('copy', element, {
      clipboardData: {
        setData: function setData(type, value) {
          _setData[type] = value;
        }
      }
    });
    var mockWindow = {
      clipboardData: {
        setData: function setData() {
          assert.ok(false, 'should not set clipboard data on window');
        }
      }
    };

    (0, _mobiledocKitUtilsParseUtils.setClipboardData)(event, data, mockWindow);

    assert.equal(_setData[_mobiledocKitUtilsParseUtils.MIME_TEXT_HTML], data.html);
    assert.equal(_setData[_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN], data.text);
  });

  test('#setClipboardData uses window.clipboardData.setData when event.clipboardData not present (IE compat)', function (assert) {
    var element = null;
    var _setData2 = {};
    var data = {
      html: '<p>html</p>',
      text: 'text'
    };
    var event = _testHelpers['default'].dom.createMockEvent('paste', element, {
      clipboardData: null
    });
    var mockWindow = {
      clipboardData: {
        setData: function setData(type, value) {
          _setData2[type] = value;
        }
      }
    };

    (0, _mobiledocKitUtilsParseUtils.setClipboardData)(event, data, mockWindow);

    assert.equal(_setData2[_mobiledocKitUtilsParseUtils.NONSTANDARD_IE_TEXT_TYPE], data.html, 'sets NONSTANDARD_IE_TEXT_TYPE type');
    assert.ok(!_setData2[_mobiledocKitUtilsParseUtils.MIME_TEXT_HTML], 'does not set MIME_TEXT_HTML');
    assert.ok(!_setData2[_mobiledocKitUtilsParseUtils.MIME_TEXT_PLAIN], 'does not set MIME_TEXT_PLAIN');
  });
});
define('tests/unit/utils/selection-utils-test', ['exports', '../../test-helpers', 'mobiledoc-kit/utils/selection-utils', 'mobiledoc-kit/utils/key'], function (exports, _testHelpers, _mobiledocKitUtilsSelectionUtils, _mobiledocKitUtilsKey) {
  'use strict';

  var _module = _testHelpers['default'].module;
  var test = _testHelpers['default'].test;

  _module('Unit: Utils: Selection Utils');

  test('#comparePosition returns the forward direction of selection', function (assert) {
    var div = document.createElement('div');
    div.innerHTML = 'Howdy';
    var selection = {
      anchorNode: div,
      anchorOffset: 0,
      focusNode: div,
      focusOffset: 1
    };
    var result = (0, _mobiledocKitUtilsSelectionUtils.comparePosition)(selection);
    assert.equal(_mobiledocKitUtilsKey.DIRECTION.FORWARD, result.direction);
  });

  test('#comparePosition returns the backward direction of selection', function (assert) {
    var div = document.createElement('div');
    div.innerHTML = 'Howdy';
    var selection = {
      anchorNode: div,
      anchorOffset: 1,
      focusNode: div,
      focusOffset: 0
    };
    var result = (0, _mobiledocKitUtilsSelectionUtils.comparePosition)(selection);
    assert.equal(_mobiledocKitUtilsKey.DIRECTION.BACKWARD, result.direction);
  });

  test('#comparePosition returns the direction of selection across nodes', function (assert) {
    var div = document.createElement('div');
    div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
    var selection = {
      anchorNode: div.childNodes[0],
      anchorOffset: 1,
      focusNode: div.childNodes[2],
      focusOffset: 0
    };
    var result = (0, _mobiledocKitUtilsSelectionUtils.comparePosition)(selection);
    assert.equal(_mobiledocKitUtilsKey.DIRECTION.FORWARD, result.direction);
  });

  test('#comparePosition returns the backward direction of selection across nodes', function (assert) {
    var div = document.createElement('div');
    div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
    var selection = {
      anchorNode: div.childNodes[2],
      anchorOffset: 1,
      focusNode: div.childNodes[1],
      focusOffset: 0
    };
    var result = (0, _mobiledocKitUtilsSelectionUtils.comparePosition)(selection);
    assert.equal(_mobiledocKitUtilsKey.DIRECTION.BACKWARD, result.direction);
  });

  test('#comparePosition returns the direction of selection with nested nodes', function (assert) {
    var div = document.createElement('div');
    div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
    var selection = {
      anchorNode: div,
      anchorOffset: 1,
      focusNode: div.childNodes[1],
      focusOffset: 1
    };
    var result = (0, _mobiledocKitUtilsSelectionUtils.comparePosition)(selection);
    assert.equal(_mobiledocKitUtilsKey.DIRECTION.FORWARD, result.direction);
  });

  test('#comparePosition returns the backward direction of selection with nested nodes', function (assert) {
    var div = document.createElement('div');
    div.innerHTML = '<span>Howdy</span> <span>Friend</span>';
    var selection = {
      anchorNode: div.childNodes[2],
      anchorOffset: 1,
      focusNode: div,
      focusOffset: 2
    };
    var result = (0, _mobiledocKitUtilsSelectionUtils.comparePosition)(selection);
    assert.equal(_mobiledocKitUtilsKey.DIRECTION.BACKWARD, result.direction);
  });
});//# sourceMappingURL=built-amd-tests.map

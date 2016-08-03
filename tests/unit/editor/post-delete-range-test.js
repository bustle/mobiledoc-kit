import Helpers from '../../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';
import { forEach } from 'mobiledoc-kit/utils/array-utils';

const { module, test } = Helpers;

let { postEditor: { run } } = Helpers;
let { postAbstract: { buildFromText } } = Helpers;

module('Unit: PostEditor: #deleteRange');

test('#deleteRange with collapsed range is no-op', (assert) => {
  let { post, range } = buildFromText('abc|def');
  let { post: expectedPost, range: expectedRange } = buildFromText('abc|def');

  let position = run(post, postEditor => postEditor.deleteRange(range));
  let renderedRange = new Range(position);

  expectedRange = Range.create(post.sections.head, expectedRange.head.offset);

  assert.postIsSimilar(post, expectedPost);
  assert.rangeIsEqual(renderedRange, expectedRange);
});

test('#deleteRange within a section (single section)', (assert) => {
  let examples = [
    ['ab<c>', 'ab|', 'at tail'],
    ['<a>bc', '|bc', 'at head'],
    ['a<b>c', 'a|c', 'middle']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range } = buildFromText(before);
    let { post: expectedPost, range: expectedRange } = buildFromText(after);

    let position = run(post, postEditor => postEditor.deleteRange(range));
    let renderedRange = new Range(position);

    expectedRange = Range.create(post.sections.head, expectedRange.head.offset);

    assert.postIsSimilar(post, expectedPost, `post (${msg})`);
    assert.rangeIsEqual(renderedRange, expectedRange, `range (${msg})`);
  });
});

test('#deleteRange within a section with markup (single section)', (assert) => {
  let examples = [
    ['abc <*def*> ghi', 'abc | ghi', 'entire markup in middle'],
    ['abc *de<f* ghi>', 'abc *de|*', 'partial markup at end'],
    ['abc *de<f* g>hi', 'abc *de|*hi', 'partial markup in middle (right)'],
    ['ab<c *de>f* ghi', 'ab*|f* ghi', 'partial markup in middle (left)'],
    ['<abc *de>f* ghi', '*|f* ghi', 'partial markup at start'],
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range } = buildFromText(before);
    let { post: expectedPost, range: expectedRange } = buildFromText(after);

    let position = run(post, postEditor => postEditor.deleteRange(range));
    let renderedRange = new Range(position);

    expectedRange = Range.create(post.sections.head, expectedRange.head.offset);

    assert.postIsSimilar(post, expectedPost, `post (${msg})`);
    assert.rangeIsEqual(renderedRange, expectedRange, `range (${msg})`);
  });
});

test('#deleteRange entire post', (assert) => {
  let examples = [
    [['<abc>'], 'single section'],
    [['<[some-card]>'], 'single card'],
    [['<abc','def','ghi>'], 'multiple sections'],
    [['<>'], 'single blank section'],
    [['<','','>'], 'multiple blank sections'],
    [['<[some-card]', 'abc', '[some-card]>'], 'cards at head/tail, containing markup section'],
    [['<abc', '[some-card]', 'def>'], 'markup sections containing card'],
    [['<[some-card]', 'abc>'], 'card->markup'],
    [['<abc', '[some-card]>'], 'markup->card'],
  ];

  examples.forEach(([text, msg]) => {
    let { post, range } = buildFromText(text);
    let position = run(post, postEditor => postEditor.deleteRange(range));

    assert.ok(post.sections.length === 1 && post.sections.head.isBlank, `post has single blank section after deleteRange (${msg})`);
    assert.ok(position.section === post.sections.head, `position#section is correct (${msg})`);
    assert.equal(position.offset, 0, `position#offset is correct (${msg})`);
  });
});

test('#deleteRange across markup section boundaries', (assert) => {
  let examples = [
    [['abc<', '>def'], 'abc|def', 'at boundary'],
    [['abc<', 'd>ef'], 'abc|ef', 'boundary into next section'],
    [['ab<c', '>def'], 'ab|def', 'section into boundary'],
    [['ab<c', 'd>ef'], 'ab|ef', 'containing boundary'],

    [['abc<', 'def', '>ghi'], 'abc|ghi', 'across section at boundary'],
    [['abc<', 'def', 'g>hi'], 'abc|hi', 'across section boundary containing next section'],
    [['ab<c', 'def', '>ghi'], 'ab|ghi', 'across section boundary containing before section'],
    [['ab<c', 'def', 'g>hi'], 'ab|hi', 'across section boundary containing before and after section'],
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range } = buildFromText(before);
    let { post: expectedPost, range: expectedRange } = buildFromText(after);

    let position = run(post, postEditor => postEditor.deleteRange(range));
    let renderedRange = new Range(position);

    expectedRange = Range.create(post.sections.head, expectedRange.head.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.rangeIsEqual(renderedRange, expectedRange, `range ${msg}`);
  }); 
});

test('#deleteRange across markup section boundaries including markups', (assert) => {
  let examples = [
    [['*abc*<', '>def'], '*abc*|def', 'at boundary (left markup)'],
    [['*abc*<', 'd>ef'], '*abc*|ef', 'boundary into next section (left markup)'],
    [['*ab<c*', '>def'], '*ab*|def', 'section into boundary (left markup)'],
    [['*ab<c*', 'd>ef'], '*ab*|ef', 'containing boundary (left markup)'],

    [['abc<', '*>def*'], 'abc|*def*', 'at boundary (right markup)'],
    [['abc<', '*d>ef*'], 'abc|*ef*', 'boundary into next section (right markup)'],
    [['ab<c', '*>def*'], 'ab|*def*', 'section into boundary (right markup)'],
    [['ab<c', '*d>ef*'], 'ab|*ef*', 'containing boundary (right markup)'],

    [['abc<', '*def*', '>ghi'], 'abc|ghi', 'across section at boundary (containing markup)'],
    [['abc<', '*def*', 'g>hi'], 'abc|hi', 'across section boundary containing next section (containing markup)'],
    [['ab<c', '*def*', '>ghi'], 'ab|ghi', 'across section boundary containing before section (containing markup)'],
    [['ab<c', '*def*', 'g>hi'], 'ab|hi', 'across section boundary containing before and after section (containing markup)'],

    [['abc<', '*def*', '>*g*hi'], 'abc|*g*hi', 'across section at boundary (into markup)'],
    [['abc<', '*def*', '*g*>hi'], 'abc|hi', 'across section boundary containing next section (into markup)'],
    [['ab<c', '*def*', '>*g*hi'], 'ab|*g*hi', 'across section boundary containing before section (into markup)'],
    [['ab<c', '*def*', '*g*>hi'], 'ab|hi', 'across section boundary containing before and after section (into markup)'],
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range } = buildFromText(before);
    let { post: expectedPost, range: expectedRange } = buildFromText(after);

    let position = run(post, postEditor => postEditor.deleteRange(range));
    let renderedRange = new Range(position);

    expectedRange = Range.create(post.sections.head, expectedRange.head.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.rangeIsEqual(renderedRange, expectedRange, `range ${msg}`);
  }); 
});

test('#deleteRange across markup/non-markup section boundaries', (assert) => {
  let examples = [
    [['[some-card]<','>abc'], ['[some-card]|', 'abc'], 'card->markup start'], 
    [['[some-card]<','>'], ['[some-card]|'], 'card->blank-markup'], 
    [['<[some-card]','a>bc'], ['|bc'], 'card->markup inner'], 

    [['abc<','>[some-card]'], ['abc|', '[some-card]'], 'markup->card'], 

    [['abc<', '[some-card]', '>def'], ['abc|def'], 'containing card, boundaries in outer sections'],

    [['abc', '<[some-card]>', 'def'], ['abc', '|', 'def'], 'containing card, boundaries in card section'],

    [['<', '>[some-card]'], ['|[some-card]'], 'blank section into card']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range } = buildFromText(before);

    let { post: expectedPost, range: expectedRange } = buildFromText(after);

    let position = run(post, postEditor => postEditor.deleteRange(range));
    let renderedRange = new Range(position);

    // FIXME need to figure out how to say which section to expect the range to include
    let sectionIndex;
    forEach(expectedPost.sections, (section, index) => {
      if (section === expectedRange.head.section) { sectionIndex = index; }
    });
    expectedRange = Range.create(post.sections.objectAt(sectionIndex),
                                 expectedRange.head.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.rangeIsEqual(renderedRange, expectedRange, `range ${msg}`);
  }); 
});

test('#deleteRange across list items', (assert) => {
  let examples = [
    [['* item 1<', '* >item 2'], ['* item 1|item 2'], 'at boundary'],
    [['* item <1', '* i>tem 2'], ['* item |tem 2'], 'surrounding boundary'],
    [['* item 1<', '* i>tem 2'], ['* item 1|tem 2'], 'boundary to next'],
    [['* item <1', '* >item 2'], ['* item |item 2'], 'prev to boundary'],

    [['* item 1<', '* middle', '* >item 2'], ['* item 1|item 2'], 'across item at boundary'],
    [['* item <1', '* middle', '* i>tem 2'], ['* item |tem 2'], 'across item surrounding boundary'],
    [['* item <1', '* middle', '* >item 2'], ['* item |item 2'], 'across item prev to boundary'],
    [['* item 1<', '* middle', '* i>tem 2'], ['* item 1|tem 2'], 'across item boundary to next'],

    [['* item 1<', 'middle', '* >item 2'], ['* item 1|item 2'], 'across markup at boundary'],
    [['* item <1', 'middle', '* i>tem 2'], ['* item |tem 2'], 'across markup surrounding boundary'],

    [['* item 1', '<middle', '* i>tem 2'], ['* item 1', '|tem 2'], 'across markup into next'],

    [['* item 1<', '>middle'], ['* item 1|middle'], 'item tail to markup head'],
    [['start<', '* >middle'], ['start|middle'], 'markup tail to item head'],

    [['* <','>abc'], ['* |abc'], 'empty li into markup start'],
    [['* <','a>bc'], ['* |bc'], 'empty li into markup middle'],
    [['* <','abc>'], ['* |'], 'empty li into markup end'],
    [['* abc<','>'], ['* abc|'], 'li into empty markup'],
    [['* <','>'], ['* |'], 'empty li into empty markup'],
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range } = buildFromText(before);
    let { post: expectedPost, range: expectedRange } = buildFromText(after);

    let position = run(post, postEditor => postEditor.deleteRange(range));
    let renderedRange = new Range(position);

    // FIXME need to figure out how to say which section to expect the range to include
    let sectionIndex;
    let index = 0;
    expectedPost.walkAllLeafSections(section => {
      if (section === expectedRange.head.section) { sectionIndex = index; }
      index++;
    });

    let section;
    index = 0;
    post.walkAllLeafSections(_section => {
      if (index === sectionIndex) { section = _section; }
      index++;
    });
    expectedRange = Range.create(section, expectedRange.head.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.rangeIsEqual(renderedRange, expectedRange, `range ${msg}`);
  });
});

test('#deleteRange with atoms', (assert) => {
  let examples = [
    ['abc<@>def', 'abc|def', 'surrounding'],
    ['abc<@d>ef', 'abc|ef', 'into atom into next marker'],
    ['ab<c@>def', 'ab|def', 'into marker into atom'],

    ['ab<c>@def', 'ab|@def', 'prev boundary'],
    ['abc@<d>ef', 'abc@|ef', 'next boundary']
  ];

  examples.forEach(([before, after, msg]) => {
    let { post, range } = buildFromText(before);
    let { post: expectedPost, range: expectedRange } = buildFromText(after);

    let position = run(post, postEditor => postEditor.deleteRange(range));
    let renderedRange = new Range(position);

    expectedRange = Range.create(post.sections.head, expectedRange.head.offset);

    assert.postIsSimilar(post, expectedPost, `post ${msg}`);
    assert.rangeIsEqual(renderedRange, expectedRange, `range ${msg}`);
  });
});

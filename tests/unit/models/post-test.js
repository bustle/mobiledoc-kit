import Helpers from '../../test-helpers';
import Range from 'mobiledoc-kit/utils/cursor/range';
import Position from 'mobiledoc-kit/utils/cursor/position';

const {module, test} = Helpers;

module('Unit: Post');

test('#walkMarkerableSections finds no section when range contains only a card', (assert) => {
  const post = Helpers.postAbstract.build(builder => {
    const {post, cardSection} = builder;

    return post([cardSection('simple-card')]);
  });

  let foundSections = [];

  const card = post.sections.objectAt(0);
  const range = Range.create(card, 0, card, 0);

  post.walkMarkerableSections(range, s => foundSections.push(s));
  assert.equal(foundSections.length, 0, 'found no markerable sections');
});

test('#walkMarkerableSections skips non-markerable sections', (assert) => {
  const post = Helpers.postAbstract.build(builder => {
    const {post, markupSection, marker, cardSection} = builder;

    return post([
      markupSection('p', ['s1m1'].map(t => marker(t))),
      markupSection('p', ['s2m1'].map(t => marker(t))),
      cardSection('simple-card'),
      markupSection('p', ['s3m1'].map(t => marker(t))),
      markupSection('p', ['s4m1'].map(t => marker(t)))
    ]);
  });

  let foundSections = [];

  const s1 = post.sections.objectAt(0);
  const s4 = post.sections.objectAt(4);

  assert.equal(s1.text, 's1m1', 'precond - find s1');
  assert.equal(s4.text, 's4m1', 'precond - find s4');

  const range = Range.create(s1, 0, s4, 0);

  post.walkMarkerableSections(range, s => foundSections.push(s));

  assert.deepEqual(foundSections.map(s => s.text),
                   ['s1m1', 's2m1', 's3m1', 's4m1'],
                   'iterates correct sections');

});

test('#walkAllLeafSections returns markup section that follows a list section', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker, listSection, listItem}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('def')]),
      listSection('ul', [
        listItem([marker('123')])
      ]),
      markupSection('p')
    ]);
  });

  let sections = [];
  post.walkAllLeafSections(s => sections.push(s));

  assert.equal(sections.length, 4);
  assert.ok(sections[0] === post.sections.head, 'section 0');
  assert.ok(sections[1] === post.sections.objectAt(1), 'section 1');
  assert.ok(sections[2] === post.sections.objectAt(2).items.head, 'section 2');
  assert.ok(sections[3] === post.sections.tail, 'section 3');
});

test('#markupsInRange returns all markups when range is not collapsed', (assert) => {
  let b, i, a1, a2, found, collapsedRange;
  const post = Helpers.postAbstract.build(builder => {
    const {post, markupSection, cardSection, marker, markup} = builder;

    b  = markup('strong');
    i  = markup('em');
    a1 = markup('a', {href:'example.com'});
    a2 = markup('a', {href:'other-example.com'});

    return post([
      markupSection('p', [
        marker('plain text'),
        marker('bold text', [b]),
        marker('i text', [i]),
        marker('bold+i text', [b, i])
      ]),
      markupSection('p', [
        marker('link 1', [a1])
      ]),
      cardSection('simple-card'),
      markupSection('p', [
        marker('link 2', [a2])
      ])
    ]);
  });

  const [s1, s2,, s3] = post.sections.toArray();

  assert.equal(s1.text, 'plain textbold texti textbold+i text', 'precond s1');
  assert.equal(s2.text, 'link 1', 'precond s2');
  assert.equal(s3.text, 'link 2', 'precond s3');

  collapsedRange = Range.create(s1, 0);
  assert.equal(post.markupsInRange(collapsedRange).length, 0,
               'no markups in collapsed range at start');

  collapsedRange = Range.create(s1, 'plain text'.length);
  assert.equal(post.markupsInRange(collapsedRange).length, 0,
               'no markups in collapsed range at end of plain text');

  collapsedRange = Range.create(s1, 'plain textbold'.length);
  found = post.markupsInRange(collapsedRange);
  assert.equal(found.length, 1, 'markup in collapsed range in bold text');
  assert.inArray(b, found, 'finds b in bold text');

  collapsedRange = Range.create(s1, 'plain textbold text'.length);
  found = post.markupsInRange(collapsedRange);
  assert.equal(found.length, 1, 'markup in collapsed range at end of bold text');
  assert.inArray(b, found, 'finds b at end of bold text');

  const simpleRange = Range.create(s1, 0, s1, 'plain text'.length);
  assert.equal(post.markupsInRange(simpleRange).length, 0,
               'no markups in simple range');

  const singleMarkerRange = Range.create(s1, 'plain textb'.length,
                                      s1, 'plain textbold'.length);
  found = post.markupsInRange(singleMarkerRange);
  assert.equal(found.length, 1, 'finds markup in marker');
  assert.inArray(b, found, 'finds b');

  const singleSectionRange = Range.create(s1, 0, s1, s1.length);
  found = post.markupsInRange(singleSectionRange);
  assert.equal(found.length, 2, 'finds both markups in section');
  assert.inArray(b, found, 'finds b');
  assert.inArray(i, found, 'finds i');

  const multiSectionRange = Range.create(s1, 'plain textbold te'.length,
                                      s2, 'link'.length);
  found = post.markupsInRange(multiSectionRange);
  assert.equal(found.length, 3, 'finds all markups in multi-section range');
  assert.inArray(b, found, 'finds b');
  assert.inArray(i, found, 'finds i');
  assert.inArray(a1, found, 'finds a1');

  const rangeSpanningCard = Range.create(s1, 0, s3, 'link'.length);
  found = post.markupsInRange(rangeSpanningCard);
  assert.equal(found.length, 4, 'finds all markups in spanning section range');
  assert.inArray(b, found, 'finds b');
  assert.inArray(i, found, 'finds i');
  assert.inArray(a1, found, 'finds a1');
  assert.inArray(a2, found, 'finds a2');
});

test('#markupsInRange obeys left- and right-inclusive rules for "A" markups', (assert) => {
  let a;
  let post = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    a = markup('a', {href: 'example.com'});
    return post([markupSection('p', [
      marker('123', [a]),
      marker(' abc '),
      marker('def', [a]),
      marker(' ghi '),
      marker('jkl', [a])
    ])]);
  });

  let section = post.sections.head;
  let start = Range.create(section, 0);
  let left = Range.create(section, '123 abc '.length);
  let inside = Range.create(section, '123 abc d'.length);
  let right = Range.create(section, '123 abc def'.length);
  let end = Range.create(section, '123 abc def ghi jkl'.length);

  assert.deepEqual(post.markupsInRange(start), [], 'no markups at start');
  assert.deepEqual(post.markupsInRange(left), [], 'no markups at left');
  assert.deepEqual(post.markupsInRange(right), [], 'no markups at right');
  assert.deepEqual(post.markupsInRange(inside), [a], '"A" markup inside range');
  assert.deepEqual(post.markupsInRange(end), [], 'no markups at end');
});

test('#markersContainedByRange when range is single marker', (assert) => {
  let found;
  const post = Helpers.postAbstract.build(({post, marker, markupSection}) => {
    return post([markupSection('p', [marker('abc')])]);
  });

  const innerRange = Range.create(post.sections.head, 1, post.sections.head, 2);
  found = post.markersContainedByRange(innerRange);
  assert.equal(found.length, 0, '0 markers in innerRange');

  const outerRange = Range.create(post.sections.head, 0, post.sections.head, 3);
  found = post.markersContainedByRange(outerRange);
  assert.equal(found.length, 1, '1 marker in outerRange');
  assert.ok(found[0] === post.sections.head.markers.head, 'finds right marker');
});

test('#markersContainedByRange when range is single section', (assert) => {
  let found;
  const post = Helpers.postAbstract.build(({post, marker, markupSection}) => {
    return post([markupSection('p', [
      marker('abc'), marker('def'), marker('ghi')
    ])]);
  });

  const section = post.sections.head;

  const innerRange = Range.create(section, 2, section, 4);
  found = post.markersContainedByRange(innerRange);
  assert.equal(found.length, 0, '0 markers in innerRange');

  const middleRange = Range.create(section, 2, section, 7);
  found = post.markersContainedByRange(middleRange);
  assert.equal(found.length, 1, '1 markers in middleRange');
  assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

  const middleRangeLeftFencepost = Range.create(section, 3, section, 7);
  found = post.markersContainedByRange(middleRangeLeftFencepost);
  assert.equal(found.length, 1, '1 markers in middleRangeLeftFencepost');
  assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

  const middleRangeRightFencepost = Range.create(section, 2, section, 6);
  found = post.markersContainedByRange(middleRangeRightFencepost);
  assert.equal(found.length, 1, '1 markers in middleRangeRightFencepost');
  assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

  const middleRangeBothFencepost = Range.create(section, 3, section, 6);
  found = post.markersContainedByRange(middleRangeBothFencepost);
  assert.equal(found.length, 1, '1 markers in middleRangeBothFencepost');
  assert.ok(found[0] === section.markers.objectAt(1), 'finds right marker');

  const outerRange = Range.create(section, 0, section, section.length);
  found = post.markersContainedByRange(outerRange);
  assert.equal(found.length, section.markers.length, 'all markers in outerRange');
});

test('#markersContainedByRange when range is contiguous sections', (assert) => {
  let found;
  const post = Helpers.postAbstract.build(({post, marker, markupSection}) => {
    return post([
      markupSection('p', [marker('abc'), marker('def'), marker('ghi')]),
      markupSection('p', [marker('123'), marker('456'), marker('789')])
    ]);
  });

  const headSection = post.sections.head, tailSection = post.sections.tail;

  const innerRange = Range.create(headSection, 7, tailSection, 2);
  found = post.markersContainedByRange(innerRange);
  assert.equal(found.length, 0, '0 markers in innerRange');

  const middleRange = Range.create(headSection, 5, tailSection, 4);
  found = post.markersContainedByRange(middleRange);
  assert.equal(found.length, 2, '2 markers in middleRange');
  assert.ok(found[0] === headSection.markers.objectAt(2), 'finds right head marker');
  assert.ok(found[1] === tailSection.markers.objectAt(0), 'finds right tail marker');

  const middleRangeLeftFencepost = Range.create(headSection, 6, tailSection, 2);
  found = post.markersContainedByRange(middleRangeLeftFencepost);
  assert.equal(found.length, 1, '1 markers in middleRangeLeftFencepost');
  assert.ok(found[0] === headSection.markers.objectAt(2), 'finds right head marker');

  const middleRangeRightFencepost = Range.create(headSection, 7, tailSection, 3);
  found = post.markersContainedByRange(middleRangeRightFencepost);
  assert.equal(found.length, 1, '1 markers in middleRangeRightFencepost');
  assert.ok(found[0] === tailSection.markers.objectAt(0), 'finds right marker');

  const middleRangeBothFencepost = Range.create(headSection, 6, tailSection, 3);
  found = post.markersContainedByRange(middleRangeBothFencepost);
  assert.equal(found.length, 2, '2 markers in middleRangeBothFencepost');
  assert.ok(found[0] === headSection.markers.objectAt(2), 'finds right head marker');
  assert.ok(found[1] === tailSection.markers.objectAt(0), 'finds right tail marker');

  const outerRange = Range.create(headSection, 0, tailSection, tailSection.length);
  found = post.markersContainedByRange(outerRange);
  assert.equal(found.length,
               headSection.markers.length + tailSection.markers.length,
               'all markers in outerRange');
});

test('#isBlank is true when there are no sections', (assert) => {
  let _post, _section;
  Helpers.postAbstract.build(({post, markupSection}) => {
    _post = post();
    _section = markupSection();
  });
  assert.ok(_post.isBlank);
  _post.sections.append(_section);
  assert.ok(!_post.isBlank);
});

test('#trimTo creates a post from the given range', (assert) => {
  let post = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  const section = post.sections.head;
  const range = Range.create(section,1,section,2); // "b"

  post = post.trimTo(range);
  let expected = Helpers.postAbstract.build(({post, marker, markupSection}) => {
    return post([markupSection('p',[marker('b')])]);
  });

  assert.postIsSimilar(post, expected);
});

test('#trimTo copies card sections', (assert) => {
  let cardPayload = {foo: 'bar'};

  let buildPost = Helpers.postAbstract.build;

  let post = buildPost(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('test-card', cardPayload),
      markupSection('p', [marker('123')])
    ]);
  });

  const range = Range.create(post.sections.head, 1,  // 'b'
                             post.sections.tail, 1); // '2'

  post = post.trimTo(range);
  let expected = buildPost(
    ({post, marker, markupSection, cardSection}) => {
    return post([
      markupSection('p',[marker('bc')]),
      cardSection('test-card', {foo: 'bar'}),
      markupSection('p',[marker('1')])
    ]);
  });

  assert.postIsSimilar(post, expected);
});


test('#trimTo appends new p section when tail section is not selected and is a non-markerable section', assert => {
  let cardPayload = { foo: 'bar' };

  let buildPost = Helpers.postAbstract.build;

  let post = buildPost(({ post, markupSection, marker, cardSection }) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('test-card', cardPayload)
    ]);
  });

  const range = Range.create(post.sections.head, 1, // b
                             post.sections.tail, 0); // start of card

  post = post.trimTo(range);
  let expected = buildPost(({ post, marker, markupSection, cardSection }) => {
    return post([
      markupSection('p', [marker('bc')]),
      markupSection('p', [marker('')]),
      cardSection('test-card', cardPayload)
    ]);
  });

  const newSection = expected.sections.head.next;
  assert.equal(expected.sections.length, 3);
  assert.equal(newSection.tagName, 'p');
  assert.equal(newSection.isBlank, true);
});

test('#trimTo appends new p section when tail section is not selected and is a markerable section', assert => {
  let cardPayload = { foo: 'bar' };

  let buildPost = Helpers.postAbstract.build;

  let post = buildPost(({ post, markupSection, marker }) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  const range = Range.create(post.sections.head, 1, // b
                             post.sections.tail, 0); // start of 123

  post = post.trimTo(range);
  let expected = buildPost(({ post, marker, markupSection }) => {
    return post([
      markupSection('p', [marker('bc')]),
      markupSection('p', [marker('')]),
      markupSection('p', [marker('123')])
    ]);
  });

  const newSection = expected.sections.head.next;
  assert.equal(expected.sections.length, 3);
  assert.equal(newSection.tagName, 'p');
  assert.equal(newSection.isBlank, true);
});


test('#trimTo when range starts and ends in a list item', (assert) => {
  let buildPost = Helpers.postAbstract.build;

  let post = buildPost(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('abc')])])]);
  });

  let range = Range.create(post.sections.head.items.head, 0,
                           post.sections.head.items.head, 'ab'.length);

  post = post.trimTo(range);
  let expected = buildPost(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [listItem([marker('ab')])])]);
  });

  assert.postIsSimilar(post, expected);
});

test('#trimTo when range contains multiple list items', (assert) => {
  let buildPost = Helpers.postAbstract.build;

  let post = buildPost(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [
      listItem([marker('abc')]),
      listItem([marker('def')]),
      listItem([marker('ghi')])
    ])]);
  });

  let range = Range.create(post.sections.head.items.head, 'ab'.length,
                           post.sections.head.items.tail, 'gh'.length);

  post = post.trimTo(range);
  let expected = buildPost(
    ({post, listSection, listItem, marker}) => {
    return post([listSection('ul', [
      listItem([marker('c')]),
      listItem([marker('def')]),
      listItem([marker('gh')])
    ])]);
  });

  assert.postIsSimilar(post, expected);
});

test('#trimTo when range contains multiple list items and more sections', (assert) => {
  let buildPost = Helpers.postAbstract.build;

  let post = buildPost(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([listSection('ul', [
      listItem([marker('abc')]),
      listItem([marker('def')]),
      listItem([marker('ghi')])
    ]), markupSection('p', [
      marker('123')
    ])]);
  });

  let range = Range.create(post.sections.head.items.head, 'ab'.length,
                           post.sections.tail, '12'.length);

  post = post.trimTo(range);
  let expected = buildPost(
    ({post, listSection, listItem, markupSection, marker}) => {
    return post([listSection('ul', [
      listItem([marker('c')]),
      listItem([marker('def')]),
      listItem([marker('ghi')])
    ]), markupSection('p', [
      marker('12')
    ])]);
  });

  assert.postIsSimilar(post, expected);
});

test('#headPosition and #tailPosition returns head and tail', (assert) => {
  let post = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });

  let head = post.headPosition();
  let tail = post.tailPosition();

  assert.positionIsEqual(head, post.sections.head.headPosition(), 'head pos');
  assert.positionIsEqual(tail, post.sections.tail.tailPosition(), 'tail pos');
});

test('#headPosition and #tailPosition when post is blank return blank', (assert) => {
  let post = Helpers.postAbstract.build(({post}) => {
    return post();
  });

  let head = post.headPosition();
  let tail = post.tailPosition();

  assert.positionIsEqual(head, Position.blankPosition(), 'head pos');
  assert.positionIsEqual(tail, Position.blankPosition(), 'tail pos');
});

test('#hasContent gives correct value', (assert) => {
  let expectations = Helpers.postAbstract.build(({post, markupSection, imageSection, marker}) => {
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

  expectations.hasNoContent.forEach(({message, post}) => {
    assert.ok(!post.hasContent, message + ' !hasContent');
  });
  expectations.hasContent.forEach(({message, post}) => {
    assert.ok(post.hasContent, message + ' hasContent');
  });
});

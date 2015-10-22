import Helpers from '../../test-helpers';
import Range from 'content-kit-editor/utils/cursor/range';

const {module, test} = Helpers;

module('Unit: Post');

test('#markersFrom finds markers across markup sections', (assert) => {
  const post = Helpers.postAbstract.build(({post, markupSection, marker}) =>
    post([
      markupSection('p', ['s1m1', 's1m2', 's1m3'].map(t => marker(t))),
      markupSection('p', ['s2m1', 's2m2', 's2m3'].map(t => marker(t))),
      markupSection('p', ['s3m1', 's3m2', 's3m3'].map(t => marker(t)))
    ])
  );

  let foundMarkers = [];

  const s1m2 = post.sections.objectAt(0).markers.objectAt(1);
  const s3m2 = post.sections.objectAt(2).markers.objectAt(1);

  assert.equal(s1m2.value, 's1m2', 'precond - find s1m2');
  assert.equal(s3m2.value, 's3m2', 'precond - find s3m2');

  post.markersFrom(s1m2, s3m2, m => foundMarkers.push(m.value));

  assert.deepEqual(foundMarkers,
                   [        's1m2', 's1m3',
                    's2m1', 's2m2', 's2m3',
                    's3m1', 's3m2'         ],
                   'iterates correct markers');
});

test('#markersFrom finds markers across non-homogeneous sections', (assert) => {
  const post = Helpers.postAbstract.build(builder => {
    const {post, markupSection, marker, listSection, listItem} = builder;

    return post([
      markupSection('p', ['s1m1', 's1m2', 's1m3'].map(t => marker(t))),
      listSection('ul', [
        listItem(['l1m1', 'l1m2', 'l1m3'].map(t => marker(t))),
        listItem(['l2m1', 'l2m2', 'l2m3'].map(t => marker(t)))
      ]),
      // FIXME test with card section
      markupSection('p', ['s2m1', 's2m2', 's2m3'].map(t => marker(t))),
      markupSection('p', ['s3m1', 's3m2', 's3m3'].map(t => marker(t)))
    ]);
  });

  let foundMarkers = [];

  const s1m2 = post.sections.objectAt(0).markers.objectAt(1);
  const s3m2 = post.sections.objectAt(3).markers.objectAt(1);

  assert.equal(s1m2.value, 's1m2', 'precond - find s1m2');
  assert.equal(s3m2.value, 's3m2', 'precond - find s3m2');

  post.markersFrom(s1m2, s3m2, m => foundMarkers.push(m.value));

  assert.deepEqual(foundMarkers,
                   [        's1m2', 's1m3',
                    'l1m1', 'l1m2', 'l1m3',
                    'l2m1', 'l2m2', 'l2m3',
                    's2m1', 's2m2', 's2m3',
                    's3m1', 's3m2'         ],
                   'iterates correct markers');
});

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

test('#markupsInRange returns all markups', (assert) => {
  let b, i, a1, a2, found;
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

  const collapsedRange = Range.create(s1, 0, s1, 0);
  assert.equal(post.markupsInRange(collapsedRange).length, 0,
               'no markups in collapsed range');

  const simpleRange = Range.create(s1, 0, s1, 'plain text'.length);
  assert.equal(post.markupsInRange(simpleRange).length, 0,
               'no markups in simple range');

  const singleMarkerRange = Range.create(s1, 'plain textb'.length,
                                      s1, 'plain textbold'.length);
  found = post.markupsInRange(singleMarkerRange);
  assert.equal(found.length, 1, 'finds markup in marker');
  assert.inArray(b, found, 'finds b');

  const singleSectionRange = Range.create(s1, 0, s1, s1.text.length);
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

// see https://github.com/bustlelabs/content-kit-editor/issues/134
test('#sectionsContainedBy when range covers two list items', (assert) => {
  const post = Helpers.postAbstract.build(
    ({post, markupSection, marker, listSection, listItem}) => {
    return post([
      listSection('ul', [listItem([marker('abc')]), listItem()]),
      markupSection('p', [marker('123')])
    ]);
  });
  const li1 = post.sections.head.items.head,
        li2 = post.sections.head.items.tail;
  const section = post.sections.tail;
  assert.equal(li1.text, 'abc', 'precond - li1 text');
  assert.equal(li2.text, '', 'precond - li2 text');
  assert.equal(section.text, '123', 'precond - section text');

  const range = Range.create(li1, 0, li2, li2.length);
  const containedSections = post.sectionsContainedBy(range);
  assert.equal(containedSections.length, 0, 'no sections are contained');
});

test('#sectionsContainedBy when range contains no sections', (assert) => {
  const post = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('123')])
    ]);
  });
  const s1 = post.sections.head,
        s2 = post.sections.tail;
  assert.equal(s1.text, 'abc', 'precond - s1 text');
  assert.equal(s2.text, '123', 'precond - s2 text');

  const range = Range.create(s1, 0, s2, s2.length);
  const containedSections = post.sectionsContainedBy(range);
  assert.equal(containedSections.length, 0, 'no sections are contained');
});

test('#sectionsContainedBy when range contains sections', (assert) => {
  const post = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([
      markupSection('p', [marker('abc')]),
      markupSection('p', [marker('inner')]),
      markupSection('p', [marker('123')])
    ]);
  });
  const s1 = post.sections.head,
        sInner = post.sections.objectAt(1),
        s2 = post.sections.tail;
  assert.equal(s1.text, 'abc', 'precond - s1 text');
  assert.equal(sInner.text, 'inner', 'precond - sInner text');
  assert.equal(s2.text, '123', 'precond - s2 text');

  const range = Range.create(s1, 0, s2, s2.length);
  const containedSections = post.sectionsContainedBy(range);
  assert.equal(containedSections.length, 1, '1 sections are contained');
  assert.ok(containedSections[0] === sInner, 'inner section is contained');
});

test('#sectionsContainedBy when range contains non-markerable sections', (assert) => {
  const post = Helpers.postAbstract.build(
    ({post, markupSection, marker, cardSection, listSection, listItem}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('test-card'),
      listSection('ul', [listItem([marker('li')])]),
      markupSection('p', [marker('123')])
    ]);
  });
  const s1 = post.sections.head,
        card = post.sections.objectAt(1),
        list = post.sections.objectAt(2),
        s2 = post.sections.tail;

  assert.equal(s1.text, 'abc', 'precond - s1 text');
  assert.equal(s2.text, '123', 'precond - s2 text');
  const range = Range.create(s1, 0, s2, s2.length);
  const containedSections = post.sectionsContainedBy(range);
  assert.equal(containedSections.length, 2, '2 sections are contained');
  assert.ok(containedSections.indexOf(card) !== -1, 'contains card');
  assert.ok(containedSections.indexOf(list) !== -1, 'contains list');
});

test('#sectionsContainedBy when range starts/ends in list item', (assert) => {
  const post = Helpers.postAbstract.build(
    ({post, markupSection, marker, cardSection, listSection, listItem}) => {
    return post([
      listSection('ul', [
        listItem([marker('ul1 li1')]),
        listItem([marker('ul1 li2')])
      ]),
      markupSection('p', [marker('abc')]),
      cardSection('test-card'),
      listSection('ul', [
        listItem([marker('ul2 li1')]),
        listItem([marker('ul2 li2')])
      ])
    ]);
  });
  const li1 = post.sections.head.items.head,
        li2 = post.sections.tail.items.tail,
        s1  = post.sections.objectAt(1),
        card = post.sections.objectAt(2);

  assert.equal(li1.text, 'ul1 li1', 'precond - li1 text');
  assert.equal(li2.text, 'ul2 li2', 'precond - li2 text');
  assert.equal(s1.text, 'abc', 'precond - s1 text');

  const range = Range.create(li1, li1.length, li2, li2.length);
  const containedSections = post.sectionsContainedBy(range);
  assert.equal(containedSections.length, 2, '2 sections are contained');
  assert.ok(containedSections.indexOf(card) !== -1, 'contains card');
  assert.ok(containedSections.indexOf(s1) !== -1, 'contains section');
});

test('#cloneRange creates a mobiledoc from the given range', (assert) => {
  const post = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('abc')])]);
  });
  const section = post.sections.head;
  const range = Range.create(section,1,section,2); // "b"

  const mobiledoc = post.cloneRange(range);
  const expectedMobiledoc = Helpers.mobiledoc.build(({post, marker, markupSection}) => {
    return post([markupSection('p',[marker('b')])]);
  });

  assert.deepEqual(mobiledoc, expectedMobiledoc);
});

test('#cloneRange copies card sections', (assert) => {
  let cardPayload = {foo: 'bar'};

  let buildPost = Helpers.postAbstract.build,
      buildMobiledoc = Helpers.mobiledoc.build;

  const post = buildPost(
    ({post, markupSection, marker, cardSection}) => {
    return post([
      markupSection('p', [marker('abc')]),
      cardSection('test-card', cardPayload),
      markupSection('p', [marker('123')])
    ]);
  });

  const range = Range.create(post.sections.head, 1,  // 'b'
                             post.sections.tail, 1); // '2'

  const mobiledoc = post.cloneRange(range);
  const expectedMobiledoc = buildMobiledoc(
    ({post, marker, markupSection, cardSection}) => {
    return post([
      markupSection('p',[marker('bc')]),
      cardSection('test-card', {foo: 'bar'}),
      markupSection('p',[marker('1')])
    ]);
  });

  assert.deepEqual(mobiledoc, expectedMobiledoc);
});

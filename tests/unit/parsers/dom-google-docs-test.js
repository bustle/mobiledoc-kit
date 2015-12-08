import HTMLParser from 'mobiledoc-kit/parsers/html';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';
import GoogleDocs from '../../fixtures/google-docs';
import { forEach } from 'mobiledoc-kit/utils/array-utils';
import { CARD_TYPE } from 'mobiledoc-kit/models/types';

const {module, test} = Helpers;

function parseHTML(html, options={}) {
  let builder = new PostNodeBuilder();
  return new HTMLParser(builder, options).parse(html);
}

module('Unit: Parser: HTMLParser Google Docs');

function equalToExpected(assert, rawHTML, expectedHTML) {
  let raw = parseHTML(rawHTML),
      expected = parseHTML(expectedHTML);

  assert.equal(raw.sections.length, expected.sections.length,
               'matches section length');
  raw.sections.forEach((section, sectionIndex) => {
    let expectedSection = expected.sections.objectAt(sectionIndex);

    if (section.type === CARD_TYPE) {
      assert.equal(section.name, expectedSection.name,
                   `card section at index ${sectionIndex} has equal name`);

      assert.deepEqual(section.payload, expectedSection.payload,
                   `card section at index ${sectionIndex} has equal payload`);

      return;
    }

    assert.equal(section.markers.length, expectedSection.markers.length,
                 `section at index ${sectionIndex} has equal marker length`);
    assert.equal(section.text, expectedSection.text,
                 `section at index ${sectionIndex} has equal text`);
    assert.equal(section.tagName, expectedSection.tagName,
                 `section at index ${sectionIndex} has equal tagName`);

    section.markers.forEach((marker, markerIndex) => {
      let expectedMarker = expectedSection.markers.objectAt(markerIndex);

      assert.equal(
        marker.value,
        expectedMarker.value,
        `marker #${markerIndex} at section #${sectionIndex} matches value`
      );

      assert.equal(
        marker.markups.length,
        expectedMarker.markups.length,
        `marker #${markerIndex} at section #${sectionIndex} matches markups length`
      );

      forEach(expectedMarker.markups, expectedMarkup => {
        let markup = marker.getMarkup(expectedMarkup.tagName);
        assert.ok(markup, `has markup with tagName ${expectedMarkup.tagName}`);
        let attributes = expectedMarkup.attributes;
        forEach(Object.keys(attributes), key => {
          assert.equal(expectedMarkup.getAttribute(key),
                       markup.getAttribute(key),
                       `equal attribute value for ${key}`);
        });
      });
    });
  });
}

Object.keys(GoogleDocs).forEach(key => {
  test(key, (assert) => {
    let example = GoogleDocs[key];
    equalToExpected(assert, example.raw, example.expected);
  });
});

test('img in span can use a cardParser to turn img into image-card', function(assert) {
  let example = GoogleDocs['img in span'];
  let options = {
    plugins: [function(element, builder, {addSection}) {
      if (element.tagName === 'IMG') {
        let payload = {url: element.src};
        let cardSection = builder.createCardSection('image-card', payload);
        addSection(cardSection);
      }
    }]
  };
  let parsed = parseHTML(example.raw, options);

  let sections = parsed.sections.toArray();
  let found = false, payload;
  for (let i=0; i < sections.length; i++) {
    if (sections[i].name === 'image-card') {
      found = true;
      payload = sections[i].payload;
    }
  }
  assert.ok(found, 'found image-card');
  assert.ok(payload.url, 'has url in payload');
});

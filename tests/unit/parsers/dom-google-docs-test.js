import HTMLParser from 'content-kit-editor/parsers/html';
import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
import Helpers from '../../test-helpers';
import GoogleDocs from '../../fixtures/google-docs';
import { forEach } from 'content-kit-editor/utils/array-utils';

const {module, test} = Helpers;

function parseHTML(html) {
  let builder = new PostNodeBuilder();
  return new HTMLParser(builder).parse(html);
}

module('Unit: Parser: HTMLParser Google Docs');

function equalToExpected(assert, rawHTML, expectedHTML) {
  let raw = parseHTML(rawHTML),
      expected = parseHTML(expectedHTML);

  assert.equal(raw.sections.length, expected.sections.length,
               'matches section length');
  raw.sections.forEach((section, sectionIndex) => {
    let expectedSection = expected.sections.objectAt(sectionIndex);

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

import HTMLParser from 'mobiledoc-kit/parsers/html';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';

const {module, test} = Helpers;

let parser;

module('Unit: Parser: HTMLParser Google Sheets', {
  beforeEach() {
    const options = {};
    const builder = new PostNodeBuilder();
    parser = new HTMLParser(builder, options);
  },
  afterEach() {
    parser = null;
  }
});

// No formatting
test('#parse returns a markup section when given a cell without formatting', (assert) => {
  const text = `<meta http-equiv="content-type" content="text/html; charset=utf-8"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,513,[null,0],null,null,null,null,null,null,null,null,0]">Ways of climbing over the wall</span>`;
  const post = parser.parse(text);
  const expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('Ways of climbing over the wall')])]);
  });

  assert.postIsSimilar(post, expected);
});

// No formatting (Chrome - Windows)
test('#parse returns a markup section when given a cell without formatting (Chrome - Windows)', (assert) => {
  const text = `<html><body><!--StartFragment--><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,513,[null,0],null,null,null,null,null,null,null,null,0]">Ways of climbing over the wall</span><!--EndFragment--></body></html>`;
  const post = parser.parse(text);
  const expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('Ways of climbing over the wall')])]);
  });

  assert.postIsSimilar(post, expected);
});

// Cell in bold
test('#parse returns a markup section with bold when given a cell in bold', (assert) => {
  const text = `<meta http-equiv="content-type" content="text/html; charset=utf-8"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;font-weight:bold;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,16897,[null,0],null,null,null,null,null,null,null,null,0,null,null,null,null,1]">Ways of climbing over the wall</span>`;
  const post = parser.parse(text);
  const expected = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    const b = markup('strong');
    return post([markupSection('p', [marker('Ways of climbing over the wall', [b])])]);
  });

  assert.postIsSimilar(post, expected);
});

// Cell in bold (Chrome - Windows)
test('#parse returns a markup section with bold when given a cell in bold (Chrome - Windows)', (assert) => {
  const text = `<html><body><!--StartFragment--><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><span style="font-size:13px;font-family:Arial;font-weight:bold;" data-sheets-value="[null,2,&quot;Ways of climbing over the wall&quot;]" data-sheets-userformat="[null,null,16897,[null,0],null,null,null,null,null,null,null,null,0,null,null,null,null,1]">Ways of climbing over the wall</span><!--EndFragment--></body></html>`;
  const post = parser.parse(text);
  const expected = Helpers.postAbstract.build(({post, markupSection, marker, markup}) => {
    const b = markup('strong');
    return post([markupSection('p', [marker('Ways of climbing over the wall', [b])])]);
  });

  assert.postIsSimilar(post, expected);
});

// Two adjacent cells without formatting
test('#parse returns a single markup section when given two cells on top of each other without formatting', (assert) => {
  const text = `<meta http-equiv="content-type" content="text/html; charset=utf-8"><meta name="generator" content="Sheets"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><table cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:13px;font-family:arial,sans,sans-serif;border-collapse:collapse;border:1px solid #ccc"><colgroup><col width="361"></colgroup><tbody><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Ostalgia&quot;]">Ostalgia</td></tr><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Photo&quot;]">Photo</td></tr></tbody></table>`;
  const post = parser.parse(text);
  const expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('OstalgiaPhoto')])]);
  });

  assert.postIsSimilar(post, expected);
});

// Two adjacent cells without formatting (Chrome - Windows)
test('#parse returns a single markup section when given two cells on top of each other without formatting (Chrome - Windows)', (assert) => {
  const text = `<html><body><!--StartFragment--><meta name="generator" content="Sheets"><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><table cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:13px;font-family:arial,sans,sans-serif;border-collapse:collapse;border:1px solid #ccc"><colgroup><col width="361"></colgroup><tbody><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Ostalgia&quot;]">Ostalgia</td></tr><tr style="height:21px;"><td style="padding:2px 3px 2px 3px;vertical-align:bottom;font-family:Arial;" data-sheets-value="[null,2,&quot;Photo&quot;]">Photo</td></tr></tbody></table><!--EndFragment--></body></html>`;
  const post = parser.parse(text);
  const expected = Helpers.postAbstract.build(({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('OstalgiaPhoto')])]);
  });

  assert.postIsSimilar(post, expected);
});

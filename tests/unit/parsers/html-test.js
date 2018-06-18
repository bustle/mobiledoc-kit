import HTMLParser from 'mobiledoc-kit/parsers/html';
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';
import Helpers from '../../test-helpers';

const {module, test} = Helpers;

function parseHTML(html, options={}) {
  let builder = new PostNodeBuilder();
  return new HTMLParser(builder, options).parse(html);
}

let didParseVideo;
function videoParserPlugin(node) {
  if (node.tagName === 'VIDEO') {
    didParseVideo = true;
  }
}

module('Unit: Parser: HTMLParser', {
  beforeEach() {
    didParseVideo = false;
  }
});

test('style tags are ignored', (assert) => {
  // This is the html you get when copying a message from Slack's desktop app
  let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"> <html> <head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> <meta http-equiv="Content-Style-Type" content="text/css"> <title></title> <meta name="Generator" content="Cocoa HTML Writer"> <meta name="CocoaVersion" content="1348.17"> <style type="text/css"> p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 15.0px Times; color: #2c2d30; -webkit-text-stroke: #2c2d30; background-color: #f9f9f9} span.s1 {font-kerning: none} </style> </head> <body> <p class="p1"><span class="s1">cool</span></p> </body> </html>`;
  let post = parseHTML(html);

  let expected = Helpers.postAbstract.build(
    ({post, markupSection, marker}) => {
    return post([markupSection('p', [marker('cool')])]);
  });

  assert.postIsSimilar(post, expected);
});

// See https://github.com/bustle/mobiledoc-kit/issues/333
test('newlines ("\\n") are replaced with space characters', (assert) => {
  let html = "abc\ndef";
  let post = parseHTML(html);
  let {post: expected} = Helpers.postAbstract.buildFromText(['abc def']);

  assert.postIsSimilar(post, expected);
});

// see https://github.com/bustlelabs/mobiledoc-kit/issues/494
test('top-level unknown void elements are parsed', (assert) => {
  let html = `<video />`;
  let post = parseHTML(html, {plugins: [videoParserPlugin]});
  let {post: expected} = Helpers.postAbstract.buildFromText([]);

  assert.ok(didParseVideo);
  assert.postIsSimilar(post, expected);
});

// see https://github.com/bustlelabs/mobiledoc-kit/issues/494
test('top-level unknown elements are parsed', (assert) => {
  let html = `<video>...inner...</video>`;
  let post = parseHTML(html, {plugins: [videoParserPlugin]});
  let {post: expected} = Helpers.postAbstract.buildFromText(['...inner...']);

  assert.ok(didParseVideo);
  assert.postIsSimilar(post, expected);
});

test('nested void unknown elements are parsed', (assert) => {
  let html = `<p>...<video />...</p>`;
  let post = parseHTML(html, {plugins: [videoParserPlugin]});
  let {post: expected} = Helpers.postAbstract.buildFromText(['......']);

  assert.ok(didParseVideo);
  assert.postIsSimilar(post, expected);
});

test('nested unknown elements are parsed', (assert) => {
  let html = `<p>...<video>inner</video>...</p>`;
  let post = parseHTML(html, {plugins: [videoParserPlugin]});
  let {post: expected} = Helpers.postAbstract.buildFromText(['...inner...']);

  assert.ok(didParseVideo);
  assert.postIsSimilar(post, expected);
});

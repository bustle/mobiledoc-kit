import Helpers from '../../test-helpers';
import {
  MIME_TEXT_PLAIN,
  MIME_TEXT_HTML,
  NONSTANDARD_IE_TEXT_TYPE,
  getContentFromPasteEvent,
  setClipboardData
} from 'mobiledoc-kit/utils/parse-utils';

const {module, test} = Helpers;

module('Unit: Utils: Parse Utils');

test('#getContentFromPasteEvent reads from clipboardData', (assert) => {
  let element = null;
  let expected = {
    [MIME_TEXT_PLAIN]: 'text',
    [MIME_TEXT_HTML]: '<p>html</p>'
  };
  let event = Helpers.dom.createMockEvent('paste', element, {
    clipboardData: {
      getData(type) {
        return expected[type];
      }
    }
  });
  let mockWindow = {
    clipboardData: {
      getData() {
        assert.ok(false, 'should not get clipboard data from window');
      }
    }
  };

  let { html, text } = getContentFromPasteEvent(event, mockWindow);

  assert.equal(html, expected[MIME_TEXT_HTML], 'correct html');
  assert.equal(text, expected[MIME_TEXT_PLAIN], 'correct text');
});

test('#getContentFromPasteEvent reads data from window.clipboardData when event.clipboardData is not present (IE compat)', (assert) => {
  assert.expect(3);
  let element = null;
  let event = Helpers.dom.createMockEvent('paste', element, {clipboardData:null});
  let requestedType;
  let expectedHTML = 'hello';
  let expectedText = '';
  let mockWindow = {
    clipboardData: {
      getData(type) {
        requestedType = type;
        return expectedHTML;
      }
    }
  };

  let { html, text } = getContentFromPasteEvent(event, mockWindow);

  assert.equal(requestedType, NONSTANDARD_IE_TEXT_TYPE, 'requests IE nonstandard mime type');
  assert.equal(html, expectedHTML, 'correct html');
  assert.equal(text, expectedText, 'correct text');
});

test('#setClipboardData uses event.clipboardData.setData when available', (assert) => {
  let element = null;
  let setData = {};
  let data = {
    html: '<p>html</p>',
    text: 'text'
  };
  let event = Helpers.dom.createMockEvent('copy', element, {
    clipboardData: {
      setData(type, value) {
        setData[type] = value;
      }
    }
  });
  let mockWindow = {
    clipboardData: {
      setData() {
        assert.ok(false, 'should not set clipboard data on window');
      }
    }
  };

  setClipboardData(event, data, mockWindow);

  assert.equal(setData[MIME_TEXT_HTML], data.html);
  assert.equal(setData[MIME_TEXT_PLAIN], data.text);
});

test('#setClipboardData uses window.clipboardData.setData when event.clipboardData not present (IE compat)', (assert) => {
  let element = null;
  let setData = {};
  let data = {
    html: '<p>html</p>',
    text: 'text'
  };
  let event = Helpers.dom.createMockEvent('paste', element, {
    clipboardData: null
  });
  let mockWindow = {
    clipboardData: {
      setData(type, value) {
        setData[type] = value;
      }
    }
  };

  setClipboardData(event, data, mockWindow);

  assert.equal(setData[NONSTANDARD_IE_TEXT_TYPE], data.html, 'sets NONSTANDARD_IE_TEXT_TYPE type');
  assert.ok(!setData[MIME_TEXT_HTML], 'does not set MIME_TEXT_HTML');
  assert.ok(!setData[MIME_TEXT_PLAIN], 'does not set MIME_TEXT_PLAIN');
});

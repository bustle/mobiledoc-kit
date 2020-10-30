import registerAssertions from './helpers/assertions'
registerAssertions(QUnit)

import DOMHelpers from './helpers/dom'
import MobiledocHelpers from './helpers/mobiledoc'
import PostAbstract from './helpers/post-abstract'
import { detectIE11 } from './helpers/browsers'
import wait from './helpers/wait'
import MockEditor from './helpers/mock-editor'
import renderBuiltAbstract from './helpers/render-built-abstract'
import run from './helpers/post-editor-run'
import * as EditorHelpers from './helpers/editor'

const { test: qunitTest, module, skip } = QUnit

QUnit.config.urlConfig.push({
  id: 'debugTest',
  label: 'Debug Test',
})

type TestCallback = (assert: Assert) => void | Promise<void>

declare global {
  interface Config {
    debugTest: boolean
  }

  namespace QUnit {
    interface DoneDetails {
      tests: any
    }
  }

  interface Window {
    global_test_results: QUnit.DoneDetails
  }
}

function test(msg: string, callback: TestCallback) {
  let originalCallback = callback
  callback = (...args) => {
    if (QUnit.config.debugTest) {
      // eslint-disable-next-line no-debugger
      debugger
    }
    originalCallback(...args)
  }
  qunitTest(msg, callback)
}

function skipInIE11(msg: string, callback: TestCallback) {
  if (detectIE11()) {
    skip('SKIPPED IN IE11: ' + msg, callback)
  } else {
    test(msg, callback)
  }
}

QUnit.testStart(() => {
  // The fixture is cleared between tests, clearing this
  $('<div id="editor"></div>').appendTo('#qunit-fixture')
})

let sauceLog: QUnit.LogDetails[] = []

QUnit.done(testResults => {
  var tests: Partial<QUnit.LogDetails>[] = []
  for (var i = 0, len = sauceLog.length; i < len; i++) {
    var details = sauceLog[i]
    tests.push({
      name: details.name,
      result: details.result,
      expected: details.expected,
      actual: details.actual,
      source: details.source,
    })
  }

  testResults.tests = tests
  window.global_test_results = testResults
})

QUnit.testStart(testDetails => {
  QUnit.log(function (details) {
    if (!details.result) {
      details.name = testDetails.name
      sauceLog.push(details)
    }
  })
})

export default {
  dom: DOMHelpers,
  mobiledoc: MobiledocHelpers,
  postAbstract: PostAbstract,
  editor: EditorHelpers,
  test,
  module,
  skipInIE11,
  skip,
  wait,
  postEditor: { run, renderBuiltAbstract, MockEditor },
}

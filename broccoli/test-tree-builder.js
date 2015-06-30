/* jshint node:true */
var funnel = require('broccoli-funnel');
var es6 = require('broccoli-babel-transpiler');
var concat = require('broccoli-concat');
var mergeTrees = require('broccoli-merge-trees');

var pkg = require('../package.json');
var packageName = pkg.name;
var outputFileName = packageName + '-tests.amd.js';

function buildTestTree() {
  var testJSTree = funnel('./tests', {
    include: ['**/*.js'],
    destDir: '/tests'
  });

  testJSTree = es6(testJSTree, {
    moduleIds: true,
    modules: 'amdStrict'
  });

  testJSTree = concat(testJSTree, {
    inputFiles: ['**/*.js'],
    outputFile: '/tests/' + outputFileName
  });

  var testExtTree = funnel('./node_modules', {
    include: [
      'qunitjs/qunit/qunit.js',
      'qunitjs/qunit/qunit.css'
    ],
    destDir: '/tests'
  });

  testExtTree = mergeTrees([testExtTree, funnel('./bower_components', {
    include: [
      'ember-cli-test-loader/test-loader.js'
    ],
    destDir: '/tests'
  })]);

  var testHTMLTree = funnel('./tests', {
    include: ['index.html'],
    destDir: '/tests'
  });

  var testTree = mergeTrees([
    testJSTree,
    testExtTree,
    testHTMLTree
  ]);

  return testTree;
}

module.exports = {
  build: buildTestTree
};

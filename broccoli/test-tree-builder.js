/* jshint node:true */
var funnel = require('broccoli-funnel');
var es6 = require('broccoli-babel-transpiler');
var concat = require('broccoli-concat');
var mergeTrees = require('broccoli-merge-trees');

var pkg = require('../package.json');
var packageName = pkg.name;
var outputFileName = packageName + '-tests.amd.js';
var path = require('path');

function loaderTree() {
  var loaderDir = path.dirname(require.resolve('loader.js'));
  return funnel(loaderDir, {
    include: ['loader.js'],
    destDir: '/tests/loader.js'
  });
}

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

  // bring in qunit
  var testExtTree = funnel('./node_modules', {
    include: [
      'qunitjs/qunit/qunit.js',
      'qunitjs/qunit/qunit.css'
    ],
    destDir: '/tests'
  });

  // bring in test-loader
  testExtTree = mergeTrees([testExtTree, funnel('./bower_components', {
    include: [
      'ember-cli-test-loader/test-loader.js'
    ],
    destDir: '/tests'
  })]);

  // include HTML file
  var testHTMLTree = funnel('./tests', {
    include: ['index.html'],
    destDir: '/tests'
  });

  var testTree = mergeTrees([
    loaderTree(),
    testJSTree,
    testExtTree,
    testHTMLTree
  ]);

  return testTree;
}

module.exports = {
  build: buildTestTree
};

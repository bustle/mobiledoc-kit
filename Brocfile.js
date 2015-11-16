/* jshint node:true */

var builder = require('broccoli-multi-builder');
var mergeTrees = require('broccoli-merge-trees');
var testTreeBuilder = require('broccoli-test-builder');
var styles = require('./broccoli/styles');
var jquery = require('./broccoli/jquery');

var vendoredModules = [
  {name: 'content-kit-utils', options: {libDirName: 'src'}},
  {name: 'mobiledoc-html-renderer'},
  {name: 'mobiledoc-text-renderer'}
];
var packageName = require('./package.json').name;

var buildOptions = {
  libDirName: 'src/js',
  vendoredModules: vendoredModules,
  packageName: packageName
};

var testTree = testTreeBuilder.build({libDirName: 'src'});
testTree = jquery.build(testTree, '/tests/jquery');

module.exports = mergeTrees([
  builder.build('amd', buildOptions),
  builder.build('global', buildOptions),
  builder.build('commonjs', buildOptions),
  styles(),
  testTree
]);

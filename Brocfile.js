/* jshint node:true */

var builder = require('broccoli-multi-builder');
var mergeTrees = require('broccoli-merge-trees');
var testTreeBuilder = require('broccoli-test-builder');
var styles = require('./broccoli/styles');
var demo = require('./broccoli/demo');
var jquery = require('./broccoli/jquery');

var vendoredModules = [
  {name: 'content-kit-utils', options: {libDirName: 'src'}}
];
var packageName = require('./package.json').name;

var buildOptions = {
  libDirName: 'src/js',
  vendoredModules: vendoredModules,
  packageName: packageName
};

var jqueryTree = jquery.build('/demo/jquery');
var testTree = testTreeBuilder.build();
var demoTree = demo();
demoTree = mergeTrees([demoTree, jqueryTree]);

module.exports = mergeTrees([
  builder.build('amd', buildOptions),
  builder.build('global', buildOptions),
  // FIXME Later we may want to bring back the commonjs build
  // builder.build('commonjs', buildOptions),
  styles(),
  demoTree,
  testTree
]);

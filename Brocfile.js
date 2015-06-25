/* jshint node:true */

var multiBuilder = require('broccoli-multi-builder');
var mergeTrees = require('broccoli-merge-trees');

var jsSrc = './src/js';
var vendoredModules = ['content-kit-compiler', 'content-kit-utils'];
var packageName = require('./package.json').name;

var amdTree = multiBuilder.buildAMD({
  isGlobal: false,
  src: jsSrc,
  vendoredModules: vendoredModules,
  packageName: packageName
});

var globalTree = multiBuilder.buildAMD({
  isGlobal: true,
  src: jsSrc,
  vendoredModules: vendoredModules,
  packageName: packageName
});

var cjsTree = multiBuilder.buildCJS({
  src: jsSrc,
  vendoredModules: vendoredModules,
  packageName: packageName
});

module.exports = mergeTrees([ amdTree, globalTree, cjsTree ]);

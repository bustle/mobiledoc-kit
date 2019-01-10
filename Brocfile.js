/* jshint node:true */

var broccoli = require("broccoli");
var Funnel = require("broccoli-funnel");
var mergeTrees = require("broccoli-merge-trees");
var testTreeBuilder = require("broccoli-test-builder");
var jquery = require("./broccoli/jquery");
var BroccoliLiveReload = require("broccoli-livereload");
var replace = require("broccoli-string-replace");
var demoTree = require("./broccoli/demo");
var rollupTree = require("./broccoli/rollup");
var rollupTestTree = require("./broccoli/rollup-test");

var cssFiles = new Funnel("src/css", { destDir: "css" });

var testTree = testTreeBuilder.build({ libDirName: "src" });
testTree = jquery.build(testTree, "/tests/jquery");
testTree = new BroccoliLiveReload(testTree, { target: "index.html" });

var testBuilder = new broccoli.Builder(testTree);

function replaceVersion(tree) {
  var version = require("./package.json").version;
  return replace(tree, {
    files: [ "**/*.js" ],
    pattern: { match: /##VERSION##/g, replacement: version }
  });
}

module.exports = mergeTrees([
  replaceVersion(rollupTree()),
  replaceVersion(rollupTestTree()),
  cssFiles,
  testTree,
  demoTree()
]);


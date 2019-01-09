/* jshint node:true */

var broccoli = require("broccoli");
var Watcher = require("broccoli-sane-watcher");
var Funnel = require("broccoli-funnel");
var builder = require("broccoli-multi-builder");
var mergeTrees = require("broccoli-merge-trees");
var testTreeBuilder = require("broccoli-test-builder");
var jquery = require("./broccoli/jquery");
var BroccoliLiveReload = require("broccoli-livereload");
var replace = require("broccoli-string-replace");
var demoTree = require("./broccoli/demo");
var rollupTree = require("./broccoli/rollup");
var rollupTestTree = require("./broccoli/rollup-test");

var vendoredModules = [
  { name: "mobiledoc-dom-renderer" },
  { name: "mobiledoc-text-renderer" }
];

var cssFiles = new Funnel("src/css", { destDir: "css" });

var packageName = require("./package.json").name;

var buildOptions = {
  libDirName: "src/js",
  vendoredModules: vendoredModules,
  packageName: packageName
};

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
  //replaceVersion(builder.build("amd", buildOptions)),
  //replaceVersion(builder.build("global", buildOptions)),
  //replaceVersion(builder.build("commonjs", buildOptions)),
  replaceVersion(rollupTree()),
  //rollupTestTree(),
  cssFiles,
  testTree,
  demoTree()
]);


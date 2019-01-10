/* jshint node:true */

var broccoli = require("broccoli");
var Funnel = require("broccoli-funnel");
var mergeTrees = require("broccoli-merge-trees");
var replace = require("broccoli-string-replace");
var demoTree = require("./broccoli/demo");
var rollupTree = require("./broccoli/rollup");
var testTree = require("./broccoli/test");

var cssFiles = new Funnel("src/css", { destDir: "css" });

function replaceVersion(tree) {
  var version = require("./package.json").version;
  return replace(tree, {
    files: [ "**/*.js" ],
    pattern: { match: /##VERSION##/g, replacement: version }
  });
}

const rollupSrcTree = replaceVersion(rollupTree());

// Ember addons like ember-mobiledoc-editor require the source file to be at
// amd/mobiledoc-kit.map, not amd/mobiledoc-kit.js.map
const amdRenamedTree = new Funnel(rollupSrcTree, {
  sourceDir: 'amd',
  destDir: '',
  include: ['amd/mobiledoc-kit.js.map'],

  getDestinationPath: function(relativePath) {
    if (relativePath === 'amd/mobiledoc-kit.js.map') {
      return 'amd/mobiledoc-kit.map';
    }

    return relativePath;
  }
});

module.exports = mergeTrees([
  rollupSrcTree,
  amdRenamedTree,
  replaceVersion(testTree()),
  cssFiles,
  demoTree()
]);


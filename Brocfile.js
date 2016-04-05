/* jshint node:true */

var broccoli = require('broccoli');
var Watcher = require('broccoli-sane-watcher');
var builder = require('broccoli-multi-builder');
var mergeTrees = require('broccoli-merge-trees');
var testTreeBuilder = require('broccoli-test-builder');
var styles = require('./broccoli/styles');
var jquery = require('./broccoli/jquery');
var injectLiveReload = require('broccoli-inject-livereload');
var LiveReload = require('tiny-lr');

var vendoredModules = [
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

var testBuilder = new broccoli.Builder(testTree);
var lrServer = new LiveReload.Server();
lrServer.listen();
var watcher = new Watcher(testBuilder);
watcher.on('change', function() {
  try {
    lrServer.changed({
      body: {
        files: ['js/']
      }
    });
  } catch(e) {
    console.log('error notifying live-reload of change: ',e);
  }
});

module.exports = mergeTrees([
  builder.build('amd', buildOptions),
  builder.build('global', buildOptions),
  builder.build('commonjs', buildOptions),
  styles(),
  injectLiveReload(testTree)
]);

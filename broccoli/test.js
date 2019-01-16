var Rollup = require('broccoli-rollup');
var resolve = require('rollup-plugin-node-resolve');
var multiEntry = require('rollup-plugin-multi-entry');
var babel  = require('rollup-plugin-babel');
const { rollupReplaceVersion, fixMobiledocImport } = require('./rollup-utils');
const path = require('path');
var mergeTrees = require("broccoli-merge-trees");
var jquery = require("./jquery");
var Funnel = require("broccoli-funnel");
var BroccoliLiveReload = require("broccoli-livereload");

module.exports = function() {
  const qunitDir = path.dirname(require.resolve('qunitjs'));

  let vendorTree = new Funnel(qunitDir, {
    include: [
      'qunit.js',
      'qunit.css',
    ],
    destDir: '/tests/qunit'
  });

  vendorTree = jquery.build(vendorTree, "/tests/jquery");

  const testIndexHtmlTree = new Funnel("tests", {
    sourceDir: '/tests',
    include: ['index.html'],
    destDir: '/tests'
  });

  const rollupTree = new Rollup('tests', {
    rollup: {
      input: '**/*.js',
      output: {
        name: 'Mobiledoc',
        file: 'rollup/tests/index.js',
        format: 'iife',
        exports: 'named',
        globals: {
          'mobiledoc-kit': 'Mobiledoc'
        }
      },
      plugins: [
        multiEntry(),
        rollupReplaceVersion,
        fixMobiledocImport(),
        resolve(), // so Rollup can find `ms`
        babel({
          exclude: 'node_modules/**',
          babelrc: false,
          presets: [
            ['@babel/preset-env', { targets: { "ie": "11" }}]
          ]
        })
      ]
    }
  });

  let testTree = mergeTrees([
    rollupTree,
    testIndexHtmlTree,
    vendorTree
  ]);

  return new BroccoliLiveReload(testTree, { target: "index.html" });
};

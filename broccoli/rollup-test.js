var Rollup = require('broccoli-rollup');
var resolve = require('rollup-plugin-node-resolve');
var multiEntry = require('rollup-plugin-multi-entry');
var babel = require('broccoli-babel-transpiler');
const { rollupReplaceVersion, fixMobiledocImport } = require('./rollup-utils');

module.exports = function() {
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
        resolve() // so Rollup can find `ms`
      ]
    }
  });

  return babel(rollupTree, {
    exclude: 'node_modules/**',
    babelrc: false,
    presets: [
      ['@babel/preset-env', { targets: { "ie": "11" }}]
    ]
  });
};

var Rollup = require('broccoli-rollup');
var resolve = require('rollup-plugin-node-resolve');
var pkg = require('../package.json');
var replace = require('rollup-plugin-replace');
var path = require("path");
var multiEntry = require('rollup-plugin-multi-entry');

var CWD = process.cwd();

function fixMobiledocImport() {
  return {
    name: 'fix-mobiledoc-import',
    resolveId(importee, importer) {
      if (importee === 'mobiledoc-kit') {
        return `${CWD}/src/js/index.js`;
      }
      if (importee.startsWith('mobiledoc-kit/')) {
        // console.log(importee, '<-', importer);
        importee = importee.replace('mobiledoc-kit/', '');
        importee = `${CWD}/src/js/${importee}.js`;
        // console.log('abs:', importee);
        let rel = path.relative(importer, importee);
        rel = path.resolve(importer, rel);
        // console.log('rel:', rel);
        return rel;
      } else {
        return null;
      }
    }
  };
}

var rollupReplaceVersion = replace({
  include: 'src/js/version.js',
  delimiters: ['##', '##'],
  values: {
    VERSION: pkg.version
  }
});

module.exports = function() {
  return new Rollup('.', { 
    rollup: {
      input: '**/*.js',
      output: {
        name: 'Mobiledoc',
        file: 'rollup/tests/index.js',
        format: 'iife',
        exports: 'named',
        globals: {
          'mobiledoc-kit': 'Mobiledoc',
          'ember-cli/test-loader': 'TestLoader'
        }
      },
      plugins: [
        multiEntry(),
        rollupReplaceVersion,
        fixMobiledocImport(),
        resolve(), // so Rollup can find `ms`
      ]
    }
  });
};

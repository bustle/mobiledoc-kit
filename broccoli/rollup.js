var Rollup = require('broccoli-rollup');
var resolve = require('rollup-plugin-node-resolve');
var pkg = require('../package.json');
var replace = require('rollup-plugin-replace');
var path = require("path");
const babel = require('broccoli-babel-transpiler');

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
  const rollupTree = new Rollup('src', { 
    rollup: {
      input: 'js/index.js',
      output: [
        {
          name: 'Mobiledoc',
          file: "amd/mobiledoc-kit.js",// pkg.browser,
          format: 'amd',
          amd: {
            id: 'mobiledoc-kit'
          },
          exports: 'named',
          sourcemap: true
        },
        {
          name: 'Mobiledoc',
          file: "mobiledoc-kit/mobiledoc-kit.global.js",
          format: 'iife',
          exports: 'named'
        }
        // {
        //   exports: 'named',
        //   file: "mobiledoc-kit/mobiledoc-kit.cjs.js",
        //   format: 'cjs'
        // },
        // {
        //   exports: 'named',
        //   file: "mobiledoc-kit/mobiledoc-kit.esm.js",
        //   format: 'es'
        // }
      ],
      plugins: [
        rollupReplaceVersion,
        fixMobiledocImport(),
        resolve() // so Rollup can find packages in node-modules
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

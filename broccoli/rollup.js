var Rollup = require('broccoli-rollup');
var resolve = require('rollup-plugin-node-resolve');
const babel = require('broccoli-babel-transpiler');
const { rollupReplaceVersion, fixMobiledocImport } = require('./rollup-utils');

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

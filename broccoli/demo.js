/* jshint node:true */
'use strict';

var funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var path = require('path');

module.exports = function() {
  var demoDir = 'demo';
  var rendererDir = path.join(
    path.dirname(
      require.resolve('mobiledoc-dom-renderer')
    ),
    'dist', 'global'
  );
  // find the global build relative to the commonjs `main` entrypoint
  var htmlrendererDir = path.join(
    path.dirname(
      require.resolve('mobiledoc-html-renderer')
    ),
    '..', '..', 'global'
  );
  return mergeTrees([
    funnel(demoDir, {
      include: [
        '**/*.css',
        '**/*.js',
        'favicon.ico',
        '**/*.html'
      ],
      destDir: '/demo'
    }),
    funnel(rendererDir, {
      include: [
        'mobiledoc-dom-renderer.js'
      ],
      destDir: '/demo'
    }),
    funnel(htmlrendererDir, {
      include: [
        'mobiledoc-html-renderer.js'
      ],
      destDir: '/demo'
    })
  ]);
};

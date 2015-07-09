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
    )
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
    })
  ]);
};

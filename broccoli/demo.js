/* jshint node:true */
'use strict';

var funnel = require('broccoli-funnel');

module.exports = function() {
  var demoDir = 'demo';
  return funnel(demoDir, {
    include: [
      '**/*.css',
      '**/*.js',
      'favicon.ico',
      '**/*.html'
    ],
    destDir: '/demo'
  });
};

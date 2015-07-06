/* jshint node:true */
var funnel = require('broccoli-funnel');

module.exports = {
  build: function(destDir) {
    var path = require('path');
    var jqueryPath = path.dirname(
      require.resolve('jquery')
    );
    var tree = funnel(jqueryPath, {
      include: ['jquery.js'],
      destDir: destDir
    });

    return tree;
  }
};

var funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
  /**
   * @param {Tree} tree existing tree to mix jquery into
   * @param {String} destDir the destination directory for 'jquery.js' to go into
   * @return {Tree} A tree with jquery mixed into it at the location requested
   */
  build: function(tree, destDir) {
    var path = require('path');
    var jqueryPath = path.dirname(
      require.resolve('jquery')
    );
    var jqueryTree = funnel(jqueryPath, {
      include: ['jquery.js'],
      destDir: destDir
    });
    return mergeTrees([tree, jqueryTree]);
  }
};

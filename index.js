var Funnel = require('broccoli-funnel');

module.exports = {
  name: "content-kit-editor",
  treeForVendor: function() {
    var files = new Funnel(__dirname + '/dist/', {
      files: [
        'css/content-kit-editor.css',
        'global/content-kit-editor.js'
      ],
      destDir: 'content-kit-editor'
    });
    return files;
  },
  included: function(app) {
    app.import('vendor/content-kit-editor/css/content-kit-editor.css');
    app.import('vendor/content-kit-editor/global/content-kit-editor.js');
  }
};

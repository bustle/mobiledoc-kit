var funnel = require('broccoli-funnel');
var babel = require('broccoli-babel-transpiler');

module.exports = function() {
  return funnel(babel('assets/demo/'), {
    destDir: 'demo'
  });
};

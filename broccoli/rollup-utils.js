var pkg = require('../package.json');
var replace = require('rollup-plugin-replace');
var path = require("path");

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

module.exports = {
  fixMobiledocImport,
  rollupReplaceVersion // NOT WORKING
};
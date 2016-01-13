import MobiledocParser_0_2 from './0-2';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc/0-2';
import assert from 'mobiledoc-kit/utils/assert';

function parseVersion(mobiledoc) {
  return mobiledoc.version;
}

export default {
  parse(builder, mobiledoc) {
    let version = parseVersion(mobiledoc);
    switch (version) {
      case MOBILEDOC_VERSION:
        return new MobiledocParser_0_2(builder).parse(mobiledoc);
      default:
        assert(`Unknown version of mobiledoc parser requested: ${version}`,
               false);
    }
  }
};

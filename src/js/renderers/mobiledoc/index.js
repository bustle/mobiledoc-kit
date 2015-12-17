import MobiledocRenderer_0_2, { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_2 } from './0-2';
import MobiledocRenderer_0_3, { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3 } from './0-3';
import assert from 'mobiledoc-kit/utils/assert';

export const MOBILEDOC_VERSION = MOBILEDOC_VERSION_0_3;

export default {
  render(post, version) {
    switch (version) {
      case MOBILEDOC_VERSION_0_2:
        return MobiledocRenderer_0_2.render(post);
      case undefined:
      case null:
      case MOBILEDOC_VERSION_0_3:
        return MobiledocRenderer_0_3.render(post);
      default:
        assert(`Unknown version of mobiledoc renderer requested: ${version}`, false);
    }
  }
};

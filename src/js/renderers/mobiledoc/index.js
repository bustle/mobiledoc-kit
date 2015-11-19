import MobiledocRenderer_0_2, { MOBILEDOC_VERSION } from './0-2';

export { MOBILEDOC_VERSION };

export default {
  render(post, version) {
    switch (version) {
      case MOBILEDOC_VERSION:
      case undefined:
      case null:
        return MobiledocRenderer_0_2.render(post);
      default:
        throw new Error(`Unknown version of mobiledoc renderer requested: ${version}`);
    }
  }
};

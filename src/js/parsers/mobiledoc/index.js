import MobiledocParser_0_2 from './0-2';

function parseVersion(mobiledoc) {
  return mobiledoc.version;
}

export default {
  parse(builder, mobiledoc) {
    let version = parseVersion(mobiledoc);
    switch (version) {
      case '0.2.0':
        return new MobiledocParser_0_2(builder).parse(mobiledoc);
      default:
        throw new Error(`Unknown version of mobiledoc parser requested: ${version}`);
    }
  }
};

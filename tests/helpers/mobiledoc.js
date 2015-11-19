import PostAbstractHelpers from './post-abstract';
import mobiledocRenderers from 'mobiledoc-kit/renderers/mobiledoc';
import MobiledocRenderer_0_2 from 'mobiledoc-kit/renderers/mobiledoc/0-2';

/*
 * usage:
 *  build(({post, section, marker, markup}) =>
 *    post([
 *      section('P', [
 *        marker('some text', [markup('B')])
 *      ])
 *    })
 *  )
 */
function build(treeFn, version) {
  switch (version) {
    case '0.2.0':
      return MobiledocRenderer_0_2.render(PostAbstractHelpers.build(treeFn));
    case undefined:
    case null:
      return mobiledocRenderers.render(PostAbstractHelpers.build(treeFn));
    default:
      throw new Error(`Unknown version of mobiledoc renderer requested: ${version}`);
  }
}

export default {
  build
};

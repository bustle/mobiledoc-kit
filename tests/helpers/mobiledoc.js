import PostAbstractHelpers from './post-abstract';
import MobiledocRenderer from 'content-kit-editor/renderers/mobiledoc';

/*
 * usage:
 *  makeMD(({post, section, marker, markup}) =>
 *    post([
 *      section('P', [
 *        marker('some text', [markup('B')])
 *      ])
 *    })
 *  )
 */
function build(treeFn) {
  return MobiledocRenderer.render(PostAbstractHelpers.build(treeFn));
}

export default {
  build
};

import PostAbstractHelpers from './post-abstract';
import MobiledocRenderer from 'mobiledoc-kit/renderers/mobiledoc';

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
function build(treeFn) {
  return MobiledocRenderer.render(PostAbstractHelpers.build(treeFn));
}

export default {
  build
};

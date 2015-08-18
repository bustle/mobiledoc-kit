import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';
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
  let builder = new PostNodeBuilder();

  const post          = (...args) => builder.createPost(...args);
  const markupSection = (...args) => builder.createMarkupSection(...args);
  const markup        = (...args) => builder.createMarkup(...args);
  const marker        = (...args) => builder.createMarker(...args);

  let builtPost = treeFn({post, markupSection, markup, marker});
  return MobiledocRenderer.render(builtPost);
}

export default {
  build
};

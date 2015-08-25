import PostNodeBuilder from 'content-kit-editor/models/post-node-builder';

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

  return treeFn({post, markupSection, markup, marker});
}

export default {
  build
};

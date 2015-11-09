import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

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

  const simpleBuilder = {
    post          : (...args) => builder.createPost(...args),
    markupSection : (...args) => builder.createMarkupSection(...args),
    markup        : (...args) => builder.createMarkup(...args),
    marker        : (...args) => builder.createMarker(...args),
    listSection   : (...args) => builder.createListSection(...args),
    listItem      : (...args) => builder.createListItem(...args),
    cardSection   : (...args) => builder.createCardSection(...args)
  };

  return treeFn(simpleBuilder);
}

export default {
  build
};

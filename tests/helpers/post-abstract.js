import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

/*
 * usage:
 *  Helpers.postAbstract.build(({post, section, marker, markup}) =>
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
    cardSection   : (...args) => builder.createCardSection(...args),
    atom          : (...args) => builder.createAtom(...args)
  };

  return treeFn(simpleBuilder);
}

/**
 * usage:
 * Helpers.postAbstract.buildWithText(text) -> post with 1 markupSection ("p") with text `text`
 * Helpers.postAbstract.buildWithText([text1, text2]) -> post with 2 markupSections ("p") with texts `text1`, `text2`
 */
function buildWithText(textOrArray) {
  let builder = new PostNodeBuilder();
  if (!Array.isArray(textOrArray)) {
    textOrArray = [textOrArray];
  }

  let sections = textOrArray.map(text => {
    return builder.createMarkupSection('p', [builder.createMarker(text)]);
  });
  return builder.createPost(sections);
}

export default {
  build,
  buildWithText
};

import PostAbstractHelpers from './post-abstract';
import mobiledocRenderers from 'mobiledoc-kit/renderers/mobiledoc';
import MobiledocRenderer_0_2, { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_2 } from 'mobiledoc-kit/renderers/mobiledoc/0-2';
import MobiledocRenderer_0_3, { MOBILEDOC_VERSION as MOBILEDOC_VERSION_0_3 } from 'mobiledoc-kit/renderers/mobiledoc/0-3';
import Editor from 'mobiledoc-kit/editor/editor';
import { mergeWithOptions } from 'mobiledoc-kit/utils/merge';

/*
 * usage:
 *  build(({post, section, marker, markup}) =>
 *    post([
 *      section('P', [
 *        marker('some text', [markup('B')])
 *      ])
 *    })
 *  )
 *  @return Mobiledoc
 */
function build(treeFn, version) {
  let post = PostAbstractHelpers.build(treeFn);
  switch (version) {
    case MOBILEDOC_VERSION_0_2:
      return MobiledocRenderer_0_2.render(post);
    case MOBILEDOC_VERSION_0_3:
      return MobiledocRenderer_0_3.render(post);
    case undefined:
    case null:
      return mobiledocRenderers.render(post);
    default:
      throw new Error(`Unknown version of mobiledoc renderer requested: ${version}`);
  }
}

function renderPostInto(element, post, editorOptions={}) {
  let mobiledoc = mobiledocRenderers.render(post);
  mergeWithOptions(editorOptions, {mobiledoc});
  let editor = new Editor(editorOptions);
  editor.render(element);
  return editor;
}

function renderInto(element, treeFn, editorOptions={}) {
  let mobiledoc = build(treeFn);
  mergeWithOptions(editorOptions, {mobiledoc});
  let editor = new Editor(editorOptions);
  editor.render(element);
  return editor;
}

export default {
  build,
  renderInto,
  renderPostInto
};

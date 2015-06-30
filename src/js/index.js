import {
  Type,
  BlockModel,
  EmbedModel,
  Compiler,
  HTMLParser,
  HTMLRenderer
} from 'content-kit-compiler';

import Editor from './editor/editor-factory';

const ContentKit = {
  Type,
  BlockModel,
  EmbedModel,
  Compiler,
  HTMLParser,
  HTMLRenderer,
  Editor
};

export function registerGlobal(global) {
  global.ContentKit = ContentKit;
}

export { Editor };
export default ContentKit;

import {
  Type,
  BlockModel,
  EmbedModel,
  Compiler,
  HTMLParser,
  HTMLRenderer,
  Runtime
} from 'content-kit-compiler';

import Editor from './editor/editor';

const ContentKit = {
  Type,
  BlockModel,
  EmbedModel,
  Compiler,
  HTMLParser,
  HTMLRenderer,
  Runtime,
  Editor
};

export function registerGlobal(global) {
  global.ContentKit = ContentKit;
}

export { Editor };
export default ContentKit;

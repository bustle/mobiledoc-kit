import {
  Type,
  BlockModel,
  EmbedModel,
  Compiler,
  HTMLParser,
  HTMLRenderer
} from 'content-kit-compiler';

import EditorFactory from './editor/editor-factory';

// Create a namespace and selectivly expose public modules
var ContentKit = {};
ContentKit.Type = Type;
ContentKit.BlockModel = BlockModel;
ContentKit.EmbedModel = EmbedModel;
ContentKit.Compiler = Compiler;
ContentKit.HTMLParser = HTMLParser;
ContentKit.HTMLRenderer = HTMLRenderer;
ContentKit.Editor = EditorFactory;

export function registerGlobal(global) {
  global.ContentKit = ContentKit;
}

export default ContentKit;

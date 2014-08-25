import Type from './content-kit-compiler/types/type';
import BlockModel from './content-kit-compiler/models/block';
import TextModel from './content-kit-compiler/models/text';
import ImageModel from './content-kit-compiler/models/image';
import EmbedModel from './content-kit-compiler/models/embed';
import Compiler from './content-kit-compiler/compiler';
import HTMLParser from './content-kit-compiler/parsers/html-parser';
import HTMLRenderer from './content-kit-compiler/renderers/html-renderer';

import EditorFactory from './content-kit-editor/editor/editor-factory';

var ContentKit = {};
ContentKit.Type = Type;
ContentKit.BlockModel = BlockModel;
ContentKit.TextModel = TextModel;
ContentKit.ImageModel = ImageModel;
ContentKit.EmbedModel = EmbedModel;
ContentKit.Compiler = Compiler;
ContentKit.HTMLParser = HTMLParser;
ContentKit.HTMLRenderer = HTMLRenderer;

ContentKit.Editor = EditorFactory;

export default ContentKit;

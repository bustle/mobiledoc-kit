import Type from 'node_modules/content-kit-compiler/src/types/type';
import BlockModel from 'node_modules/content-kit-compiler/src/models/block';
import EmbedModel from 'node_modules/content-kit-compiler/src/models/embed';
import Compiler from 'node_modules/content-kit-compiler/src/compiler';
import HTMLParser from 'node_modules/content-kit-compiler/src/parsers/html-parser';
import HTMLRenderer from 'node_modules/content-kit-compiler/src/renderers/html-renderer';
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

window.ContentKit = ContentKit;

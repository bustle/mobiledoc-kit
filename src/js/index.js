import Editor from './editor/editor';
import * as UI from './editor/ui';
import ImageCard from './cards/image';
import Range from './utils/cursor/range';
import Position from './utils/cursor/position';
import Error from './utils/mobiledoc-error';
import {getContentFromPasteEvent} from './utils/parse-utils';
import {getEventTargetMatchingTag} from './utils/element-utils';
import Browser from './utils/browser';
import Key from './utils/key';

import VERSION from './version';
import mobiledocRenderers, { MOBILEDOC_VERSION } from './renderers/mobiledoc/index';

import DOMParser  from './parsers/dom'
import Builder from './models/post-node-builder'
import mobiledocRenderer from './renderers/mobiledoc'

const Mobiledoc = {
  Editor,
  UI,
  ImageCard,
  Range,
  Position,
  Error,
  VERSION,
  MOBILEDOC_VERSION,
  mobiledocRenderers,
  Error,
  getContentFromPasteEvent,
  getEventTargetMatchingTag,
  Browser,
  Key,
  DOMParser,
  Builder,
  mobiledocRenderer
};

export function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

export {
  Editor,
  UI,
  Range,
  Position,
  Error,
  getContentFromPasteEvent,
  getEventTargetMatchingTag,
  Browser,
  Key,
  DOMParser,
  Builder,
  mobiledocRenderer
};
export default Mobiledoc;

import Editor from './editor/editor';
import * as UI from './editor/ui';
import ImageCard from './cards/image';
import Range from './utils/cursor/range';
import Position from './utils/cursor/position';
import Error from './utils/mobiledoc-error';
import VERSION from './version';
import { MOBILEDOC_VERSION } from 'mobiledoc-kit/renderers/mobiledoc';

const Mobiledoc = {
  Editor,
  UI,
  ImageCard,
  Range,
  Position,
  Error,
  VERSION,
  MOBILEDOC_VERSION
};

export function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

export { Editor, UI, Range, Position, MOBILEDOC_VERSION };
export default Mobiledoc;

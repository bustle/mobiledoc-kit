import Editor from './editor/editor';
import * as UI from './editor/ui';
import ImageCard from './cards/image';
import Range from './utils/cursor/range';
import Position from './utils/cursor/position';
import Error from './utils/mobiledoc-error';
import VERSION from './version';
import mobiledocRenderers, { MOBILEDOC_VERSION } from './renderers/mobiledoc/index';

const Mobiledoc = {
  Editor,
  UI,
  ImageCard,
  Range,
  Position,
  Error,
  VERSION,
  mobiledocRenderers
};

export function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

export { Editor, UI, Range, Position, MOBILEDOC_VERSION };
export default Mobiledoc;

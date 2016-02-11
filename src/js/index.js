import Editor from './editor/editor';
import ImageCard from './cards/image';
import Range from './utils/cursor/range';
import Error from './utils/mobiledoc-error';
import VERSION from './version';

const Mobiledoc = {
  Editor,
  ImageCard,
  Range,
  Error,
  VERSION
};

export function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

export { Editor };
export default Mobiledoc;

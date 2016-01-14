import Editor from './editor/editor';
import ImageCard from './cards/image';
import Range from './utils/cursor/range';
import Error from './utils/mobiledoc-error';

const Mobiledoc = {
  Editor,
  ImageCard,
  Range,
  Error
};

export function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

export { Editor };
export default Mobiledoc;

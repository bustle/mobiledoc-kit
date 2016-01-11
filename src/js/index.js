import Editor from './editor/editor';
import ImageCard from './cards/image';
import Range from './utils/cursor/range';

const Mobiledoc = {
  Editor,
  ImageCard,
  Range
};

export function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

export { Editor };
export default Mobiledoc;

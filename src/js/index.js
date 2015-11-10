import Editor from './editor/editor';
import ImageCard from './cards/image';

const Mobiledoc = {
  Editor,
  ImageCard
};

export function registerGlobal(global) {
  global.Mobiledoc = Mobiledoc;
}

export { Editor };
export default Mobiledoc;

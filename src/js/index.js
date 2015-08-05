import Editor from './editor/editor';
import ImageCard from './cards/image';

const ContentKit = {
  Editor,
  ImageCard
};

export function registerGlobal(global) {
  global.ContentKit = ContentKit;
}

export { Editor };
export default ContentKit;

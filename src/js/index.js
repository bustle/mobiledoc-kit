import Editor from './editor/editor';
import BoldCommand from './commands/bold';
import ImageCard from './cards/image';

const ContentKit = {
  Editor,
  ImageCard,
  BoldCommand
};

export function registerGlobal(global) {
  global.ContentKit = ContentKit;
}

export { Editor };
export default ContentKit;

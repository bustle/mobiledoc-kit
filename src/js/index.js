import Editor from './editor/editor';

const ContentKit = {
  Editor
};

export function registerGlobal(global) {
  global.ContentKit = ContentKit;
}

export { Editor };
export default ContentKit;

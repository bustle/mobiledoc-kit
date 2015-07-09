import Editor from './editor/editor';
import DOMRenderer from './runtime/renderers/mobiledoc-dom';

const Runtime = {
  DOMRenderer
}

const ContentKit = {
  Editor, Runtime
};

export function registerGlobal(global) {
  global.ContentKit = ContentKit;
}

export { Editor };
export default ContentKit;

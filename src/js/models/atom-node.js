import { clearChildNodes } from '../utils/dom-utils';

export default class AtomNode {
  constructor(editor, atom, model, element, atomOptions) {
    this.editor = editor;
    this.atom = atom;
    this.model = model;
    this.atomOptions = atomOptions;
    this.element = element;

    this._teardown = null;
  }

  render() {
    this.teardown();

    let fragment = document.createDocumentFragment();

    this._teardown = this.atom.render({
      options: this.atomOptions,
      env: this.env,
      value: this.model.value,
      payload: this.model.payload,
      fragment
    });

    this.element.appendChild(fragment);
  }

  get env() {
    return {
      name: this.atom.name
    };
  }

  teardown() {
    if (this._teardown) {
      this._teardown();
    }

    clearChildNodes(this.element);
  }

}
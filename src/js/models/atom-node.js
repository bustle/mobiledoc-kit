import assert from '../utils/assert';

export default class AtomNode {
  constructor(editor, atom, model, element, atomOptions) {
    this.editor = editor;
    this.atom = atom;
    this.model = model;
    this.atomOptions = atomOptions;
    this.element = element;

    this._teardownCallback = null;
    this._rendered         = null;
  }

  render() {
    this.teardown();

    let rendered = this.atom.render({
      options: this.atomOptions,
      env: this.env,
      value: this.model.value,
      payload: this.model.payload
    });

    this._validateAndAppendRenderResult(rendered);
  }

  get env() {
    return {
      name: this.atom.name,
      onTeardown: (callback) => this._teardownCallback = callback
    };
  }

  teardown() {
    if (this._teardownCallback) {
      this._teardownCallback();
      this._teardownCallback = null;
    }
    if (this._rendered) {
      this.element.removeChild(this._rendered);
      this._rendered = null;
    }
  }

  _validateAndAppendRenderResult(rendered) {
    if (!rendered) {
      return;
    }

    let { atom: { name } } = this;
    assert(
      `Atom "${name}" must return a DOM node (returned value was: "${rendered}")`,
      !!rendered.nodeType
    );
    this.element.appendChild(rendered);
    this._rendered = rendered;
  }

}

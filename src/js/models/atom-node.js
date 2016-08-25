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
    if (!this._rendered) {
      let {atomOptions: options, env, model: { value, payload } } = this;
      // cache initial render
      this._rendered = this.atom.render({options, env, value, payload});
    }

    this._validateAndAppendRenderResult(this._rendered);
  }

  get env() {
    return {
      name: this.atom.name,
      onTeardown: (callback) => this._teardownCallback = callback,
      save: (value, payload={}) => {
        this.model.value = value;
        this.model.payload = payload;

        this.editor._postDidChange();
        this.teardown();
        this.render();
      }
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
  }
}

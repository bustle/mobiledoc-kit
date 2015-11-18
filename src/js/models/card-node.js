import assert from '../utils/assert';

export default class CardNode {
  constructor(editor, card, section, element, options) {
    this.editor  = editor;
    this.card    = card;
    this.section = section;
    this.element = element;
    this.options = options;

    this.mode = null;

    this._teardownCallback = null;
    this._rendered         = null;
  }

  render(mode) {
    if (this.mode === mode) { return; }

    this.teardown();

    this.mode = mode;

    let method = mode === 'display' ? 'render' : 'edit';

    let rendered = this.card[method]({
      env: this.env,
      options: this.options,
      payload: this.section.payload
    });

    this._validateAndAppendRenderResult(rendered);
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

  get env() {
    return {
      name: this.card.name,
      isInEditor: true,
      onTeardown: (callback) => this._teardownCallback = callback,
      edit: () => this.edit(),
      save: (payload, transition=true) => {
        this.section.payload = payload;

        this.editor.didUpdate();
        if (transition) {
          this.display();
        }
      },
      cancel: () => this.display(),
      remove: () => this.remove(),
      postModel: this.section
    };
  }

  display() {
    this.render('display');
  }

  edit() {
    this.render('edit');
  }

  remove() {
    this.editor.run(postEditor => postEditor.removeSection(this.section));
  }

  _validateAndAppendRenderResult(rendered) {
    if (!rendered) {
      return;
    }

    let { card: { name } } = this;
    assert(
      `Card "${name}" must render dom (render value was: "${rendered}")`,
      !!rendered.nodeType
    );
    this.element.appendChild(rendered);
    this._rendered = rendered;
  }
}

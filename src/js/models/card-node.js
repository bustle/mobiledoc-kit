export default class CardNode {
  constructor(editor, card, section, element, cardOptions) {
    this.editor = editor;
    this.card = card;
    this.section = section;
    this.cardOptions = cardOptions;
    this.element = element;

    this.mode = null;
    this.setupResult = null;
  }

  render(mode) {
    if (this.mode === mode) { return; }

    this.teardown();

    this.mode = mode;
    this.setupResult = this.card[mode].setup(
      this.element,
      this.cardOptions,
      this.env,
      this.section.payload
    );
  }

  get env() {
    return {
      name: this.card.name,
      edit: () => { this.edit(); },
      save: (payload) => {
        this.section.payload = payload;

        this.editor.didUpdate();
        this.display();
      },
      cancel: () => { this.display(); }
    };
  }

  display() {
    this.render('display');
  }

  edit() {
    this.render('edit');
  }

  teardown() {
    if (this.mode) {
      if (this.card[this.mode].teardown) {
        this.card[this.mode].teardown(this.setupResult);
      }
    }
  }
}

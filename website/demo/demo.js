/* global Mobiledoc */
'use strict';

$(() => {
  bootstrapEditor();
  bootstrapSimpleDemo();
  bootstrapToolbarEditor();
  bootstrapCardEditor();
});

let bootstrapEditor = () => {
  let el = $('#editor')[0];
  let editor = new Mobiledoc.Editor({
    placeholder: 'Type here',
    autofocus: true
  });
  editor.render(el);
  activateButtons('#editor-wrapper', editor);
  let displayMobiledoc = () => {
    let mobiledoc = editor.serialize();
    let html = mobiledocPrettyJSONRenderer(mobiledoc);
    $('#editor-output').html(html);
  };
  editor.postDidChange(displayMobiledoc);
  displayMobiledoc();
};

let bootstrapSimpleDemo = () => {
  let el = $('#editor-basic')[0];
  let editor = new Mobiledoc.Editor({
    placeholder: 'Welcome to Mobiledoc'
  });
  editor.render(el);
};

let activateButtons = (parentSelector, editor) => {
  $(`${parentSelector} button`).click(function () {
    let button = $(this);
    let action = button.data('action');
    let args = button.data('args').split(',');

    editor[action](...args);
  });
};

let bootstrapToolbarEditor = () => {
  let el = $('#editor-toolbar')[0];
  let editor = new Mobiledoc.Editor({
    placeholder: 'Editor with toolbar'
  });
  editor.render(el);

  activateButtons('#editor-toolbar-wrapper', editor);
};

let bootstrapCardEditor = () => {
  let card = {
    name: 'kitten',
    type: 'dom',
    render() {
      let el = $(`<figure><img src="http://placekitten.com/200/100">
                 <figcaption>Image of a kitten</figcaption>
                 </figure>`);
      return el[0];
    }
  };
  let atom = {
    name: 'mention',
    type: 'dom',
    render() {
      let el = $(`<span style='background-color: #CCC;'>@hello</span>`);
      return el[0];
    }
  };
  let el = $('#editor-card')[0];
  let editor = new Mobiledoc.Editor({
    placeholder: 'Editor with card',
    cards: [card],
    atoms: [atom]
  });
  editor.render(el);
  activateButtons('#editor-card-wrapper', editor);
};
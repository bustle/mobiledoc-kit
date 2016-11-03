/* global Mobiledoc */
'use strict';

$(function () {
  bootstrapEditor();
  bootstrapSimpleDemo();
  bootstrapToolbarEditor();
  bootstrapCardEditor();
});

var bootstrapEditor = function bootstrapEditor() {
  var el = $('#editor')[0];
  var editor = new Mobiledoc.Editor({
    placeholder: 'Type here',
    autofocus: true
  });
  editor.render(el);
  activateButtons('#editor-wrapper', editor);
  var displayMobiledoc = function displayMobiledoc() {
    var mobiledoc = editor.serialize();
    var html = mobiledocPrettyJSONRenderer(mobiledoc);
    $('#editor-output').html(html);
  };
  editor.postDidChange(displayMobiledoc);
  displayMobiledoc();
};

var bootstrapSimpleDemo = function bootstrapSimpleDemo() {
  var el = $('#editor-basic')[0];
  var editor = new Mobiledoc.Editor({
    placeholder: 'Welcome to Mobiledoc'
  });
  editor.render(el);
};

var activateButtons = function activateButtons(parentSelector, editor) {
  $(parentSelector + ' button').click(function () {
    var button = $(this);
    var action = button.data('action');
    var arg = button.data('arg');

    editor[action](arg);
  });
};

var bootstrapToolbarEditor = function bootstrapToolbarEditor() {
  var el = $('#editor-toolbar')[0];
  var editor = new Mobiledoc.Editor({
    placeholder: 'Editor with toolbar'
  });
  editor.render(el);

  activateButtons('#editor-toolbar-wrapper', editor);
};

var bootstrapCardEditor = function bootstrapCardEditor() {
  var card = {
    name: 'kitten',
    type: 'dom',
    render: function render() {
      var el = $('<figure><img src="http://placekitten.com/200/100">\n                 <figcaption>Image of a kitten</figcaption>\n                 </figure>');
      return el[0];
    }
  };
  var atom = {
    name: 'mention',
    type: 'dom',
    render: function render() {
      var el = $('<span style=\'background-color: #CCC;\'>@hello</span>');
      return el[0];
    }
  };
  var el = $('#editor-card')[0];
  var editor = new Mobiledoc.Editor({
    placeholder: 'Editor with card',
    cards: [card],
    atoms: [atom]
  });
  editor.render(el);
  activateButtons('#editor-card-wrapper', editor);
};
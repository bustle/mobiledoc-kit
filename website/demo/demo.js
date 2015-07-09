(function(exports, document, undefined) {

'use strict';

var ContentKit = exports.ContentKit,
    $ = exports.$;

var ContentKitDemo = exports.ContentKitDemo = {
  syncCodePane: function(editor) {
    var codePaneJSON = document.getElementById('serialized-mobiledoc');
    var json = editor.serialize();
    codePaneJSON.innerHTML = this.syntaxHighlight(json);

    var renderer = new ContentKit.Runtime.DOMRenderer();
    var rendered = renderer.render(json);

    $('#rendered-mobiledoc').empty();
    $('#rendered-mobiledoc')[0].appendChild(rendered);
  },

  syntaxHighlight: function(json) {
    // http://stackoverflow.com/a/7220510/189440
    if (typeof json !== 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

};

function bootEditor(element, mobiledoc) {
  var editor = new ContentKit.Editor(element, {
    autofocus: false,
    mobiledoc: mobiledoc,
    cards: {
      'pick-color': function renderPickColor(payload) {
        return 'PICK A COLOR: '+payload.options.join(', ');
      }
    }
  });

  editor.on('update', function() {
    ContentKitDemo.syncCodePane(editor);
  });
}

function readMobiledoc(string) {
  return JSON.parse(string);
}

function isValidJSON(string) {
  try {
    JSON.parse(string);
    return true;
  } catch(e) {
    return false;
  }
}

function attemptEditorReboot(editor, textarea) {
  var textPayload = $(textarea).val();
  if (isValidJSON(textPayload)) {
    var mobiledoc = readMobiledoc(textPayload);
    if (editor) {
      editor.destroy();
    }
    bootEditor($('#editor')[0], mobiledoc);
  }
}

var sampleMobiledocs = {
  simpleMobiledoc: [
    [],
    [
      [1, "H2", [
        [[], 0, "headline h2"]
      ]],
      [1, "P", [
        [[], 0, "hello world"]
      ]]
    ]
  ],

  mobileDocWithMarker: [
    [['B']],
    [
      [1, "H2", [
        [[], 0, "headline h2"]
      ]],
      [1, "P", [
        [[0], 1, "bold world"]
      ]]
    ]
  ],

  mobileDocWithMultipleMarkers: [
    [['B'], ['I']],
    [
      [1, "H2", [
        [[], 0, "headline h2"]
      ]],
      [1, "P", [
        [[], 0, "hello "],
        [[0], 1, "bold, "],
        [[1], 1, "italic "],
        [[], 0, "world."]
      ]]
    ]
  ],

  mobileDocWithAttributeMarker: [
    [['A', ['href', 'http://github.com/bustlelabs/content-kit-editor']]],
    [
      [1, "H2", [
        [[], 0, "headline h2"]
      ]],
      [1, "P", [
        [[], 0, "see it "],
        [[0], 1, "on github."]
      ]]
    ]
  ]
};


$(function() {
  var editor;
  var editorEl = $('#editor')[0];
  var mobiledoc = sampleMobiledocs.simpleMobiledoc;

  var textarea = $('#mobiledoc-to-load textarea');
  textarea.val(JSON.stringify(mobiledoc, false, 2));

  textarea.on('input', function() {
    attemptEditorReboot(editor, textarea);
  });

  $('#select-mobiledoc').on('change', function() {
    var mobiledocName = $(this).val();
    var mobiledoc = sampleMobiledocs[mobiledocName];
    textarea.val(JSON.stringify(mobiledoc, false, 2));
    textarea.trigger('input');
  });

  bootEditor(editorEl, mobiledoc);
  $(editorEl).focus();
});

}(this, document));

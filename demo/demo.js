(function(exports, document, undefined) {

'use strict';

var ContentKitDemo = exports.ContentKitDemo = {
  syncCodePane: function(editor) {
    var codePaneJSON = document.getElementById('serialized-mobiledoc');
    var json = editor.serialize();
    codePaneJSON.innerHTML = this.syntaxHighlight(json);
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

$(function() {
  var textarea = $('#mobiledoc-to-load textarea');
  var textPayload = textarea.val();
  var payload = JSON.parse(textPayload);
  var editorF = new ContentKit.Editor($('#editor')[0], {
    mobiledoc: payload,
    cards: {
      'pick-color': function renderPickColor(payload) {
        return 'PICK A COLOR: '+payload.options.join(', ');
      }
    }
  });

  editorF.on('update', function(editor) {
    ContentKitDemo.syncCodePane(editor);
  });
});

}(this, document));

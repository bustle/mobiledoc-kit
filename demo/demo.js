(function(exports, document, undefined) {

'use strict';

var ContentKitDemo = exports.ContentKitDemo = {
  toggleCodePane: function() {
    if(document.body.className === 'code-pane-open') {
      this.closeCodePane();
    } else {
      this.openCodePane(editor);
    }
  },

  openCodePane: function() {
    window.getSelection().removeAllRanges();
    document.body.className = 'code-pane-open';
    location.hash = 'code';
  },

  closeCodePane: function() {
    window.getSelection().removeAllRanges();
    document.body.className = '';
    location.hash = '';
  },

  syncCodePane: function(editor) {
    var codePaneJSON = document.getElementById('code-json');
    var codePaneHTML = document.getElementById('code-html');
    var json = editor.serialize();
    codePaneJSON.innerHTML = this.syntaxHighlight(json);
  },

  formatXML: function(xml) {
    // https://gist.github.com/sente/1083506
    xml = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
    var formatted = '';
    var pad = 0;
    var nodes = xml.split('\r\n');
    var nodeLen = nodes.length;
    var node, indent, padding, i, j;
    for(i = 0; i < nodeLen; i++) {
      node = nodes[i];
      if (node.match( /.+<\/\w[^>]*>$/ )) {
        indent = 0;
      } else if (node.match( /^<\/\w/ )) {
        if (pad != 0) {
          pad -= 1;
        }
      } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
        indent = 1;
      } else {
        indent = 0;
      }

      padding = '';
      for (j = 0; j < pad; j++) {
        padding += '  ';
      }

      formatted += padding + node + '\r\n';
      pad += indent;
    }
 
    return formatted;
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

// Initialize
if (window.editor) {
  ContentKitDemo.syncCodePane(editor);
  editor.on('update', function() {
    ContentKitDemo.syncCodePane(this);
  });
  var settingsBtn = document.getElementById('settings-btn');
  settingsBtn.addEventListener('click', function() {
    ContentKitDemo.toggleCodePane();
  });
}
if (location.hash === '#code') {
  ContentKitDemo.openCodePane();
}

}(this, document));

(function(exports, document, undefined) {

'use strict';

exports.ContentKitDemo = {
  toggleCode: function(e, button, editor) {
    var codeUI = document.getElementById('code-panes'),
        editorUI = editor.element;
        
    if(codeUI.style.display === '') {
      var codePaneJSON = document.getElementById('code-json'),
          codePaneHTML = document.getElementById('code-html'),
          json = editor.model,
          html = editor.compiler.render(json);

      codePaneJSON.innerHTML = this.syntaxHighlight(json);
      codePaneHTML.textContent = this.formatXML(html);

      window.getSelection().removeAllRanges();

      codeUI.style.display = 'block';
      editorUI.style.display = 'none';
      button.textContent = 'Show Editor';
    } else {
      codeUI.style.display = '';
      editorUI.style.display = 'block';
      button.textContent = 'Show Code';
    }
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

}(this, document));

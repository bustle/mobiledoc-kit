(function(exports, document, undefined) {
'use strict';

function removeChildren(element) {
  for (var i=0; i < element.childNodes.length; i++) {
    element.removeChild(element.childNodes[i]);
  }
}

var editor;

var selfieCard = {
  name: 'selfie-card',
  display: {
    setup: function(element, options, env, payload) {
      removeChildren(element);

      if (payload.src) {
        element.appendChild(
          $('' +
              '<div>' +
                '<img src="' + payload.src + '"><br>' +
                '<div>You look nice today.</div>' +
                (env.edit ? "<div><button id='go-edit'>Take a better picture</button></div>" : "") +
              '</div>' +
            '')[0]
        );
      } else {
        element.appendChild($('' +
          '<div>' +
            'Hello there!' +
            (env.edit ? "<button id='go-edit'>Click here to take a picture</button>" : "") +
          '</div>')[0]
        );
      }

      $('#go-edit').click(function() {
        env.edit();
      });
    }
  },
  edit: {
    setup: function(element, options, env) {
      removeChildren(element);

      var vid = $('' +
        '<div>' +
          '<video id="video" width="160" height="120" autoplay></video>' +
          '<button id="snap">Snap Photo</button>' +
          '<canvas id="canvas" width="160" height="120"></canvas>' +
        '</div>' +
      '');
      element.appendChild(vid[0]);

      var canvas = document.getElementById("canvas"),
          context = canvas.getContext("2d"),
          video = document.getElementById("video"),
          videoObj = { "video": true },
          errBack = function(error) {
            alert('error getting video feed');
          };

      navigator.getMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

      navigator.getMedia(videoObj, function(stream) {
        var vendorURL;
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          vendorURL = window.URL || window.webkitURL;
          video.src = vendorURL.createObjectURL(stream);
          video.play();
        }

        $('#snap').click(function() {
          context.drawImage(video, 0, 0, 160, 120);
          var src = canvas.toDataURL('image/png');
          env.save({src: src});
        });
      }, errBack);
    }
  }
};

var simpleCard = {
  name: 'simple-card',
  display: {
    setup: function(element, options, env) {
      var card = document.createElement('span');
      card.innerHTML = 'Hello, world';
      element.appendChild(card);
      var button = $('<button>Remove card</button>');
      button.on('click', env.remove);
      $(element).append(button);
    }
  }
};

var cardWithEditMode = {
  name: 'edit-card',
  display: {
    setup: function(element, options, env) {
      removeChildren(element);
      var card = document.createElement('div');
      card.innerHTML = 'I am in display mode';

      var button = document.createElement('button');
      button.innerText = 'Change to edit';
      button.onclick = env.edit;

      if (env.edit) {
        card.appendChild(button);
      }
      element.appendChild(card);
    }
  },
  edit: {
    setup: function(element, options, env) {
      removeChildren(element);
      var card = document.createElement('div');
      card.innerHTML = 'I am in edit mode';

      var button = document.createElement('button');
      button.innerText = 'Change to display';
      button.onclick = env.save;

      card.appendChild(button);
      element.appendChild(card);
    }
  }
};

var cardWithInput = {
  name: 'input-card',
  display: {
    setup: function(element, options, env, payload) {
      removeChildren(element);

      var text = 'I am in display mode';
      if (payload.name) {
        text = 'Hello, ' + payload.name + '!';
      }
      var card = document.createElement('div');
      card.innerText = text;

      var button = document.createElement('button');
      button.innerText = 'Edit';
      button.onclick = env.edit;

      if (env.edit) {
        card.appendChild(button);
      }
      element.appendChild(card);
    }
  },
  edit: {
    setup: function(element, options, env) {
      removeChildren(element);
      var card = document.createElement('div');
      card.innerHTML = 'What is your name?';

      var input = document.createElement('input');
      input.placeholder = 'Enter your name...';

      var button = document.createElement('button');
      button.innerText = 'Save';
      button.onclick = function() {
        var name = input.value;
        env.save({name:name});
      };

      card.appendChild(input);
      card.appendChild(button);
      element.appendChild(card);
    }
  }
};

var ContentKit = exports.ContentKit,
    $ = exports.$,
    MobiledocHTMLRenderer = exports.MobiledocHTMLRenderer,
    MobiledocDOMRenderer = exports.MobiledocDOMRenderer;

var ContentKitDemo = exports.ContentKitDemo = {
  syncCodePane: function(editor) {
    var codePaneJSON = document.getElementById('serialized-mobiledoc');
    var mobiledoc = editor.serialize();
    codePaneJSON.innerText = JSON.stringify(mobiledoc, null, '  ');

    var cards = {
      'simple-card': simpleCard,
      'edit-card': cardWithEditMode,
      'input-card': cardWithInput,
      'selfie-card': selfieCard,
      'image': ContentKit.ImageCard
    };
    var renderer = new MobiledocDOMRenderer();
    var rendered;
    try {
      rendered = renderer.render(mobiledoc, document.createElement('div'), cards);
    } catch (e) {
      rendered = document.createTextNode('Error rendering: ' + e);
    }

    $('#rendered-mobiledoc').empty();
    $('#rendered-mobiledoc')[0].appendChild(rendered);

    var displayHTML = function(html) {
      return html.replace(/&/g,'&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;');
    };

    // adds a pipe ("|") between adjacent text nodes for visual debugging
    var debugNodeHTML = function(node) {
      function convertTextNodes(parentNode, converterFn) {
        var iterator = document.createNodeIterator(parentNode, NodeFilter.SHOW_TEXT);
        var node = iterator.nextNode();
        while (node) {
          converterFn(node);
          node = iterator.nextNode();
        }
      }

      function markAdjacentTextNodes(textNode) {
        var boxChar = '\u2591',
            emptySquareChar = '\u25A2',
            invisibleChar = '\u200C';
        var nextSibling = textNode.nextSibling;
        if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
          textNode.textContent = textNode.textContent + boxChar;
        }
        textNode.textContent = textNode.textContent.replace(new RegExp(invisibleChar, 'g'),
                                                            emptySquareChar);
      }

      var deep = true;
      var cloned = node.cloneNode(deep);
      convertTextNodes(cloned, markAdjacentTextNodes);
      return displayHTML(cloned.innerHTML);
    };

    var htmlRenderer = new MobiledocHTMLRenderer();
    var renderedHTML;
    try {
      renderedHTML = htmlRenderer.render(mobiledoc);
    } catch (e) {
      renderedHTML = 'Error rendering: ' + e;
    }

    $('#rendered-mobiledoc-html').html(displayHTML(renderedHTML));

    var editorHTML = debugNodeHTML($('#editor')[0]);
    $('#editor-html').html(editorHTML);
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
  if (editor) {
    editor.destroy();
  }
  editor = new ContentKit.Editor({
    autofocus: false,
    mobiledoc: mobiledoc,
    placeholder: 'Write something here...',
    cards: [simpleCard, cardWithEditMode, cardWithInput, selfieCard],
    cardOptions: {
      image: {
        uploadUrl: 'http://localhost:5000/upload'
      }
    }
  });
  var didRenderCallback = function() {ContentKitDemo.syncCodePane(editor);};
  editor.didRender(didRenderCallback);
  editor.render(element);
}

function readMobiledoc(string) {
  return JSON.parse(string);
}

function isValidJSON(string) {
  try {
    window.JSON.parse(string);
    return true;
  } catch(e) {
    return false;
  }
}

function attemptEditorReboot(editor, textPayload) {
  if (isValidJSON(textPayload)) {
    var mobiledoc = readMobiledoc(textPayload);
    if (editor) {
      editor.destroy();
    }
    bootEditor($('#editor')[0], mobiledoc);
  }
}

var MOBILEDOC_VERSION = "0.1";
var sampleMobiledocs = {
  simpleMobiledoc: {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, "H2", [
          [[], 0, "headline h2"]
        ]],
        [1, "P", [
          [[], 0, "hello world"]
        ]]
      ]
    ]
  },

  emptyMobiledoc: {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      []
    ]
  },

  simpleMobiledocWithList: {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, "H2", [
          [[], 0, "To do today:"]
        ]],
        [3, 'ul', [
          [[[], 0, 'buy milk']],
          [[[], 0, 'water plants']],
          [[[], 0, 'world domination']]
        ]]
      ]
    ]
  },

  mobileDocWithMarker: {
    version: MOBILEDOC_VERSION,
    sections: [
      [['B']],
      [
        [1, "H2", [
          [[], 0, "headline h2"]
        ]],
        [1, "P", [
          [[0], 1, "bold world"]
        ]]
      ]
    ]
  },

  mobileDocWithMultipleMarkers: {
    version: MOBILEDOC_VERSION,
    sections: [
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
    ]
  },

  mobileDocWithAttributeMarker: {
    version: MOBILEDOC_VERSION,
    sections: [
      [['A', ['href', 'http://github.com/bustlelabs/content-kit-editor']]],
      [
        [1, "H2", [
          [[], 0, "headline h2"]
        ]],
        [1, "P", [
          [[], 0, "see it "],
          [[0], 1, "on github"],
          [[], 0, "."]
        ]]
      ]
    ]
  },

  mobileDocWithSimpleCard: {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [10, "simple-card"]
      ]
    ]
  },

  mobileDocWithEditCard: {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, "H2", [
          [[], 0, "Edit Card"]
        ]],
        [10, "edit-card"]
      ]
    ]
  },

  mobileDocWithInputCard: {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, "H2", [
          [[], 0, "Input Card"]
        ]],
        [10, "input-card"],
        [1, "P", [
          [[], 0, "Text after the card."]
        ]]
      ]
    ]
  },

  mobileDocWithSelfieCard: {
    version: MOBILEDOC_VERSION,
    sections: [
      [],
      [
        [1, "H2", [
          [[], 0, "SelfieCard"]
        ]],
        [10, "selfie-card"]
      ]
    ]
  }
};


$(function() {
  var editorEl = $('#editor')[0];
  var mobiledoc = sampleMobiledocs.simpleMobiledoc;

  var textarea = $('#mobiledoc-to-load textarea');
  textarea.val(window.JSON.stringify(mobiledoc, false, 2));

  textarea.on('input', function() {
  });

  $('#select-mobiledoc').on('change', function() {
    var mobiledocName = $(this).val();
    var mobiledoc = sampleMobiledocs[mobiledocName];
    var text = window.JSON.stringify(mobiledoc, false, 2);
    attemptEditorReboot(editor, text);
  });

  bootEditor(editorEl, mobiledoc);
  $(editorEl).focus();
});

}(this, document));

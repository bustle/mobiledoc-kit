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

      if (payload.imageSrc) {
        element.appendChild(
          $('' +
              '<div>' +
                '<img src="' + payload.imageSrc + '"><br>' +
                '<div>You look nice today.</div>' +
                (env.edit ? "<div><button id='go-edit'>Take a better picture</button></div>" : "") +
                '<div><button id="go-edit">Take a better picture</button></div>' +
              '</div>' +
            '')[0]
        );
      } else {
        element.appendChild($('' +
          '<div>' +
            'Hello there!' +
            (env.edit ? "<button id='go-edit'>Click here to take a picture</button>" : "")
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
      if (!navigator.webkitGetUserMedia) {
        alert('Cannot get your video because no navigator.webkitGetUserMedia');
      }
      navigator.webkitGetUserMedia(videoObj, function(stream) {
        video.src = window.webkitURL.createObjectURL(stream);
        video.play();

        $('#snap').click(function() {
          context.drawImage(video, 0, 0, 160, 120);
          var imageSrc = canvas.toDataURL('image/png');
          env.save({imageSrc: imageSrc});
        });
      }, errBack);
    }
  }
};

var simpleCard = {
  name: 'simple-card',
  display: {
    setup: function(element) {
      var card = document.createElement('span');
      card.innerHTML = 'Hello, world';
      element.appendChild(card);
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

      card.appendChild(button);
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

      card.appendChild(button);
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
    codePaneJSON.innerHTML = this.syntaxHighlight(mobiledoc);

    var cards = {
      'simple-card': simpleCard,
      'edit-card': cardWithEditMode,
      'input-card': cardWithInput,
      'selfie-card': selfieCard
    };
    var renderer = new MobiledocDOMRenderer();
    var rendered = renderer.render(mobiledoc, document.createElement('div'), cards);

    $('#rendered-mobiledoc').empty();
    $('#rendered-mobiledoc')[0].appendChild(rendered);

    var htmlRenderer = new MobiledocHTMLRenderer();
    var html = htmlRenderer.render(mobiledoc);

    html = html.replace(/&/g,'&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;');

    $('#rendered-mobiledoc-html').html(html);
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
  editor = new ContentKit.Editor(element, {
    autofocus: false,
    mobiledoc: mobiledoc,
    cards: [simpleCard, cardWithEditMode, cardWithInput, selfieCard]
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
    window.JSON.parse(string);
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
  ],

  mobileDocWithSimpleCard: [
    [],
    [
      [1, "H2", [
        [[], 0, "Simple Card"]
      ]],
      [10, "simple-card"]
    ]
  ],

  mobileDocWithEditCard: [
    [],
    [
      [1, "H2", [
        [[], 0, "Edit Card"]
      ]],
      [10, "edit-card"]
    ]
  ],

  mobileDocWithInputCard: [
    [],
    [
      [1, "H2", [
        [[], 0, "Input Card"]
      ]],
      [10, "input-card"]
    ]
  ],

  mobileDocWithSelfieCard: [
    [],
    [
      [1, "H2", [
        [[], 0, "SelfieCard"]
      ]],
      [10, "selfie-card"]
    ]
  ]
};


$(function() {
  var editorEl = $('#editor')[0];
  var mobiledoc = sampleMobiledocs.simpleMobiledoc;

  var textarea = $('#mobiledoc-to-load textarea');
  textarea.val(window.JSON.stringify(mobiledoc, false, 2));

  textarea.on('input', function() {
    attemptEditorReboot(editor, textarea);
  });

  $('#select-mobiledoc').on('change', function() {
    var mobiledocName = $(this).val();
    var mobiledoc = sampleMobiledocs[mobiledocName];
    textarea.val(window.JSON.stringify(mobiledoc, false, 2));
    textarea.trigger('input');
  });

  bootEditor(editorEl, mobiledoc);
  $(editorEl).focus();
});

}(this, document));

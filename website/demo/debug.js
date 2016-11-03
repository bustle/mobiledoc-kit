/* global Mobiledoc */
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var editor;

function renderSection(section) {
  return '[' + 'Section: tagName ' + section.tagName + ' type: ' + section.type + ' isNested? ' + section.isNested + (section.isMarkerable ? ' Markers: ' + section.markers.length + ')' : '') + ']';
}

function renderPosition(pos) {
  if (pos.isBlank) {
    return '[Blank Position]';
  }
  return '[Position: ' + pos.leafSectionIndex + ':' + pos.offset + '. Section ' + renderSection(pos.section) + ']';
}

function updateCursor() {
  var range = editor.range;

  var head = renderPosition(range.head);
  var tail = renderPosition(range.tail);
  var html = 'Head ' + head + '<br>Tail ' + tail;

  $('#cursor').html(html);
}

function renderMarkup(markup) {
  function renderAttrs(obj) {
    var str = Object.keys(obj).reduce(function (memo, key) {
      memo += key + ': ' + obj[key];
      return memo;
    }, '{');
    str += '}';
    return str;
  }
  return '[' + markup.type + ' tagName <b>' + markup.tagName + '</b> attrs: ' + renderAttrs(markup.attributes) + ']';
}

function updatePost() {
  var serialized = editor.serialize();
  $('#post').html(JSON.stringify(serialized));
}

function updateInputMode() {
  var activeMarkups = editor.activeMarkups.map(renderMarkup).join(',');
  var activeSections = editor.activeSections.map(renderSection).join(',');
  var html = 'Active Markups: ' + activeMarkups + '<br>Active Sections: ' + activeSections;
  $('#input-mode').html(html);
}

function updateButtons() {
  var activeSectionTagNames = editor.activeSections.map(function (section) {
    return section.tagName;
  });
  var activeMarkupTagNames = editor.activeMarkups.map(function (markup) {
    return markup.tagName;
  });

  $('#toolbar button').each(function () {
    var toggle = $(this).data('toggle');

    var hasSection = false,
        hasMarkup = false;
    if (activeSectionTagNames.indexOf(toggle) !== -1) {
      hasSection = true;
    }
    if (activeMarkupTagNames.indexOf(toggle) !== -1) {
      hasMarkup = true;
    }
    if (hasSection || hasMarkup) {
      $(this).addClass('active');
    } else {
      $(this).removeClass('active');
    }
  });
}

var mentionAtom = {
  name: 'mention',
  type: 'dom',
  render: function render(_ref) {
    var value = _ref.value;

    var el = $('<span>@' + value + '</span>')[0];
    return el;
  }
};

var clickAtom = {
  name: 'click',
  type: 'dom',
  render: function render(_ref2) {
    var env = _ref2.env;
    var value = _ref2.value;
    var payload = _ref2.payload;

    var el = document.createElement('button');
    var clicks = payload.clicks || 0;
    el.appendChild(document.createTextNode('Clicks: ' + clicks));
    el.onclick = function () {
      payload.clicks = payload.clicks || 0;
      payload.clicks++;
      env.save(value, payload);
    };
    return el;
  }
};

var tableCard = {
  name: 'table',
  type: 'dom',
  render: function render() {
    var _map = ['table', 'tr', 'td'].map(function (tagName) {
      return document.createElement(tagName);
    });

    var _map2 = _slicedToArray(_map, 3);

    var table = _map2[0];
    var tr = _map2[1];
    var td = _map2[2];

    table.appendChild(tr);
    tr.appendChild(td);
    td.appendChild(document.createTextNode("I was created from a pasted table"));

    return table;
  }
};

function moveCard(section, dir) {
  editor.run(function (postEditor) {
    if (dir === 'up') {
      postEditor.moveSectionUp(section);
    } else {
      postEditor.moveSectionDown(section);
    }
  });
}

var movableCard = {
  name: 'movable',
  type: 'dom',
  render: function render(_ref3) {
    var env = _ref3.env;
    var payload = _ref3.payload;

    var cardSection = env.postModel;
    var text = payload.text || 'new';
    var up = $('<button>up</button>').click(function () {
      return moveCard(cardSection, 'up');
    });
    var down = $('<button>down</button>').click(function () {
      return moveCard(cardSection, 'down');
    });
    var x = $('<button>X</button>').click(env.remove);

    var edit = $('<button>edit</button>').click(env.edit);

    var el = $('<div>').append([text, up, down, x, edit])[0];
    return el;
  },
  edit: function edit(_ref4) {
    var env = _ref4.env;
    var payload = _ref4.payload;

    var cardSection = env.postModel;
    var text = payload.text || 'new';
    var up = $('<button>up</button>').click(function () {
      return moveCard(cardSection, 'up');
    });
    var down = $('<button>down</button>').click(function () {
      return moveCard(cardSection, 'down');
    });
    var x = $('<button>X</button>').click(env.remove);

    var input = $('<input>');
    var save = $('<button>save</button>').click(function () {
      payload.text = input.val();
      env.save(payload);
    });
    var el = $('<div>').append([text, up, down, x, input, save])[0];
    return el;
  }
};

function speakingPlugin(node, builder, _ref5) {
  var addSection = _ref5.addSection;
  var addMarkerable = _ref5.addMarkerable;
  var nodeFinished = _ref5.nodeFinished;

  console.log('got node!', node);
}

function tableConverterPlugin(node, builder, _ref6) {
  var addSection = _ref6.addSection;
  var addMarkerable = _ref6.addMarkerable;
  var nodeFinished = _ref6.nodeFinished;

  if (node.tagName !== 'TABLE') {
    return;
  }

  var tableCard = builder.createCardSection("table");
  addSection(tableCard);
  nodeFinished();
}

$(function () {
  var el = $('#editor')[0];
  editor = new Mobiledoc.Editor({
    placeholder: 'write something',
    autofocus: true,
    atoms: [mentionAtom, clickAtom],
    parserPlugins: [speakingPlugin, tableConverterPlugin],
    cards: [tableCard, movableCard]
  });

  editor.cursorDidChange(updateCursor);
  editor.postDidChange(updatePost);
  editor.inputModeDidChange(updateInputMode);

  editor.inputModeDidChange(updateButtons);

  editor.render(el);

  $('#toolbar button.toggle').click(function () {
    var action = $(this).data('action');
    var toggle = $(this).data('toggle');

    editor[action](toggle);
  });

  $('#toolbar button.insert-atom').click(function () {
    var name = $(this).data('name');
    var value = $(this).data('value') || '';
    editor.insertAtom(name, value);
  });

  $('#toolbar button.insert-card').click(function () {
    var name = $(this).data('name');
    editor.insertCard(name);
  });
});
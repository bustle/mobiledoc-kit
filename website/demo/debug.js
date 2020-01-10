/* global Mobiledoc */
'use strict';

var editor;

function renderError(event) {
  let error = event.error;
  $('#error .name').text(error.name);
  $('#error .message').text(error.message);
}

window.addEventListener('error', renderError);

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

document.addEventListener('selectionchange', renderNativeSelection);

function renderNativeSelection(event) {
  let sel = window.getSelection();
  let { anchorNode, focusNode, anchorOffset, focusOffset, isCollapsed, rangeCount } = sel;
  if (anchorNode === null && focusNode === null) {
    $('#selection').html(`<em>None</em>`);
    return;
  }
  $('#selection').html(`
    <div class='node'>Anchor: ${renderNode(anchorNode)} (${anchorOffset})</div>
    <div class='node'>Focus: ${renderNode(focusNode)} (${focusOffset})</div>
    <div>${isCollapsed ? 'Collapsed' : 'Not collapsed'}</div>
    <div class='ranges'>Ranges: ${rangeCount}</div>
  `);
}

function renderNode(node) {
  let text = node.textContent.slice(0, 22);
  if (node.textContent.length > 22) {
    text += '...';
  }

  let type = node.nodeType === Node.TEXT_NODE ? 'text' : `el (${node.tagName})`;
  return `<span class='type'>${type}</span>: ${text}`;
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
  let activeSectionTagNames = editor.activeSections.map(section => {
    return section.tagName;
  });
  let activeMarkupTagNames = editor.activeMarkups.map(markup => markup.tagName);

  $('#toolbar button').each(function () {
    let toggle = $(this).data('toggle');

    let hasSection = false,
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

let mentionAtom = {
  name: 'mention',
  type: 'dom',
  render({ value }) {
    let el = $(`<span>@${value}</span>`)[0];
    return el;
  }
};

let clickAtom = {
  name: 'click',
  type: 'dom',
  render({ env, value, payload }) {
    let el = document.createElement('button');
    let clicks = payload.clicks || 0;
    el.appendChild(document.createTextNode('Clicks: ' + clicks));
    el.onclick = () => {
      payload.clicks = payload.clicks || 0;
      payload.clicks++;
      env.save(value, payload);
    };
    return el;
  }
};

let tableCard = {
  name: 'table',
  type: 'dom',
  render() {
    let [table, tr, td] = ['table', 'tr', 'td'].map(tagName => document.createElement(tagName));

    table.appendChild(tr);
    tr.appendChild(td);
    td.appendChild(document.createTextNode("I was created from a pasted table"));

    return table;
  }
};

function moveCard(section, dir) {
  editor.run(postEditor => {
    if (dir === 'up') {
      postEditor.moveSectionUp(section);
    } else {
      postEditor.moveSectionDown(section);
    }
  });
}

let movableCard = {
  name: 'movable',
  type: 'dom',
  render({ env, payload }) {
    let cardSection = env.postModel;
    let text = payload.text || 'new';
    let up = $('<button>up</button>').click(() => moveCard(cardSection, 'up'));
    let down = $('<button>down</button>').click(() => moveCard(cardSection, 'down'));
    let x = $('<button>X</button>').click(env.remove);

    let edit = $('<button>edit</button>').click(env.edit);

    let el = $('<div>').append([text, up, down, x, edit])[0];
    return el;
  },
  edit({ env, payload }) {
    let cardSection = env.postModel;
    let text = payload.text || 'new';
    let up = $('<button>up</button>').click(() => moveCard(cardSection, 'up'));
    let down = $('<button>down</button>').click(() => moveCard(cardSection, 'down'));
    let x = $('<button>X</button>').click(env.remove);

    let input = $('<input>');
    let save = $('<button>save</button>').click(() => {
      payload.text = input.val();
      env.save(payload);
    });
    let el = $('<div>').append([text, up, down, x, input, save])[0];
    return el;
  }
};

function speakingPlugin(node, builder, { addSection, addMarkerable, nodeFinished }) {
  console.log('got node!', node);
}

function tableConverterPlugin(node, builder, { addSection, addMarkerable, nodeFinished }) {
  if (node.tagName !== 'TABLE') {
    return;
  }

  let tableCard = builder.createCardSection("table");
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
    let action = $(this).data('action');
    let toggle = $(this).data('toggle');

    editor[action](toggle);
  });

  $('#toolbar button.toggle-method').click(function () {
    let isOn = $(this).data('is-on') === 'true';
    let methodOn = $(this).data('on');
    let methodOff = $(this).data('off');

    let nextState = isOn ? 'false' : 'true';
    let method = isOn ? methodOff : methodOn;

    $(this).data('is-on', nextState);
    editor[method]();
  });

  $('#toolbar button.insert-atom').click(function () {
    let name = $(this).data('name');
    let value = $(this).data('value') || '';
    editor.insertAtom(name, value);
  });

  $('#toolbar button.insert-card').click(function () {
    let name = $(this).data('name');
    editor.insertCard(name);
  });
});
import { Editor } from './mobiledoc.js';

let editor;

function renderError(event) {
  let error = event.error;
  document.querySelector('#error .name').innerText = error.name;
  document.querySelector('#error .message').innerText = error.message;
}

window.addEventListener('error', renderError);

function renderSection(section) {
  return (
    '[' +
    'Section: tagName ' +
    section.tagName +
    ' type: ' +
    section.type +
    ' isNested? ' +
    section.isNested +
    (section.isMarkerable ? ' Markers: ' + section.markers.length + ')' : '') +
    ']'
  );
}

function renderPosition(pos) {
  if (pos.isBlank) {
    return '[Blank Position]';
  }
  return (
    '[Position: ' +
    pos.leafSectionIndex +
    ':' +
    pos.offset +
    '. Section ' +
    renderSection(pos.section) +
    ']'
  );
}

function updateCursor() {
  const range = editor.range;

  const head = renderPosition(range.head);
  const tail = renderPosition(range.tail);
  const html = 'Head ' + head + '<br>Tail ' + tail;

  document.querySelector('#cursor').innerHTML = html;
}

document.addEventListener('selectionchange', renderNativeSelection);

function renderNativeSelection() {
  const selection = window.getSelection();
  const {
    anchorNode,
    focusNode,
    anchorOffset,
    focusOffset,
    isCollapsed,
    rangeCount
  } = selection;
  if (anchorNode === null && focusNode === null) {
    document.querySelector('#selection').innerHTML = `<em>None</em>`;
    return;
  }
  document.querySelector('#selection').innerHTML = `
    <div class='node'>Anchor: ${renderNode(anchorNode)} (${anchorOffset})</div>
    <div class='node'>Focus: ${renderNode(focusNode)} (${focusOffset})</div>
    <div>${isCollapsed ? 'Collapsed' : 'Not collapsed'}</div>
    <div class='ranges'>Ranges: ${rangeCount}</div>
  `;
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
    let str = Object.keys(obj).reduce(function(memo, key) {
      memo += key + ': ' + obj[key];
      return memo;
    }, '{');
    str += '}';
    return str;
  }
  return (
    '[' +
    markup.type +
    ' tagName <b>' +
    markup.tagName +
    '</b> attrs: ' +
    renderAttrs(markup.attributes) +
    ']'
  );
}

function updatePost() {
  const serialized = editor.serialize();
  document.querySelector('#post').innerHTML = JSON.stringify(serialized);
}

function updateInputMode() {
  const activeMarkups = editor.activeMarkups.map(renderMarkup).join(',');
  const activeSections = editor.activeSections.map(renderSection).join(',');
  const html =
    'Active Markups: ' +
    activeMarkups +
    '<br>Active Sections: ' +
    activeSections;
  document.querySelector('#input-mode').innerHTML = html;
}

function updateButtons() {
  const activeSectionTagNames = editor.activeSections.map(section => {
    return section.tagName;
  });
  const activeMarkupTagNames = editor.activeMarkups.map(
    markup => markup.tagName
  );

  document.querySelectorAll('#toolbar button').forEach(button => {
    const toggle = button.getAttribute('data-toggle');

    let hasSection = false,
      hasMarkup = false;
    if (activeSectionTagNames.indexOf(toggle) !== -1) {
      hasSection = true;
    }
    if (activeMarkupTagNames.indexOf(toggle) !== -1) {
      hasMarkup = true;
    }
    if (hasSection || hasMarkup) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

let mentionAtom = {
  name: 'mention',
  type: 'dom',
  render({ value }) {
    let el = document.createElement(`span`);
    el.innerHTML = `@${value}`;
    return el;
  }
};

let clickAtom = {
  name: 'click',
  type: 'dom',
  render({ env, value, payload }) {
    const el = document.createElement('button');
    const clicks = payload.clicks || 0;
    el.appendChild(document.createTextNode('Clicks: ' + clicks));
    el.onclick = () => {
      payload.clicks = payload.clicks || 0;
      payload.clicks++;
      env.save(value, payload);
    };
    return el;
  }
};

const tableCard = {
  name: 'table',
  type: 'dom',
  render() {
    const [table, tr, td] = ['table', 'tr', 'td'].map(tagName =>
      document.createElement(tagName)
    );

    table.appendChild(tr);
    tr.appendChild(td);
    td.appendChild(
      document.createTextNode('I was created from a pasted table')
    );

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

const movableCard = {
  name: 'movable',
  type: 'dom',
  render({ env, payload }) {
    const cardSection = env.postModel;
    const text = document.createTextNode(payload.text || 'new');

    const upButton = document.createElement('button');
    upButton.innerText = `up`;
    upButton.addEventListener('click', () => moveCard(cardSection, 'up'));

    const downButton = document.createElement('button');
    downButton.innerText = `down`;
    downButton.addEventListener('click', () => moveCard(cardSection, 'down'));

    const xButton = document.createElement('button');
    xButton.innerText = `X`;
    xButton.addEventListener('click', env.remove);

    const editButton = document.createElement('button');
    editButton.innerText = `edit`;
    editButton.addEventListener('click', env.edit);

    let el = document.createElement('div');
    [text, upButton, downButton, xButton, editButton].forEach(button => {
      el.appendChild(button);
    });

    return el;
  },
  edit({ env, payload }) {
    const cardSection = env.postModel;
    const text = document.createTextNode(payload.text || 'new');

    const upButton = document.createElement('button');
    upButton.innerText = `up`;
    upButton.addEventListener('click', () => moveCard(cardSection, 'up'));

    const downButton = document.createElement('button');
    downButton.innerText = `down`;
    downButton.addEventListener('click', () => moveCard(cardSection, 'down'));

    const xButton = document.createElement('button');
    xButton.innerText = `X`;
    xButton.addEventListener('click', env.remove);

    const input = document.createElement('input');
    const save = document.createElement('button');
    save.innerText = 'save';

    save.addEventListener('click', () => {
      payload.text = input.value;
      env.save(payload);
    });

    const el = document.createElement('div');
    [text, upButton, downButton, xButton, input, save].forEach(button => {
      el.appendChild(button);
    });
    return el;
  }
};

function speakingPlugin(node) {
  // eslint-disable-next-line no-console
  console.log('got node!',node);
}

function tableConverterPlugin(node, builder, {addSection, nodeFinished}) {
  if (node.tagName !== 'TABLE') { return; }

  const tableCard = builder.createCardSection('table');
  addSection(tableCard);
  nodeFinished();
}

document.addEventListener('DOMContentLoaded', () => {
  const el = document.querySelector('#editor');
  editor = new Editor({
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

  document.querySelectorAll('#toolbar button.toggle').forEach(button => {
    button.addEventListener('click', () => {
      let action = button.getAttribute('data-action');
      let toggle = button.getAttribute('data-toggle');

      editor[action](toggle);
    });
  });

  document.querySelectorAll('#toolbar button.toggle-method').forEach(button => {
    button.addEventListener('click', () => {
      let isOn = button.getAttribute('data-on') === 'true';
      let methodOn = button.getAttribute('data-on');
      let methodOff = button.getAttribute('data-off');

      let nextState = isOn ? 'false' : 'true';
      let method = isOn ? methodOff : methodOn;

      button.setAttribute('data-on', nextState);
      editor[method]();
    });
  });

  document.querySelectorAll('#toolbar button.insert-atom').forEach(atom => {
    atom.addEventListener('click', () => {
      let name = atom.getAttribute('data-name');
      let value = atom.getAttribute('data-value') || '';
      editor.insertAtom(name, value);
    });
  });

  document.querySelectorAll('#toolbar button.insert-card').forEach(card => {
    card.addEventListener('click', () => {
      let name = card.getAttribute('data-name');
      editor.insertCard(name);
    });
  });
});

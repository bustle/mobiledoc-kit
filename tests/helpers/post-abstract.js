/* jshint latedef:nofunc */
import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder';

/*
 * usage:
 *  Helpers.postAbstract.build(({post, section, marker, markup}) =>
 *    post([
 *      section('P', [
 *        marker('some text', [markup('B')])
 *      ])
 *    })
 *  )
 */
function build(treeFn) {
  let builder = new PostNodeBuilder();

  const simpleBuilder = {
    post          : (...args) => builder.createPost(...args),
    markupSection : (...args) => builder.createMarkupSection(...args),
    markup        : (...args) => builder.createMarkup(...args),
    marker        : (...args) => builder.createMarker(...args),
    listSection   : (...args) => builder.createListSection(...args),
    listItem      : (...args) => builder.createListItem(...args),
    cardSection   : (...args) => builder.createCardSection(...args),
    imageSection  : (...args) => builder.createImageSection(...args),
    atom          : (...args) => builder.createAtom(...args)
  };

  return treeFn(simpleBuilder);
}

let cardRegex = /\[(.*)\]/;
let markupRegex = /\*/g;
let listStartRegex = /^\* /;
let cursorRegex = /<|>|\|/g;

function parsePositionOffsets(text) {
  let offsets = {};

  if (cardRegex.test(text)) {
    [['|','solo'],['<','start'],['>','end']].forEach(([char, type]) => {
      if (text.indexOf(char) !== -1) {
        offsets[type] = text.indexOf(char) === 0 ? 0 : 1;
      }
    });
  } else {
    if (listStartRegex.test(text)) {
      text = text.replace(listStartRegex, '');
    }
    text = text.replace(markupRegex,'');
    if (text.indexOf('|') !== -1) {
      offsets.solo = text.indexOf('|');
    } else if (text.indexOf('<') !== -1 || text.indexOf('>') !== -1) {
      let hasStart = text.indexOf('<') !== -1;
      let hasEnd = text.indexOf('>') !== -1;
      if (hasStart) {
        offsets.start = text.indexOf('<');
        text = text.replace(/</g,'');
      }
      if (hasEnd) {
        offsets.end = text.indexOf('>');
      }
    }
  }

  return offsets;
}

const DEFAULT_ATOM_NAME = 'some-atom';
const DEFAULT_ATOM_VALUE = '@atom';

const MARKUP_CHARS = {
  '*': 'b',
  '_': 'em'
};

function parseTextIntoAtom(text, builder) {
  let markers = [];
  let atomIndex = text.indexOf('@');
  let afterAtomIndex = atomIndex + 1;
  let atomName = DEFAULT_ATOM_NAME,
      atomValue = DEFAULT_ATOM_VALUE,
      atomPayload = {};

  // If "@" is followed by "( ... json ... )", parse the json data
  if (text[atomIndex+1] === "(") {
    let jsonStartIndex = atomIndex+1;
    let jsonEndIndex = text.indexOf(")",jsonStartIndex);
    afterAtomIndex = jsonEndIndex + 1;
    if (jsonEndIndex === -1) {
      throw new Error('Atom JSON data had unmatched "(": ' + text);
    }
    let jsonString = text.slice(jsonStartIndex+1, jsonEndIndex);
    jsonString = "{" + jsonString + "}";
    try {
      let json = JSON.parse(jsonString);
      if (json.name) { atomName = json.name; }
      if (json.value) { atomValue = json.value; }
      if (json.payload) { atomPayload = json.payload; }
    } catch(e) {
      throw new Error('Failed to parse atom JSON data string: ' + jsonString + ', ' + e);
    }
  }

  // create the atom
  let atom = builder.atom(atomName, atomValue, atomPayload);

  // recursively parse the remaining text pieces
  let pieces = [text.slice(0, atomIndex), atom, text.slice(afterAtomIndex)];

  // join the markers together
  pieces.forEach((piece, index) => {
    if (index === 1) { // atom
      markers.push(piece);
    } else if (piece.length) {
      markers = markers.concat( parseTextIntoMarkers(piece, builder) );
    }
  });

  return markers;
}

function parseTextWithMarkup(text, builder) {
  let markers = [];
  let markup, char;
  Object.keys(MARKUP_CHARS).forEach(key => {
    if (markup) { return; }
    if (text.indexOf(key) !== -1) {
      markup = builder.markup(MARKUP_CHARS[key]);
      char = key;
    }
  });
  if (!markup) { throw new Error(`Failed to find markup in text: ${text}`); }

  let startIndex = text.indexOf(char);
  let endIndex = text.indexOf(char, startIndex+1);
  if (endIndex === -1) { throw new Error(`Malformed text: char ${char} do not match`); }

  let pieces = [text.slice(0, startIndex),
                text.slice(startIndex+1, endIndex),
                text.slice(endIndex+1)];
  pieces.forEach((piece, index) => {
    if (index === 1) { // marked-up text
      markers.push(builder.marker(piece, [markup]));
    } else {
      markers = markers.concat(parseTextIntoMarkers(piece, builder));
    }
  });

  return markers;
}

function parseTextIntoMarkers(text, builder) {
  text = text.replace(cursorRegex,'');
  let markers = [];

  let hasAtom = text.indexOf('@') !== -1;
  let hasMarkup = false;
  Object.keys(MARKUP_CHARS).forEach(key => {
    if (text.indexOf(key) !== -1) { hasMarkup = true; }
  });

  if (hasAtom) {
    markers = markers.concat(parseTextIntoAtom(text, builder));
  } else if (hasMarkup) {
    markers = markers.concat(parseTextWithMarkup(text, builder));
  } else if (text.length) {
    markers.push(builder.marker(text));
  }

  return markers;
}

function parseSingleText(text, builder) {
  let section, positions = {};

  let offsets = parsePositionOffsets(text);

  if (cardRegex.test(text)) {
    section = builder.cardSection(cardRegex.exec(text)[1]);
  } else {
    let type = 'p';
    if (listStartRegex.test(text)) {
      text = text.replace(listStartRegex,'');
      type = 'ul';
    }

    let markers = parseTextIntoMarkers(text, builder);

    switch (type) {
      case 'p':
        section = builder.markupSection('p', markers);
        break;
      case 'ul':
        section = builder.listItem(markers);
        break;
    }
  }

  ['start','end','solo'].forEach(type => {
    if (offsets[type] !== undefined) {
      positions[type] = section.toPosition(offsets[type]);
    }
  });

  return { section, positions };
}

/**
 * Shorthand to create a mobiledoc simply.
 * Pass a string or an array of strings.
 * 
 * Returns { post, range }, a post built from the mobiledoc and a range.
 *
 * Use "|" to indicate the cursor position or "<" and ">" to indicate a range.
 * Use "[card-name]" to indicate a card
 * Use asterisks to indicate bold text: "abc *bold* def"
 * Use "@" to indicate an atom, default values for name,value,payload are DEFAULT_ATOM_NAME,DEFAULT_ATOM_VALUE,{}
 * Use "@(name, value, payload)" to specify name,value and/or payload for an atom. The string from `(` to `)` is parsed as
 *   JSON, e.g.: '@("name": "my-atom", "value": "abc", "payload": {"foo": "bar"})' -> atom named "my-atom" with value 'abc', payload {foo: 'bar'}
 * Use "* " at the start of the string to indicate a list item ("ul")
 *
 * Examples:
 * buildFromText("abc") -> { post } with 1 markup section ("p") with text "abc"
 * buildFromText(["abc","def"]) -> { post } with 2 markups sections ("p") with texts "abc" and "def"
 * buildFromText("abc|def") -> { post, range } where range is collapsed at offset 3 (after the "c")
 * buildFromText(["abcdef","[some-card]","def"]) -> { post } with [MarkupSection, Card, MarkupSection] sections
 * buildFromText(["* item 1", "* item 2"]) -> { post } with a ListSection with 2 ListItems
 * buildFromText(["<abc", "def", "ghi>"]) -> { post, range } where range is the entire post (before the "a" to after the "i")
 */
function buildFromText(texts) {
  if (!Array.isArray(texts)) { texts = [texts]; }
  let positions = {};

  let post = build(builder => {
    let sections = [];
    let curList;
    texts.forEach((text, index) => {
      let { section, positions: _positions } = parseSingleText(text, builder);
      let lastText = index === texts.length - 1;

      if (curList) {
        if (section.isListItem) {
          curList.items.append(section);
        } else {
          sections.push(curList);
          sections.push(section);
          curList = null;
        }
      } else if (section.isListItem) {
        curList = builder.listSection('ul', [section]);
      } else {
        sections.push(section);
      }

      if (lastText && curList) {
        sections.push(curList);
      }

      if (_positions.start) { positions.start = _positions.start; }
      if (_positions.end) { positions.end = _positions.end; }
      if (_positions.solo) { positions.solo = _positions.solo; }
    });

    return builder.post(sections);
  });

  let range;
  if (positions.start) {
    if (!positions.end) { throw new Error(`startPos but no endPos ${texts.join('\n')}`); }
    range = positions.start.toRange(positions.end);
  } else if (positions.solo) {
    range = positions.solo.toRange();
  }

  return { post, range };
}


export default {
  build,
  buildFromText,
  DEFAULT_ATOM_NAME
};

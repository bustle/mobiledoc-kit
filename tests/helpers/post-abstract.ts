import PostNodeBuilder from 'mobiledoc-kit/models/post-node-builder'
import Post from 'mobiledoc-kit/models/post'
import { Dict, Maybe } from 'mobiledoc-kit/utils/types'
import Atom from 'mobiledoc-kit/models/atom'
import { keys } from 'mobiledoc-kit/utils/object-utils'
import Markup from 'mobiledoc-kit/models/markup'
import Markuperable from 'mobiledoc-kit/utils/markuperable'
import Section from 'mobiledoc-kit/models/_section'
import { unwrap } from 'mobiledoc-kit/utils/assert'
import Position from 'mobiledoc-kit/utils/cursor/position'
import Range from 'mobiledoc-kit/utils/cursor/range'
import ListSection from 'mobiledoc-kit/models/list-section'
import { isListItem } from 'mobiledoc-kit/models/list-item'
import { Cloneable } from 'mobiledoc-kit/models/_cloneable'

type ProxyMethod<T extends (...args: any) => any> = (...args: Parameters<T>) => ReturnType<T>

export interface SimplePostBuilder {
  post: ProxyMethod<PostNodeBuilder['createPost']>
  markupSection: ProxyMethod<PostNodeBuilder['createMarkupSection']>
  markup: ProxyMethod<PostNodeBuilder['createMarkup']>
  marker: ProxyMethod<PostNodeBuilder['createMarker']>
  listSection: ProxyMethod<PostNodeBuilder['createListSection']>
  listItem: ProxyMethod<PostNodeBuilder['createListItem']>
  cardSection: ProxyMethod<PostNodeBuilder['createCardSection']>
  imageSection: ProxyMethod<PostNodeBuilder['createImageSection']>
  atom: ProxyMethod<PostNodeBuilder['createAtom']>
}

export type BuildCallback = (builder: SimplePostBuilder) => Post
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
function build(treeFn: BuildCallback) {
  let builder = new PostNodeBuilder()

  const simpleBuilder: SimplePostBuilder = {
    post: (...args) => builder.createPost(...args),
    markupSection: (...args) => builder.createMarkupSection(...args),
    markup: (...args) => builder.createMarkup(...args),
    marker: (...args) => builder.createMarker(...args),
    listSection: (...args) => builder.createListSection(...args),
    listItem: (...args) => builder.createListItem(...args),
    cardSection: (...args) => builder.createCardSection(...args),
    imageSection: (...args) => builder.createImageSection(...args),
    atom: (...args) => builder.createAtom(...args),
  }

  return treeFn(simpleBuilder)
}

let cardRegex = /\[(.*)\]/
let imageSectionRegex = /^\{(.*)\}/
let markupRegex = /\*/g
let listStartRegex = /^\* /
let cursorRegex = /<|>|\|/g

function parsePositionOffsets(text: string) {
  let offsets: Dict<number> = {}

  if (cardRegex.test(text)) {
    ;[
      ['|', 'solo'],
      ['<', 'start'],
      ['>', 'end'],
    ].forEach(([char, type]) => {
      if (text.indexOf(char) !== -1) {
        offsets[type] = text.indexOf(char) === 0 ? 0 : 1
      }
    })
  } else {
    if (listStartRegex.test(text)) {
      text = text.replace(listStartRegex, '')
    }
    text = text.replace(markupRegex, '')
    if (text.indexOf('|') !== -1) {
      offsets.solo = text.indexOf('|')
    } else if (text.indexOf('<') !== -1 || text.indexOf('>') !== -1) {
      let hasStart = text.indexOf('<') !== -1
      let hasEnd = text.indexOf('>') !== -1
      if (hasStart) {
        offsets.start = text.indexOf('<')
        text = text.replace(/</g, '')
      }
      if (hasEnd) {
        offsets.end = text.indexOf('>')
      }
    }
  }

  return offsets
}

const DEFAULT_ATOM_NAME = 'some-atom'
const DEFAULT_ATOM_VALUE = '@atom'

const MARKUP_CHARS = <const>{
  '*': 'b',
  _: 'em',
}

function parseTextIntoAtom(text: string, builder: SimplePostBuilder) {
  let markers: Markuperable[] = []
  let atomIndex = text.indexOf('@')
  let afterAtomIndex = atomIndex + 1
  let atomName = DEFAULT_ATOM_NAME,
    atomValue = DEFAULT_ATOM_VALUE,
    atomPayload = {}

  // If "@" is followed by "( ... json ... )", parse the json data
  if (text[atomIndex + 1] === '(') {
    let jsonStartIndex = atomIndex + 1
    let jsonEndIndex = text.indexOf(')', jsonStartIndex)
    afterAtomIndex = jsonEndIndex + 1
    if (jsonEndIndex === -1) {
      throw new Error('Atom JSON data had unmatched "(": ' + text)
    }
    let jsonString = text.slice(jsonStartIndex + 1, jsonEndIndex)
    jsonString = '{' + jsonString + '}'
    try {
      let json = JSON.parse(jsonString)
      if (json.name) {
        atomName = json.name
      }
      if (json.value) {
        atomValue = json.value
      }
      if (json.payload) {
        atomPayload = json.payload
      }
    } catch (e) {
      throw new Error('Failed to parse atom JSON data string: ' + jsonString + ', ' + e)
    }
  }

  // create the atom
  let atom = builder.atom(atomName, atomValue, atomPayload)

  // recursively parse the remaining text pieces
  let pieces = [text.slice(0, atomIndex), atom, text.slice(afterAtomIndex)]

  // join the markers together
  pieces.forEach((piece, index) => {
    if (index === 1) {
      // atom
      markers.push(piece as Atom)
    } else if (piece.length) {
      markers = markers.concat(parseTextIntoMarkers(piece as string, builder))
    }
  })

  return markers
}

function parseTextWithMarkup(text: string, builder: SimplePostBuilder) {
  let markers: Markuperable[] = []
  let markup!: Markup
  let char!: string

  keys(MARKUP_CHARS).forEach(key => {
    if (markup) {
      return
    }
    if (text.indexOf(key) !== -1) {
      markup = builder.markup(MARKUP_CHARS[key])
      char = key
    }
  })

  if (!markup) {
    throw new Error(`Failed to find markup in text: ${text}`)
  }

  let startIndex = text.indexOf(char)
  let endIndex = text.indexOf(char, startIndex + 1)
  if (endIndex === -1) {
    throw new Error(`Malformed text: char ${char} do not match`)
  }

  let pieces = [text.slice(0, startIndex), text.slice(startIndex + 1, endIndex), text.slice(endIndex + 1)]
  pieces.forEach((piece, index) => {
    if (index === 1) {
      // marked-up text
      markers.push(builder.marker(piece, [markup]))
    } else {
      markers = markers.concat(parseTextIntoMarkers(piece, builder))
    }
  })

  return markers
}

function parseTextIntoMarkers(text: string, builder: SimplePostBuilder) {
  text = text.replace(cursorRegex, '')
  let markers: Markuperable[] = []

  let hasAtom = text.indexOf('@') !== -1
  let hasMarkup = false

  Object.keys(MARKUP_CHARS).forEach(key => {
    if (text.indexOf(key) !== -1) {
      hasMarkup = true
    }
  })

  if (hasAtom) {
    markers = markers.concat(parseTextIntoAtom(text, builder))
  } else if (hasMarkup) {
    markers = markers.concat(parseTextWithMarkup(text, builder))
  } else if (text.length) {
    markers.push(builder.marker(text))
  }

  return markers
}

function parseSingleText(text: string, builder: SimplePostBuilder) {
  let section!: Cloneable<Section>
  let positions: Positions = {}

  let offsets = parsePositionOffsets(text)

  if (cardRegex.test(text)) {
    section = builder.cardSection(unwrap(cardRegex.exec(text))[1])
  } else if (imageSectionRegex.test(text)) {
    section = builder.imageSection(unwrap(imageSectionRegex.exec(text))[1])
  } else {
    let type = 'p'
    if (listStartRegex.test(text)) {
      text = text.replace(listStartRegex, '')
      type = 'ul'
    }

    let markers = parseTextIntoMarkers(text, builder)

    switch (type) {
      case 'p':
        section = builder.markupSection('p', markers)
        break
      case 'ul':
        section = builder.listItem(markers)
        break
    }
  }

  ;(<const>['start', 'end', 'solo']).forEach(type => {
    if (offsets[type] !== undefined) {
      positions[type] = section.toPosition(offsets[type])
    }
  })

  return { section, positions }
}

interface Positions {
  start?: Position
  end?: Position
  solo?: Position
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
 * buildFromText(["abc", "{def}", "def"]) -> { post } with [MarkupSection, ImageSection, MarkupSection] sections
 * buildFromText(["* item 1", "* item 2"]) -> { post } with a ListSection with 2 ListItems
 * buildFromText(["<abc", "def", "ghi>"]) -> { post, range } where range is the entire post (before the "a" to after the "i")
 */
function buildFromText(_texts: string | string[]) {
  const texts = Array.isArray(_texts) ? _texts : [_texts]
  const positions: Positions = {}

  let post = build(builder => {
    let sections: Cloneable<Section>[] = []
    let curList: Maybe<ListSection>

    texts.forEach((text, index) => {
      let { section, positions: _positions } = parseSingleText(text, builder)
      let lastText = index === texts.length - 1

      if (curList) {
        if (isListItem(section)) {
          curList.items.append(section)
        } else {
          sections.push(curList)
          sections.push(section)
          curList = null
        }
      } else if (isListItem(section)) {
        curList = builder.listSection('ul', [section])
      } else {
        sections.push(section)
      }

      if (lastText && curList) {
        sections.push(curList)
      }

      if (_positions.start) {
        positions.start = _positions.start
      }
      if (_positions.end) {
        positions.end = _positions.end
      }
      if (_positions.solo) {
        positions.solo = _positions.solo
      }
    })

    return builder.post(sections)
  })

  let range!: Range

  if (positions.start) {
    if (!positions.end) {
      throw new Error(`startPos but no endPos ${texts.join('\n')}`)
    }
    range = positions.start.toRange(positions.end)
  } else if (positions.solo) {
    range = positions.solo.toRange()
  }

  return { post, range }
}

export default {
  build,
  buildFromText,
  DEFAULT_ATOM_NAME,
}

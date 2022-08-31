enum MarkerTypeIdentifier {
  TEXT = 0,
  ATOM = 1,
}

// [typeIdentifier, openMarkupsIndexes, numberOfClosedMarkups, text]
interface TextMarker extends Array<any> {
  0: MarkerTypeIdentifier.TEXT
  1: number[]
  2: number
  3: string
}

// [typeIdentifier, openMarkupsIndexes, numberOfClosedMarkups, atomIndex]
interface AtomMarker extends Array<any> {
  0: MarkerTypeIdentifier.ATOM
  1: number[]
  2: number
  3: number
}

type Marker = TextMarker | AtomMarker

enum MarkupTagName {
  a = 'a',
  b = 'b',
  code = 'code',
  em = 'em',
  i = 'i',
  s = 's',
  strong = 'strong',
  sub = 'sub',
  sup = 'sup',
  u = 'u',
}

// [tagName, optionalAttributesArray]
interface Markup extends Array<any> {
  0: MarkupTagName
  1?: string[]
}

// [type, payload]
interface Card extends Array<any> {
  0: string
  1: object
}

// [type, text, payload]}
interface Atom extends Array<any> {
  0: string
  1: string
  2: object
}

enum SectionTypeIdentifier {
  MARKUP = 1,
  IMAGE = 2,
  LIST = 3,
  CARD = 10,
}

enum MarkupSectionTagName {
  aside = 'aside',
  blockquote = 'blockquote',
  h1 = 'h1',
  h2 = 'h2',
  h3 = 'h3',
  h4 = 'h4',
  h5 = 'h5',
  h6 = 'h6',
  p = 'p',
  'pull-quote' = 'aside',
}

// [typeIdentifier, tagName, markers]
interface MarkupSection extends Array<any> {
  0: SectionTypeIdentifier.MARKUP
  1: MarkupSectionTagName
  2: Marker[]
  3?: Attributes
}

interface Attributes extends Array<any> {
  0: 'data-md-text-align'
  1: 'left' | 'right' | 'center'
}

// [typeIdentifier, imageSrc]
interface ImageSection extends Array<any> {
  0: SectionTypeIdentifier.IMAGE
  1: string
}

enum ListSectionTagName {
  ul = 'ul',
  ol = 'ol',
}

// [typeIdentifier, tagName, itemMarkers]
interface ListSection extends Array<any> {
  0: SectionTypeIdentifier.LIST
  1: ListSectionTagName
  2: Marker[]
}

// [typeIdentifier, index]
interface CardSection extends Array<any> {
  0: SectionTypeIdentifier.CARD
  1: number
}

type Section = MarkupSection | ImageSection | ListSection | CardSection

export interface Mobiledoc {
  version: string
  sections: Section[]
  markups: Markup[]
  cards: Card[]
  atoms: Atom[]
}

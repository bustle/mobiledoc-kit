var Keycodes = {
  ENTER : 13,
  ESC   : 27
};

var Regex = {
  NEWLINE       : /[\r\n]/g,
  HTTP_PROTOCOL : /^https?:\/\//i,
  HEADING_TAG   : /^(H1|H2|H3|H4|H5|H6)$/i,
  UL_START      : /^[-*]\s/,
  OL_START      : /^1\.\s/
};

var SelectionDirection = {
  LEFT_TO_RIGHT : 0,
  RIGHT_TO_LEFT : 1,
  SAME_NODE     : 2
};

var Tags = {
  PARAGRAPH    : 'P',
  HEADING      : 'H2',
  SUBHEADING   : 'H3',
  QUOTE        : 'BLOCKQUOTE',
  LIST         : 'UL',
  ORDERED_LIST : 'OL',
  LIST_ITEM    : 'LI',
  LINK         : 'A',
  BOLD         : 'B',
  ITALIC       : 'I'
};

var RootTags = [ Tags.PARAGRAPH, Tags.HEADING, Tags.SUBHEADING, Tags.QUOTE, Tags.LIST, Tags.ORDERED_LIST ];

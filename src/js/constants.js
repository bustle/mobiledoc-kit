var Keycodes = {
  ENTER : 13,
  ESC   : 27
};

var Regex = {
  NEWLINE       : /[\r\n]/g,
  HTTP_PROTOCOL : /^https?:\/\//i,
  HEADING_TAG   : /^(h1|h2|h3|h4|h5|h6)$/i,
  UL_START      : /^[-*]\s/,
  OL_START      : /^1\.\s/
};

var SelectionDirection = {
  LEFT_TO_RIGHT : 0,
  RIGHT_TO_LEFT : 1,
  SAME_NODE     : 2
};

var Tags = {
  LINK         : 'a',
  PARAGRAPH    : 'p',
  HEADING      : 'h2',
  SUBHEADING   : 'h3',
  QUOTE        : 'blockquote',
  LIST         : 'ul',
  ORDERED_LIST : 'ol',
  LIST_ITEM    : 'li'
};

var RootTags = [ Tags.PARAGRAPH, Tags.HEADING, Tags.SUBHEADING, Tags.QUOTE, Tags.LIST, Tags.ORDERED_LIST ];

import Type from '../content-kit-compiler/types/type';

var Keycodes = {
  BKSP  : 8,
  ENTER : 13,
  ESC   : 27,
  DEL   : 46
};

var RegEx = {
  NEWLINE       : /[\r\n]/g,
  HTTP_PROTOCOL : /^https?:\/\//i,
  HEADING_TAG   : /^(H1|H2|H3|H4|H5|H6)$/i,
  UL_START      : /^[-*]\s/,
  OL_START      : /^1\.\s/
};

var SelectionDirection = {
  LEFT_TO_RIGHT : 1,
  RIGHT_TO_LEFT : 2,
  SAME_NODE     : 3
};

var ToolbarDirection = {
  TOP   : 1,
  RIGHT : 2
};

var RootTags = [
  Type.TEXT.tag,
  Type.HEADING.tag,
  Type.SUBHEADING.tag,
  Type.QUOTE.tag,
  Type.LIST.tag,
  Type.ORDERED_LIST.tag
];

export { Keycodes, RegEx, SelectionDirection, ToolbarDirection, RootTags };

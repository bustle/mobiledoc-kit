import { parseHTML } from '../utils/dom-utils';
import assert from '../utils/assert';
import DOMParser from './dom';

export default class HTMLParser {
  constructor(builder) {
    assert('Must pass builder to HTMLParser', builder);
    this.builder = builder;
  }

  parse(html) {
    let dom = parseHTML(html);
    let parser = new DOMParser(this.builder);
    return parser.parse(dom);
  }
}

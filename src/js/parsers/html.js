import { parseHTML } from '../utils/dom-utils';
import assert from '../utils/assert';
import DOMParser from './dom';

export default class HTMLParser {
  constructor(builder, options={}) {
    assert('Must pass builder to HTMLParser', builder);
    this.builder = builder;
    this.options = options;
  }

  parse(html) {
    let dom = parseHTML(html);
    let parser = new DOMParser(this.builder, this.options);
    return parser.parse(dom);
  }
}

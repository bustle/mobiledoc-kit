import { parseHTML } from '../utils/dom-utils'
import assert from '../utils/assert'
import DOMParser from './dom'
import PostNodeBuilder from '../models/post-node-builder'
import Post from '../models/post'

export default class HTMLParser {
  builder: PostNodeBuilder
  options: {}

  constructor(builder: PostNodeBuilder, options = {}) {
    assert('Must pass builder to HTMLParser', builder)
    this.builder = builder
    this.options = options
  }

  /**
   * @param {String} html to parse
   * @return {Post} A post abstract
   */
  parse(html: string): Post {
    let dom = parseHTML(html)
    let parser = new DOMParser(this.builder, this.options)
    return parser.parse(dom)
  }
}

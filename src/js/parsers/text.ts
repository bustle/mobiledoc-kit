import assert from '../utils/assert'
import { MARKUP_SECTION_TYPE, LIST_SECTION_TYPE } from '../models/types'
import { DEFAULT_TAG_NAME as DEFAULT_MARKUP_SECTION_TAG_NAME } from '../models/markup-section'
import PostNodeBuilder from '../models/post-node-builder'
import Post from '../models/post'
import Section from '../models/_section'
import { Option } from '../utils/types'
import ListSection, { isListSection } from '../models/list-section'
import { Cloneable } from '../models/_cloneable'

const UL_LI_REGEX = /^\* (.*)$/
const OL_LI_REGEX = /^\d\.? (.*)$/
const CR = '\r'
const LF = '\n'
const CR_REGEX = new RegExp(CR, 'g')
const CR_LF_REGEX = new RegExp(CR + LF, 'g')

export const SECTION_BREAK = LF

function normalizeLineEndings(text) {
  return text.replace(CR_LF_REGEX, LF).replace(CR_REGEX, LF)
}

export interface TextParserOptions {}

export default class TextParser {
  builder: PostNodeBuilder
  options: TextParserOptions
  post: Post

  prevSection: Option<Cloneable<Section>>

  constructor(builder: PostNodeBuilder, options: TextParserOptions) {
    this.builder = builder
    this.options = options

    this.post = this.builder.createPost()
    this.prevSection = null
  }

  /**
   * @param {String} text to parse
   * @return {Post} a post abstract
   */
  parse(text: string): Post {
    text = normalizeLineEndings(text)
    text.split(SECTION_BREAK).forEach(text => {
      let section = this._parseSection(text)
      this._appendSection(section)
    })

    return this.post
  }

  _parseSection(text: string) {
    let tagName = DEFAULT_MARKUP_SECTION_TAG_NAME,
      type = MARKUP_SECTION_TYPE,
      section

    if (UL_LI_REGEX.test(text)) {
      tagName = 'ul'
      type = LIST_SECTION_TYPE
      text = text.match(UL_LI_REGEX)![1]
    } else if (OL_LI_REGEX.test(text)) {
      tagName = 'ol'
      type = LIST_SECTION_TYPE
      text = text.match(OL_LI_REGEX)![1]
    }

    let markers = [this.builder.createMarker(text)]

    switch (type) {
      case LIST_SECTION_TYPE: {
        let item = this.builder.createListItem(markers)
        let list = this.builder.createListSection(tagName, [item])
        section = list
        break
      }
      case MARKUP_SECTION_TYPE:
        section = this.builder.createMarkupSection(tagName, markers)
        break
      default:
        assert(`Unknown type encountered ${type}`, false)
    }

    return section
  }

  _appendSection(section: Cloneable<Section>) {
    let isSameListSection =
      isListSection(section) &&
      this.prevSection &&
      isListSection(this.prevSection) &&
      this.prevSection.tagName === section.tagName

    if (isSameListSection) {
      ;(section as ListSection).items.forEach(item => {
        ;(this.prevSection as ListSection).items.append(item.clone())
      })
    } else {
      this.post.sections.insertAfter(section, this.prevSection!)
      this.prevSection = section
    }
  }
}

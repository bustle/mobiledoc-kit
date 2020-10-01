import { Type } from './types'
import Section from './_section'
import { Option } from '../utils/types'

export default class Image extends Section {
  src: Option<string> = null

  constructor() {
    super(Type.IMAGE_SECTION)
  }

  clone() {
    return this.builder.createImageSection(this.src!)
  }

  canJoin() {
    return false
  }

  get length() {
    return 1
  }
}

import { Type } from './types'
import Section from './_section'

export default class Image extends Section {
  src: string | null = null

  constructor() {
    super(Type.IMAGE_SECTION)
    this.src = null
  }

  canJoin() {
    return false
  }

  get length() {
    return 1
  }
}

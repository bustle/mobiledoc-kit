import { Type } from '../types'
import ElementAtom from './element-atom'
import CustomAtom from './custom-atom'
import { PostNode } from '../post-node-builder'

export { default as AtomType } from './atom-type'
export default CustomAtom
export { AtomPayload } from './custom-atom'

export type SomeAtom = ElementAtom | CustomAtom

export function isAtom(postNode: PostNode): postNode is SomeAtom {
  return postNode.type === Type.ATOM
}

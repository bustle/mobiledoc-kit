import { forEach } from './array-utils'
import assert from './assert'

type Opcode = [string] | [string, unknown] | [string, unknown, unknown]
type Opcodes = Opcode[]

interface Visitor {
  [key: string]: (node: CompileNode, opcodes: Opcodes) => void
}

interface CompileNode {
  type: string
}

export function visit(visitor: Visitor, node: CompileNode, opcodes: Opcodes) {
  const method = node.type
  assert(`Cannot visit unknown type ${method}`, !!visitor[method])
  visitor[method](node, opcodes)
}

interface Compiler {
  [key: string]: (...args: unknown[]) => void
}

export function compile(compiler: Compiler, opcodes: Opcodes) {
  for (var i = 0, l = opcodes.length; i < l; i++) {
    let [method, ...params] = opcodes[i]
    let length = params.length
    if (length === 0) {
      compiler[method].call(compiler)
    } else if (length === 1) {
      compiler[method].call(compiler, params[0])
    } else if (length === 2) {
      compiler[method].call(compiler, params[0], params[1])
    } else {
      compiler[method].apply(compiler, params)
    }
  }
}

export function visitArray(visitor: Visitor, nodes: CompileNode[], opcodes: Opcodes) {
  if (!nodes || nodes.length === 0) {
    return
  }
  forEach(nodes, node => {
    visit(visitor, node, opcodes)
  })
}

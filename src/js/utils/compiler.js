import { forEach } from './array-utils';
import assert from './assert';

export function visit(visitor, node, opcodes) {
  const method = node.type;
  assert(`Cannot visit unknown type ${method}`, !!visitor[method]);
  visitor[method](node, opcodes);
}

export function compile(compiler, opcodes) {
  for (var i=0, l=opcodes.length; i<l; i++) {
    let [method, ...params] = opcodes[i];
    let length = params.length;
    if (length === 0) {
      compiler[method].call(compiler);
    } else if (length === 1) {
      compiler[method].call(compiler, params[0]);
    } else if (length === 2) {
      compiler[method].call(compiler, params[0], params[1]);
    } else {
      compiler[method].apply(compiler, params);
    }
  }
}

export function visitArray(visitor, nodes, opcodes) {
  if (!nodes || nodes.length === 0) {
    return;
  }
  forEach(nodes, node => {
    visit(visitor, node, opcodes);
  });
}

export function visit(visitor, node, opcodes) {
  const method = node.type;
  if (!visitor[method]) {
    throw new Error(`Cannot visit unknown type ${method}`);
  }
  visitor[method](node, opcodes);
}

export function compile(compiler, opcodes) {
  for (var i=0, l=opcodes.length; i<l; i++) {
    let [method, ...params] = opcodes[i];
    if (params.length) {
      compiler[method].apply(compiler, params);
    } else {
      compiler[method].call(compiler);
    }
  }
}

export function visitArray(visitor, nodes, opcodes) {
  if (!nodes || nodes.length === 0) {
    return;
  }
  nodes.forEach(node => {
    visit(visitor, node, opcodes);
  });
}

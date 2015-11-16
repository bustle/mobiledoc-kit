import { DIRECTION } from '../utils/key';

function clearSelection() {
  // FIXME-IE ensure this works on IE 9. It works on IE10.
  window.getSelection().removeAllRanges();
}

function comparePosition(selection) {
  let { anchorNode, focusNode, anchorOffset, focusOffset } = selection;
  let headNode, tailNode, headOffset, tailOffset, direction;

  const position = anchorNode.compareDocumentPosition(focusNode);

  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    headNode = anchorNode; tailNode = focusNode;
    headOffset = anchorOffset; tailOffset = focusOffset;
    direction = DIRECTION.FORWARD;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    headNode = focusNode; tailNode = anchorNode;
    headOffset = focusOffset; tailOffset = anchorOffset;
    direction = DIRECTION.BACKWARD;
  } else { // same node
    headNode = anchorNode;
    tailNode = focusNode;
    headOffset = Math.min(anchorOffset, focusOffset);
    tailOffset = Math.max(anchorOffset, focusOffset);
    direction = null;
  }

  return {headNode, headOffset, tailNode, tailOffset, direction};
}

export {
  clearSelection,
  comparePosition
};

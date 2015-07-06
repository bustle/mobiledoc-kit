export function moveCursorTo(element, offset) {
  let range = document.createRange();
  range.setStart(element, offset);
  range.setEnd(element, offset);

  let selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

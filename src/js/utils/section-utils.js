export function trimSectionText(section) {
  if (section.isMarkerable && section.markers.length) {
    let { head, tail } = section.markers;
    head.value = head.value.replace(/^\s+/, '');
    tail.value = tail.value.replace(/\s+$/, '');
  }
}

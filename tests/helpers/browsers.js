export function detectIE() {
  let userAgent = navigator.userAgent;
  return userAgent.indexOf("MSIE ") !== -1 || userAgent.indexOf("Trident/") !== -1 || userAgent.indexOf('Edge/') !== -1;
}

export function detectIE11() {
  return detectIE() && navigator.userAgent.indexOf("rv:11.0") !== -1;
}

export function supportsSelectionExtend() {
  let selection = window.getSelection();
  return !!selection.extend;
}

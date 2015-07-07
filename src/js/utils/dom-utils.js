export function detectParentNode(element, callback) {
  while (element) {
    const result = callback(element);
    if (result) {
      return {
        element,
        result
      };
    }
    element = element.parentNode;
  }

  return {
    element: null,
    result: null
  };
}

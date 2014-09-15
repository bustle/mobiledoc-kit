export default function(element, event, attr, handler) {
  element.addEventListener(event, function(e) {
    var node = e.target;
    while(node && node !== element) {
      if (node.getAttribute(attr)) {
        return handler.call(node, e);
      }
      node = node.parentNode;
    }
  });
}

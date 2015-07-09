/**
 * runtime DOM renderer
 * renders a mobiledoc to DOM
 *
 * input: mobiledoc
 * output: DOM
 */

const utils = {
  createElement(tagName) {
    return document.createElement(tagName);
  },
  appendChild(target, child) {
    target.appendChild(child);
  },
  createTextNode(text) {
    return document.createTextNode(text);
  }
};

function createElementFromMarkerType([tagName, attributes]){
  let element = utils.createElement(tagName);
  attributes = attributes || [];

  for (let i=0,l=attributes.length; i<l; i=i+2) {
    let [propName, propValue] = attributes[i];
    element.setAttribute(propName, propValue);
  }
  return element;
}

export default class DOMRenderer {
  constructor() {
    // FIXME Perhaps the render() should specify its target instead of
    // creating one here.
    this.root = utils.createElement('div');
  }

  /**
   * @return DOMNode
   */
  render(mobiledoc) {
    const [markerTypes, sections] = mobiledoc;
    this.markerTypes = markerTypes;

    sections.forEach((section) => this.renderSection(section));

    return this.root;
  }

  renderSection(section) {
    const [type] = section;
    switch (type) {
      case 1:
        let rendered = this.renderParagraphSection(section);
        utils.appendChild(this.root, rendered);
        break;
      default:
        throw new Error('Unimplement renderer for type ' + type);
    }
  }

  renderParagraphSection([type, tagName, markers]) {
    let element = utils.createElement(tagName);
    let elements = [element];
    let currentElement = element;

    for (let i=0, l=markers.length; i<l; i++) {
      let marker = markers[i];
      let [openTypes, closeTypes, text] = marker;

      for (let j=0, m=openTypes.length; j<m; j++) {
        let markerType = this.markerTypes[openTypes[j]];
        let openedElement = createElementFromMarkerType(markerType);
        utils.appendChild(currentElement, openedElement);
        elements.push(openedElement);
        currentElement = openedElement;
      }

      utils.appendChild(currentElement, utils.createTextNode(text));

      for (let j=0, m=closeTypes; j<m; j++) {
        elements.pop();
        currentElement = elements[elements.length - 1];
      }
    }

    return element;
  }
}

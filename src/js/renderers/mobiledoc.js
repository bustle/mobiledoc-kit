import {visit, visitArray, compile} from "../utils/compiler";

let visitor = {
  post(node, opcodes) {
    opcodes.push(['openPost']);
    visitArray(visitor, node.sections, opcodes);
  },
  section(node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    visitArray(visitor, node.markers, opcodes);
  },
  markupSection(node, opcodes) {
    opcodes.push(['openMarkupSection', node.tagName]);
    visitArray(visitor, node.markers, opcodes);
  },
  imageSection(node, opcodes) {
    opcodes.push(['openImageSection', node.src]);
  },
  card(node, opcodes) {
    opcodes.push(['openCardSection', node.name, node.payload]);
  },
  marker(node, opcodes) {
    opcodes.push(['openMarker', node.close, node.value]);
    visitArray(visitor, node.open, opcodes);
  },
  markerType(node, opcodes) {
    opcodes.push(['openMarkerType', node.tagName, node.attributes]);
  }
};

let postOpcodeCompiler = {
  openMarker(closeCount, value) {
    this.markupMarkerIds = [];
    this.markers.push([
      this.markupMarkerIds,
      closeCount,
      value || ''
    ]);
  },
  openMarkupSection(tagName) {
    this.markers = [];
    this.sections.push([1, tagName, this.markers]);
  },
  openImageSection(url) {
    this.sections.push([2, url]);
  },
  openCardSection(name, payload) {
    this.sections.push([10, name, payload]);
  },
  openPost() {
    this.markerTypes = [];
    this.sections = [];
    this.result = [this.markerTypes, this.sections];
  },
  openMarkerType(tagName, attributes) {
    if (!this._seenMarkerTypes) {
      this._seenMarkerTypes = {};
    }
    let index;
    if (attributes) {
      this.markerTypes.push([tagName, attributes]);
      index = this.markerTypes.length - 1;
    } else {
      index = this._seenMarkerTypes[tagName];
      if (index === undefined) {
        this.markerTypes.push([tagName]);
        this._seenMarkerTypes[tagName] = index = this.markerTypes.length-1;
      }
    }
    this.markupMarkerIds.push(index);
  }
};

export default {
  render(post) {
    let opcodes = [];
    visit(visitor, post, opcodes);
    let compiler = Object.create(postOpcodeCompiler);
    compile(compiler, opcodes);
    return compiler.result;
  }
};

import { generateBuilder } from '../utils/post-builder';

/*
 * input mobiledoc: [ markers, elements ]
 * output: Post
 *
 */
export default class MobiledocParser {
  constructor() {
    this.builder = generateBuilder();
  }

  parse(mobiledoc) {
    const markerTypes = mobiledoc[0];
    const sections    = mobiledoc[1];

    const post = this.builder.generatePost();

    this.markerTypes = this.parseMarkerTypes(markerTypes);
    this.parseSections(sections, post);

    return post;
  }

  parseMarkerTypes(markerTypes) {
    return markerTypes.map((markerType) => this.parseMarkerType(markerType));
  }

  parseMarkerType([tagName, attributes]) {
    return this.builder.generateMarkerType(tagName, attributes);
  }

  parseSections(sections, post) {
    sections.forEach((section) => this.parseSection(section, post));
  }

  parseSection(section, post) {
    let [type] = section;
    switch(type) {
      case 1: // markup section
        this.parseMarkupSection(section, post);
        break;
      default:
        throw new Error(`Unexpected section type ${type}`);
    }
  }

  parseMarkupSection([type, tagName, markers], post) {
    const attributes = null;
    const isGenerated = false;
    const section = this.builder.generateSection(tagName, attributes, isGenerated);

    post.appendSection(section);
    this.parseMarkers(markers, section);
  }

  parseMarkers(markers, section) {
    markers.forEach((marker) => this.parseMarker(marker, section));
  }

  parseMarker([markerTypeIndexes, closeCount, value], section) {
    const markerTypes = markerTypeIndexes.map(index => this.markerTypes[index]);
    const marker = this.builder.generateMarker(markerTypes, closeCount, value);
    section.markers.push(marker);
  }
}

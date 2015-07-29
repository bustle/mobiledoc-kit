import { generateBuilder } from '../utils/post-builder';
const CARD_SECTION_TYPE = 10;
const IMAGE_SECTION_TYPE = 2;

/*
 * input mobiledoc: [ markers, elements ]
 * output: Post
 *
 */
export default class MobiledocParser {
  constructor() {
    this.builder = generateBuilder();
  }

  parse({version, sections: sectionData}) {
    const markerTypes = sectionData[0];
    const sections    = sectionData[1];

    const post = this.builder.generatePost();

    this.markups = [];
    this.markerTypes = this.parseMarkerTypes(markerTypes);
    this.parseSections(sections, post);

    return post;
  }

  parseMarkerTypes(markerTypes) {
    return markerTypes.map((markerType) => this.parseMarkerType(markerType));
  }

  parseMarkerType([tagName, attributes]) {
    return this.builder.generateMarkup(tagName, attributes);
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
      case IMAGE_SECTION_TYPE:
        this.parseImageSection(section, post);
        break;
      case CARD_SECTION_TYPE:
        this.parseCardSection(section, post);
        break;
      default:
        throw new Error(`Unexpected section type ${type}`);
    }
  }

  parseCardSection([type, name, payload], post) {
    const section = this.builder.generateCardSection(name, payload);
    post.appendSection(section);
  }

  parseImageSection([type, src], post) {
    const section = this.builder.generateImageSection(src);
    post.appendSection(section);
  }

  parseMarkupSection([type, tagName, markers], post) {
    const attributes = null;
    const isGenerated = false;
    const section = this.builder.generateMarkupSection(tagName, attributes, isGenerated);

    post.appendSection(section);
    this.parseMarkers(markers, section);
  }

  parseMarkers(markers, section) {
    markers.forEach((marker) => this.parseMarker(marker, section));
  }

  parseMarker([markerTypeIndexes, closeCount, value], section) {
    markerTypeIndexes.forEach(index => {
      this.markups.push(this.markerTypes[index]);
    });
    const marker = this.builder.generateMarker(this.markups.slice(), value);
    section.appendMarker(marker);
    this.markups = this.markups.slice(0, this.markups.length-closeCount);
  }
}

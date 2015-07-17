export const DEFAULT_TYPE = 'p';
export const SECTION_TYPES = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'
];

const Section = class Section {
  constructor(type=DEFAULT_TYPE, markers=[]) {
    this.markers = [];
    this.type = type;
    markers.forEach(m => this.appendMarker(m));
  }

  appendMarker(marker) {
    this.markers.push(marker);
  }

  /**
   * @return {Array} 2 new sections
   */
  split(offset) {
    let left = [], right = [], middle;

    middle = this.markerContaining(offset);
    const middleIndex = this.markers.indexOf(middle);

    for (let i=0; i<this.markers.length; i++) {
      if (i < middleIndex) { left.push(this.markers[i]); }
      if (i > middleIndex) { right.push(this.markers[i]); }
    }

    let leftLength = left.reduce((prev, cur) => prev + cur.length, 0);
    let middleOffset = offset - leftLength;

    let [leftMiddle, rightMiddle] = middle.split(middleOffset);
    left.push(leftMiddle);
    right.push(rightMiddle);

    return [
      new Section(this.type, left),
      new Section(this.type, right)
    ];
  }

  /**
   * A marker contains this offset if:
   *   * The offset is between the marker's start and end
   *   * it is the first marker and the offset is 0
   *   * it is the last marker and the offset is >= total length of all the markers
   *   * the offset is between two markers and it is the left marker (right-inclusive)
   *
   * @return {Marker} The marker that contains this offset
   */
  markerContaining(offset) {
    var length=0, i=0;

    if (offset === 0) { return this.markers[0]; }

    while (length < offset && i < this.markers.length) {
      length += this.markers[i].length;
      i++;
    }
    return this.markers[i-1];
  }
};

export default Section;

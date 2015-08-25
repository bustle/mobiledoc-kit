import Section from './markup-section';

export const LIST_ITEM_TYPE = 'list-item';

export default class ListItem extends Section {
  constructor(tagName, markers=[]) {
    super(tagName, markers);
    this.type = LIST_ITEM_TYPE;
  }

  splitAtMarker(marker, offset=0) {
    // FIXME need to check if we are going to split into two list items
    // or a list item and a new markup section:
    const isLastItem = !this.next;
    const createNewSection =
      (marker.isEmpty && offset === 0) && isLastItem;

    let [beforeSection, afterSection] = [
      this.builder.createListItem(),
      createNewSection ? this.builder.createMarkupSection('p') : this.builder.createListItem()
    ];

    return this._redistributeMarkers(beforeSection, afterSection, marker, offset);
  }

  splitIntoSections() {
    return this.parent.splitAtListItem(this);
  }

  clone() {
    const item = this.builder.createListItem();
    this.markers.forEach(m => item.markers.append(m.clone()));
    return item;
  }
}


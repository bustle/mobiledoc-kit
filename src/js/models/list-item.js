import Markerable from './_markerable';
import { LIST_ITEM_TYPE } from './types';
import {
  normalizeTagName
} from 'content-kit-editor/utils/dom-utils';

export const VALID_LIST_ITEM_TAGNAMES = [
  'li'
].map(normalizeTagName);

export default class ListItem extends Markerable {
  constructor(tagName, markers=[]) {
    super(LIST_ITEM_TYPE, tagName, markers);
  }

  splitAtMarker(marker, offset=0) {
    // FIXME need to check if we are going to split into two list items
    // or a list item and a new markup section:
    const isLastItem = !this.next;
    const createNewSection = (!marker && offset === 0 && isLastItem);

    let [beforeSection, afterSection] = [
      this.builder.createListItem(),
      createNewSection ? this.builder.createMarkupSection() :
                         this.builder.createListItem()
    ];

    return this._redistributeMarkers(
      beforeSection, afterSection, marker, offset);
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

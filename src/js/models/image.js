import { IMAGE_SECTION_TYPE } from './types';
import Section from './_section';

export default class Image extends Section {
  constructor() {
    super(IMAGE_SECTION_TYPE);
    this.src = null;
  }

  canJoin() {
    return false;
  }

  get isBlank() {
    return false;
  }

  get length() {
    return 1;
  }
}

import { IMAGE_SECTION_TYPE } from './types';
import Section from './_section';

export default class Image extends Section {
  constructor() {
    super(IMAGE_SECTION_TYPE);
    this.src = null;
  }
}

import { IMAGE_SECTION_TYPE } from './types';
import Section from './_section';
import Position from '../utils/cursor/position';

export default class Image extends Section {
  constructor() {
    super(IMAGE_SECTION_TYPE);
    this.src = null;
  }

  canJoin() {
    return false;
  }

  headPosition() {
    return new Position(this, 0);
  }

  tailPosition() {
    return new Position(this, 1);
  }
}

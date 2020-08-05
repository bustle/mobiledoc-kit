import LinkedList from '../utils/linked-list'
import Section from './_section'

export default interface HasChildSections<T extends Section = Section> {
  sections: LinkedList<T>
}

export function hasChildSections(section: {}): section is HasChildSections {
  return 'sections' in section
}

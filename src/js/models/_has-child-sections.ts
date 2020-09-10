import LinkedList from '../utils/linked-list'
import Section from './_section'

type HasChildSections<T extends Section = Section> = T & {
  sections: LinkedList<T>
}

export default HasChildSections

export function hasChildSections(section: {}): section is HasChildSections {
  return 'sections' in section
}

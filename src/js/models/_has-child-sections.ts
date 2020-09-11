import LinkedList from '../utils/linked-list'
import Section from './_section'

type HasChildSections<T extends Section = Section> = {
  sections: LinkedList<T>
}

// eslint-disable-next-line no-undef
export default HasChildSections

export function hasChildSections(section: {}): section is HasChildSections {
  return 'sections' in section
}

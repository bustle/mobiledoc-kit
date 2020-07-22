import ListSection from "./list-section"

export function isListSection(item: any): item is ListSection {
  return 'items' in item && item.items
}

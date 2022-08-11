import Position from '../utils/cursor/position'
import Range from '../utils/cursor/range'
import { detect, forEach, reduce, filter, values, commonItems } from '../utils/array-utils'
import { Direction } from '../utils/key'
import LifecycleCallbacks, { LifecycleCallback } from '../models/lifecycle-callbacks'
import assert, { assertType } from '../utils/assert'
import { normalizeTagName } from '../utils/dom-utils'
import PostInserter from './post/post-inserter'
import deprecate from '../utils/deprecate'
import toRange from '../utils/to-range'
import { Option, Maybe } from '../utils/types'
import Editor, { TextUnit } from './editor'
import PostNodeBuilder, { PostNode } from '../models/post-node-builder'
import Markerable, { isMarkerable } from '../models/_markerable'
import Section from '../models/_section'
import Markuperable from '../utils/markuperable'
import Post from '../models/post'
import ListSection, { isListSection } from '../models/list-section'
import ListItem, { isListItem } from '../models/list-item'
import Card, { isCardSection } from '../models/card'
import LinkedList from '../utils/linked-list'
import { Cloneable } from '../models/_cloneable'
import HasChildSections, { hasChildSections } from '../models/_has-child-sections'
import { Attributable } from '../models/_attributable'
import Markup from '../models/markup'
import { isMarkupSection } from '../models/markup-section'
import { TagNameable } from '../models/_tag-nameable'

const { FORWARD, BACKWARD } = Direction

function isListSectionTagName(tagName: string) {
  return tagName === 'ul' || tagName === 'ol'
}

function shrinkRange(range: Range) {
  const { head, tail } = range

  if (tail.offset === 0 && head.section !== tail.section) {
    range.tail = new Position(tail.section!.prev, tail.section!.prev!.length)
  }

  return range
}

const CALLBACK_QUEUES = {
  BEFORE_COMPLETE: 'beforeComplete',
  COMPLETE: 'complete',
  AFTER_COMPLETE: 'afterComplete',
}

// There are only two events that we're concerned about for Undo, that is inserting text and deleting content.
// These are the only two states that go on a "run" and create a combined undo, everything else has it's own
// deadicated undo.
export const enum EditAction {
  INSERT_TEXT = 1,
  DELETE = 2,
}

interface SectionTransformation {
  from: Section
  to: Section
}

/**
 * The PostEditor is used to modify a post. It should not be instantiated directly.
 * Instead, a new instance of a PostEditor is created by the editor and passed
 * as the argument to the callback in {@link Editor#run}.
 *
 * Usage:
 * ```
 * editor.run((postEditor) => {
 *   // postEditor is an instance of PostEditor that can operate on the
 *   // editor's post
 * });
 * ```
 */
export default class PostEditor {
  /**
   * @private
   */
  editor: Editor
  builder: PostNodeBuilder

  editActionTaken: Option<EditAction>

  _callbacks: LifecycleCallbacks
  _range!: Range
  _didComplete: boolean
  _renderRange: () => void
  _postDidChange: () => void
  _rerender: () => void
  _shouldCancelSnapshot!: boolean

  constructor(editor: Editor) {
    this.editor = editor
    this.builder = this.editor.builder
    this._callbacks = new LifecycleCallbacks(values(CALLBACK_QUEUES))

    this._didComplete = false
    this.editActionTaken = null

    this._renderRange = () => this.editor.selectRange(this._range)
    this._postDidChange = () => this.editor._postDidChange()
    this._rerender = () => this.editor.rerender()
  }

  addCallback(queueName: string, callback: LifecycleCallback) {
    this._callbacks.addCallback(queueName, callback)
  }

  addCallbackOnce(queueName: string, callback: LifecycleCallback) {
    this._callbacks.addCallbackOnce(queueName, callback)
  }

  runCallbacks(queueName: string) {
    this._callbacks.runCallbacks(queueName)
  }

  begin() {
    // cache the editor's range
    this._range = this.editor.range
  }

  /**
   * Schedules to select the given range on the editor after the postEditor
   * has completed its work. This also updates the postEditor's active range
   * (so that multiple calls to range-changing methods on the postEditor will
   * update the correct range).
   *
   * Usage:
   *   let range = editor.range;
   *   editor.run(postEditor => {
   *     let nextPosition = postEditor.deleteRange(range);
   *
   *     // Will position the editor's cursor at `nextPosition` after
   *     // the postEditor finishes work and the editor rerenders.
   *     postEditor.setRange(nextPosition);
   *   });
   * @param {Range|Position} range
   * @public
   */
  setRange(range: Range | Position) {
    range = toRange(range)

    // TODO validate that the range is valid
    // (does not contain marked-for-removal head or tail sections?)
    this._range = range
    this.scheduleAfterRender(this._renderRange, true)
  }

  /**
   * Delete a range from the post
   *
   * Usage:
   * ```
   *     let { range } = editor;
   *     editor.run((postEditor) => {
   *       let nextPosition = postEditor.deleteRange(range);
   *       postEditor.setRange(nextPosition);
   *     });
   * ```
   * @param {Range} range Cursor Range object with head and tail Positions
   * @return {Position} The position where the cursor would go after deletion
   * @public
   */
  deleteRange(range: Range): Position {
    assert('Must pass MobiledocKit Range to `deleteRange`', range instanceof Range)

    this.editActionTaken = EditAction.DELETE

    const { head, tail } = range
    let headSection = head.section!
    let tailSection = tail.section!

    const { editor } = this
    const { post } = editor

    if (headSection === tailSection) {
      return this.cutSection(headSection, head, tail)
    }

    let nextSection = headSection!.nextLeafSection()

    let nextPos = this.cutSection(headSection, head, headSection!.tailPosition())
    // cutSection can replace the section, so re-read headSection here
    headSection = nextPos.section!

    // Remove sections in the middle of the range
    while (nextSection !== tailSection) {
      let tmp = nextSection!
      nextSection = nextSection!.nextLeafSection()
      this.removeSection(tmp)
    }

    let tailPos = this.cutSection(tailSection, tailSection!.headPosition(), tail)
    // cutSection can replace the section, so re-read tailSection here
    tailSection = tailPos.section!

    if (tailSection.isBlank) {
      this.removeSection(tailSection)
    } else {
      // If head and tail sections are markerable, join them
      // Note: They may not be the same section type. E.g. this may join
      // a tail section that was a list item onto a markup section, or vice versa.
      // (This is the desired behavior.)
      if (isMarkerable(headSection) && isMarkerable(tailSection)) {
        headSection.join(tailSection)
        this._markDirty(headSection)
        this.removeSection(tailSection)
      } else if (headSection.isBlank) {
        this.removeSection(headSection)
        nextPos = tailPos
      }
    }

    if (post.isBlank) {
      post.sections.append(this.builder.createMarkupSection('p'))
      nextPos = post.headPosition()
    }

    return nextPos
  }

  /**
   * Note: This method may replace `section` with a different section.
   *
   * "Cut" out the part of the section inside `headOffset` and `tailOffset`.
   * If section is markerable this splits markers that straddle the head or tail (if necessary),
   * and removes markers that are wholly inside the offsets.
   * If section is a card, this may replace it with a blank markup section if the
   * positions contain the entire card.
   *
   * @param {Section} section
   * @param {Position} head
   * @param {Position} tail
   * @return {Position}
   * @private
   */
  cutSection(section: Section, head: Position, tail: Position): Position {
    assert(
      'Must pass head position and tail position to `cutSection`',
      head instanceof Position && tail instanceof Position
    )
    assert('Must pass positions within same section to `cutSection`', head.section === tail.section)

    if (section.isBlank || head.isEqual(tail)) {
      return head
    }
    if (section.isCardSection) {
      if (head.isHead() && tail.isTail()) {
        let newSection = this.builder.createMarkupSection()
        this.replaceSection(section, newSection)
        return newSection.headPosition()
      } else {
        return tail
      }
    }

    let range = head.toRange(tail)
    this.splitMarkers(range).forEach(m => this.removeMarker(m))

    return head
  }

  _coalesceMarkers(section: Section) {
    if (isMarkerable(section)) {
      this._removeBlankMarkers(section)
      this._joinSimilarMarkers(section)
    }
  }

  _removeBlankMarkers(section: Markerable) {
    forEach(
      filter(section.markers, m => m.isBlank),
      m => this.removeMarker(m)
    )
  }

  // joins markers that have identical markups
  _joinSimilarMarkers(section: Markerable) {
    let marker = section.markers.head
    let nextMarker: Markuperable
    while (marker && marker.next) {
      nextMarker = marker.next

      if (marker.canJoin(nextMarker)) {
        nextMarker.value = marker.value + nextMarker.value
        this._markDirty(nextMarker)
        this.removeMarker(marker)
      }

      marker = nextMarker
    }
  }

  removeMarker(marker: Markuperable) {
    this._scheduleForRemoval(marker)
    if (marker.section) {
      this._markDirty(marker.section)
      marker.section.markers.remove(marker)
    }
  }

  _scheduleForRemoval(postNode: Exclude<PostNode, Post>) {
    if (postNode.renderNode) {
      postNode.renderNode.scheduleForRemoval()

      this.scheduleRerender()
      this.scheduleDidUpdate()
    }
    let removedAdjacentToList =
      (postNode.prev && isListSection(postNode.prev as Section)) ||
      (postNode.next && isListSection(postNode.next as Section))
    if (removedAdjacentToList) {
      this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, () => this._joinContiguousListSections())
    }
  }

  _joinContiguousListSections() {
    let { post } = this.editor
    let range = this._range
    let prev: Section
    let groups: ListSection[][] = []
    let currentGroup!: Option<ListSection[]>

    // FIXME do we need to force a re-render of the range if changed sections
    // are contained within the range?
    let updatedHead: Option<Position> = null
    forEach(post.sections, section => {
      if (prev && isListSection(prev) && isListSection(section) && prev.tagName === section.tagName) {
        currentGroup = currentGroup || [prev]
        currentGroup.push(section)
      } else {
        if (currentGroup) {
          groups.push(currentGroup)
        }
        currentGroup = null
      }
      prev = section
    })

    if (currentGroup) {
      groups.push(currentGroup)
    }

    forEach(groups, group => {
      let list = group[0]
      forEach(group, listSection => {
        if (listSection === list) {
          return
        }

        let currentHead = range.head
        let prevPosition: Maybe<Position>

        // FIXME is there a currentHead if there is no range?
        // is the current head a list item in the section
        if (!range.isBlank && isListItem(currentHead.section!) && currentHead.section.parent === listSection) {
          prevPosition = list.tailPosition()
        }
        this._joinListSections(list, listSection)
        if (prevPosition) {
          updatedHead = prevPosition.move(FORWARD)
        }
      })
    })

    if (updatedHead) {
      this.setRange(updatedHead)
    }
  }

  _joinListSections(baseList: ListSection, nextList: ListSection) {
    baseList.join(nextList)
    this._markDirty(baseList)
    this.removeSection(nextList)
  }

  _markDirty(postNode: PostNode) {
    if (postNode.renderNode) {
      postNode.renderNode.markDirty()

      this.scheduleRerender()
      this.scheduleDidUpdate()
    }
    if ('section' in postNode && postNode.section) {
      this._markDirty(postNode.section)
    }
    if (isMarkerable(postNode as Section)) {
      this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, () => this._coalesceMarkers(postNode as Markerable))
    }
  }

  /**
   * @param {Position} position object with {section, offset} the marker and offset to delete from
   * @param {Number} direction The direction to delete in (default is BACKWARD)
   * @return {Position} for positioning the cursor
   * @public
   * @deprecated after v0.10.3
   */
  deleteFrom(position: Position, direction: Direction = Direction.BACKWARD): Position {
    deprecate(
      "`postEditor#deleteFrom is deprecated. Use `deleteAtPosition(position, direction=BACKWARD, {unit}={unit: 'char'})` instead"
    )
    return this.deleteAtPosition(position, direction, { unit: TextUnit.CHAR })
  }

  /**
   * Delete 1 `unit` (can be 'char' or 'word') in the given `direction` at the given
   * `position`. In almost all cases this will be equivalent to deleting the range formed
   * by expanding the position 1 unit in the given direction. The exception is when deleting
   * backward from the beginning of a list item, which reverts the list item into a markup section
   * instead of joining it with its previous list item (if any).
   *
   * Usage:
   *
   *     let position = section.tailPosition();
   *     // Section has text of "Howdy!"
   *     editor.run((postEditor) => {
   *       postEditor.deleteAtPosition(position);
   *     });
   *     // section has text of "Howdy"
   *
   * @param {Position} position The position to delete at
   * @param {Direction} [direction=DIRECTION.BACKWARD] direction The direction to delete in
   * @param {Object} [options]
   * @param {String} [options.unit="char"] The unit of deletion ("word" or "char")
   * @return {Position}
   */
  deleteAtPosition(
    position: Position,
    direction: Direction = Direction.BACKWARD,
    { unit }: { unit: TextUnit } = { unit: TextUnit.CHAR }
  ): Position {
    if (direction === Direction.BACKWARD) {
      return this._deleteAtPositionBackward(position, unit)
    } else {
      return this._deleteAtPositionForward(position, unit)
    }
  }

  _deleteAtPositionBackward(position: Position, unit: TextUnit) {
    if (position.isHead() && isListItem(position.section!)) {
      this.toggleSection('p', position)
      return this._range.head
    } else {
      let prevPosition = unit === 'word' ? position.moveWord(BACKWARD) : position.move(BACKWARD)
      let range = prevPosition.toRange(position)
      return this.deleteRange(range)
    }
  }

  _deleteAtPositionForward(position: Position, unit: TextUnit) {
    let nextPosition = unit === 'word' ? position.moveWord(FORWARD) : position.move(FORWARD)
    let range = position.toRange(nextPosition)
    return this.deleteRange(range)
  }

  /**
   * Split markers at two positions, once at the head, and if necessary once
   * at the tail.
   *
   * Usage:
   * ```
   *     let range = editor.range;
   *     editor.run((postEditor) => {
   *       postEditor.splitMarkers(range);
   *     });
   * ```
   * The return value will be marker object completely inside the offsets
   * provided. Markers outside of the split may also have been modified.
   *
   * @param {Range} markerRange
   * @return {Array} of markers that are inside the split
   * @private
   */
  splitMarkers(range: Range): Markuperable[] {
    const { post } = this.editor
    const { head, tail } = range

    this.splitSectionMarkerAtOffset(head.section!, head.offset)
    this.splitSectionMarkerAtOffset(tail.section!, tail.offset)

    return post.markersContainedByRange(range)
  }

  splitSectionMarkerAtOffset(section: Section, offset: number) {
    const edit = section.splitMarkerAtOffset(offset)
    edit.removed.forEach(m => this.removeMarker(m))
  }

  /**
   * Split the section at the position.
   *
   * Usage:
   * ```
   *     let position = editor.cursor.offsets.head;
   *     editor.run((postEditor) => {
   *       postEditor.splitSection(position);
   *     });
   *     // Will result in the creation of two new sections
   *     // replacing the old one at the cursor position
   * ```
   * The return value will be the two new sections. One or both of these
   * sections can be blank (contain only a blank marker), for example if the
   * headMarkerOffset is 0.
   *
   * @param {Position} position
   * @return {Array} new sections, one for the first half and one for the second (either one can be null)
   * @public
   */
  splitSection(position: Position): [Option<Section>, Option<Section>] {
    const section = position.section!

    if (isCardSection(section)) {
      return this._splitCardSection(section, position)
    } else if (isListItem(section)) {
      let isLastAndBlank = section.isBlank && !section.next
      if (isLastAndBlank) {
        // if is last, replace the item with a blank markup section
        let parent = section.parent
        let collection = this.editor.post.sections
        let blank = this.builder.createMarkupSection()
        this.removeSection(section)
        this.insertSectionBefore(collection, blank, parent.next)

        return [null, blank]
      } else {
        let [pre, post] = this._splitListItem(section, position)
        return [pre, post]
      }
    } else {
      let splitSections = (section as Markerable).splitAtPosition(position)
      splitSections.forEach(s => this._coalesceMarkers(s))
      this._replaceSection(section, splitSections)

      return splitSections
    }
  }

  /**
   * @param {Section} cardSection
   * @param {Position} position to split at
   * @return {Section[]} 2-item array of pre and post-split sections
   * @private
   */
  _splitCardSection(cardSection: Card, position: Position): [Section, Section] {
    let { offset } = position
    assert('Cards section must be split at offset 0 or 1', offset === 0 || offset === 1)

    let newSection = this.builder.createMarkupSection()
    let nextSection: Section
    let surroundingSections: [Section, Section]

    if (offset === 0) {
      nextSection = cardSection
      surroundingSections = [newSection, cardSection]
    } else {
      nextSection = cardSection.next!
      surroundingSections = [cardSection, newSection]
    }

    let collection = this.editor.post.sections
    this.insertSectionBefore(collection, newSection, nextSection)

    return surroundingSections
  }

  /**
   * @param {Section} section
   * @param {Section} newSection
   * @public
   */
  replaceSection(section: Section, newSection: Section) {
    if (!section) {
      // FIXME should a falsy section be a valid argument?
      this.insertSectionBefore(this.editor.post.sections, newSection, null)
    } else {
      this._replaceSection(section, [newSection])
    }
  }

  moveSectionBefore(
    collection: LinkedList<Cloneable<Section>>,
    renderedSection: Cloneable<Section>,
    beforeSection: Section
  ) {
    const newSection = renderedSection.clone()
    this.removeSection(renderedSection)
    this.insertSectionBefore(collection, newSection, beforeSection)
    return newSection
  }

  /**
   * @param {Section} section A section that is already in DOM
   * @public
   */
  moveSectionUp(renderedSection: Cloneable<Section>) {
    const isFirst = !renderedSection.prev
    if (isFirst) {
      return renderedSection
    }

    const collection = renderedSection.parent.sections
    const beforeSection = renderedSection.prev!
    return this.moveSectionBefore(collection, renderedSection, beforeSection)
  }

  /**
   * @param {Section} section A section that is already in DOM
   * @public
   */
  moveSectionDown(renderedSection: Cloneable<Section>) {
    const isLast = !renderedSection.next
    if (isLast) {
      return renderedSection
    }

    const beforeSection = renderedSection.next!.next!
    const collection = renderedSection.parent.sections
    return this.moveSectionBefore(collection, renderedSection, beforeSection)
  }

  /**
   * Insert an array of markers at the given position. If the position is in
   * a non-markerable section (like a card section), this method throws an error.
   *
   * @param {Position} position
   * @param {Marker[]} markers
   * @return {Position} The position that represents the end of the inserted markers.
   * @public
   */
  insertMarkers(position: Position, markers: Markuperable[]): Position {
    const section = position.section! as Markerable
    let offset = position.offset

    assert('Cannot insert markers at non-markerable position', section!.isMarkerable)

    this.editActionTaken = EditAction.INSERT_TEXT

    let edit = section.splitMarkerAtOffset(offset)
    edit.removed.forEach(marker => this._scheduleForRemoval(marker))

    let prevMarker = section.markerBeforeOffset(offset)
    markers.forEach(marker => {
      section.markers.insertAfter(marker, prevMarker!)
      offset += marker.length
      prevMarker = marker
    })

    this._coalesceMarkers(section)
    this._markDirty(section)

    let nextPosition = section.toPosition(offset)
    this.setRange(nextPosition)
    return nextPosition
  }

  /**
   * Inserts text with the given markups, ignoring the existing markups at
   * the position, if any.
   *
   * @param {Position} position
   * @param {String} text
   * @param {Markup[]} markups
   * @return {Position} position at the end of the inserted text
   */
  insertTextWithMarkup(position: Position, text: string, markups: Markup[] = []): Maybe<Position> {
    let { section } = position
    if (!section!.isMarkerable) {
      return
    }
    let marker = this.builder.createMarker(text, markups)
    return this.insertMarkers(position, [marker])
  }

  /**
   * Insert the text at the given position
   * Inherits the markups already at that position, if any.
   *
   * @param {Position} position
   * @param {String} text
   * @return {Position} position at the end of the inserted text.
   */
  insertText(position: Position, text: string): Maybe<Position> {
    let { section } = position
    if (!section!.isMarkerable) {
      return
    }
    let markups = position.marker && position.marker.markups
    markups = markups || []
    return this.insertTextWithMarkup(position, text, markups)
  }

  _replaceSection(section: Section, newSections: Section[]) {
    let nextSection = section.next
    let collection = (section.parent as unknown as HasChildSections).sections

    let nextNewSection = newSections[0]
    if (isMarkupSection(nextNewSection) && isListItem(section)) {
      // put the new section after the ListSection (section.parent)
      // instead of after the ListItem
      collection = (section.parent.parent as unknown as HasChildSections).sections
      nextSection = section.parent.next
    }

    newSections.forEach(s => this.insertSectionBefore(collection, s, nextSection))
    this.removeSection(section)
  }

  /**
   * Given a markerRange (for example `editor.range`) mark all markers
   * inside it as a given markup. The markup must be provided as a post
   * abstract node.
   *
   * Usage:
   *
   *     let range = editor.range;
   *     let strongMarkup = editor.builder.createMarkup('strong');
   *     editor.run((postEditor) => {
   *       postEditor.addMarkupToRange(range, strongMarkup);
   *     });
   *     // Will result some markers possibly being split, and the markup
   *     // being applied to all markers between the split.
   *
   * @param {Range} range
   * @param {Markup} markup A markup post abstract node
   * @public
   */
  addMarkupToRange(range: Range, markup: Markup) {
    if (range.isCollapsed) {
      return
    }

    let markers = this.splitMarkers(range)
    if (markers.length) {
      // We insert the new markup at a consistent index across the range.
      // If we just push on the end of the list, it can end up in different positions
      // of the markup stack. This results in unnecessary closing and re-opening of
      // the markup each time it changes position.
      // If we just push it at the beginning of the list, this causes unnecessary closing
      // and re-opening of surrounding tags.
      // So, we look for any tags open across the whole range, and push into the stack
      // at the end of those.
      // Prompted by https://github.com/bustle/mobiledoc-kit/issues/360

      let markupsOpenAcrossRange = reduce(
        markers,
        function (soFar, marker) {
          return commonItems(soFar, marker.markups)
        },
        markers[0].markups
      )
      let indexToInsert = markupsOpenAcrossRange.length

      markers.forEach(marker => {
        marker.addMarkupAtIndex(markup, indexToInsert)
        this._markDirty(marker)
      })
    }
  }

  /**
   * Given a markerRange (for example `editor.range`) remove the given
   * markup from all contained markers.
   *
   * Usage:
   * ```
   *     let { range } = editor;
   *     let markup = markerRange.headMarker.markups[0];
   *     editor.run(postEditor => {
   *       postEditor.removeMarkupFromRange(range, markup);
   *     });
   *     // Will result in some markers possibly being split, and the markup
   *     // being removed from all markers between the split.
   * ```
   * @param {Range} range Object with offsets
   * @param {Markup|Function} markupOrCallback A markup post abstract node or
   * a function that returns true when passed a markup that should be removed
   * @private
   */
  removeMarkupFromRange(range: Range, markupOrMarkupCallback: ((markup: Markup) => boolean) | Markup) {
    if (range.isCollapsed) {
      return
    }

    this.splitMarkers(range).forEach(marker => {
      marker.removeMarkup(markupOrMarkupCallback)
      this._markDirty(marker)
    })
  }

  /**
   * Toggle the given markup in the given range (or at the position given). If the range/position
   * has the markup, the markup will be removed. If nothing in the range/position
   * has the markup, the markup will be added to everything in the range/position.
   *
   * Usage:
   * ```
   * // Remove any 'strong' markup if it exists in the selection, otherwise
   * // make it all 'strong'
   * editor.run(postEditor => postEditor.toggleMarkup('strong'));
   *
   * // add/remove a link to 'bustle.com' to the selection
   * editor.run(postEditor => {
   *   const linkMarkup = postEditor.builder.createMarkup('a', {href: 'http://bustle.com'});
   *   postEditor.toggleMarkup(linkMarkup);
   * });
   * ```
   * @param {Markup|String} markupOrString Either a markup object created using
   * the builder (useful when adding a markup with attributes, like an 'a' markup),
   * or, if a string, the tag name of the markup (e.g. 'strong', 'em') to toggle.
   * @param {Range|Position} range in which to toggle. Defaults to current editor range.
   * @public
   */
  toggleMarkup(markupOrMarkupString: Markup | string, range: Range | Position = this._range) {
    range = toRange(range)
    const markup =
      typeof markupOrMarkupString === 'string' ? this.builder.createMarkup(markupOrMarkupString) : markupOrMarkupString

    const hasMarkup = this.editor.detectMarkupInRange(range, markup.tagName)
    // FIXME: This implies only a single markup in a range. This may not be
    // true for links (which are not the same object instance like multiple
    // strong tags would be).
    if (hasMarkup) {
      this.removeMarkupFromRange(range, hasMarkup)
    } else {
      this.addMarkupToRange(range, markup)
    }

    this.setRange(range)
  }

  /**
   * Toggles the tagName of the active section or sections in the given range/position.
   * If every section has the tag name, they will all be reset to default sections.
   * Otherwise, every section will be changed to the requested type
   *
   * @param {String} sectionTagName A valid markup section or
   *        list section tag name (e.g. 'blockquote', 'h2', 'ul')
   * @param {Range|Position} range The range over which to toggle.
   *        Defaults to the current editor range.
   * @public
   */
  toggleSection(sectionTagName: string, range: Range | Position = this._range) {
    range = shrinkRange(toRange(range))

    sectionTagName = normalizeTagName(sectionTagName)
    let { post } = this.editor

    let everySectionHasTagName = true
    post.walkMarkerableSections(range, section => {
      if (!this._isSameSectionType(section, sectionTagName)) {
        everySectionHasTagName = false
      }
    })

    let tagName = everySectionHasTagName ? 'p' : sectionTagName
    let sectionTransformations: SectionTransformation[] = []
    post.walkMarkerableSections(range, section => {
      let changedSection = this.changeSectionTagName(section, tagName)

      sectionTransformations.push({
        from: section,
        to: changedSection,
      })
    })

    let nextRange = this._determineNextRangeAfterToggleSection(range, sectionTransformations)
    this.setRange(nextRange)
  }

  _determineNextRangeAfterToggleSection(range: Range, sectionTransformations: SectionTransformation[]) {
    if (sectionTransformations.length) {
      let changedHeadSection = detect(sectionTransformations, ({ from }) => {
        return from === range.headSection
      })!.to
      let changedTailSection = detect(sectionTransformations, ({ from }) => {
        return from === range.tailSection
      })!.to

      if (changedHeadSection.isListSection || changedTailSection.isListSection) {
        // We don't know to which ListItem's the original sections point at, so
        // we don't have enough information to reconstruct the range when
        // dealing with lists.
        return sectionTransformations[0].to.headPosition().toRange()
      } else {
        return Range.create(
          changedHeadSection as Markerable,
          range.headSectionOffset,
          changedTailSection as Markerable,
          range.tailSectionOffset,
          range.direction
        )
      }
    } else {
      return range
    }
  }

  setAttribute(key: string, value: string, range: Range = this._range) {
    this._mutateAttribute(key, range, (section, attribute) => {
      if (section.getAttribute(attribute) !== value) {
        section.setAttribute(attribute, value)
        return true
      }
    })
  }

  removeAttribute(key: string, range: Range = this._range) {
    this._mutateAttribute(key, range, (section, attribute) => {
      if (section.hasAttribute(attribute)) {
        section.removeAttribute(attribute)
        return true
      }
    })
  }

  _mutateAttribute(key: string, range: Range, cb: (section: Attributable, attribute: string) => boolean | void) {
    range = toRange(range)
    let { post } = this.editor
    let attribute = `data-md-${key}`

    post.walkMarkerableSections(range, section => {
      const cbSection: Attributable = isListItem(section) ? section.parent : (section as unknown as Attributable)

      if (cb(cbSection, attribute) === true) {
        this._markDirty(section)
      }
    })

    this.setRange(range)
  }

  _isSameSectionType(section: Section & TagNameable, sectionTagName: string) {
    return isListItem(section) ? section.parent.tagName === sectionTagName : section.tagName === sectionTagName
  }

  /**
   * @param {Markerable} section
   * @private
   */
  changeSectionTagName(section: Markerable & TagNameable, newTagName: string) {
    assert('Cannot pass non-markerable section to `changeSectionTagName`', section.isMarkerable)

    if (isListSectionTagName(newTagName)) {
      return this._changeSectionToListItem(section, newTagName)
    } else if (isListItem(section)) {
      return this._changeSectionFromListItem(section, newTagName)
    } else {
      section.tagName = newTagName
      this._markDirty(section)
      return section
    }
  }

  /**
   * Splits the item at the position given.
   * If the position is at the start or end of the item, the pre- or post-item
   * will contain a single empty ("") marker.
   * @param {ListItem} item
   * @param {Position} position
   * @return {Array} the pre-item and post-item on either side of the split
   * @private
   */
  _splitListItem(item: ListItem, position: Position): [ListItem, ListItem] {
    let { section, offset } = position
    assert('Cannot split list item at position that does not include item', item === section)

    item.splitMarkerAtOffset(offset)
    let prevMarker = item.markerBeforeOffset(offset)
    let preItem = this.builder.createListItem(),
      postItem = this.builder.createListItem()

    let currentItem = preItem
    item.markers.forEach(marker => {
      currentItem.markers.append(marker.clone())
      if (marker === prevMarker) {
        currentItem = postItem
      }
    })
    this._replaceSection(item, [preItem, postItem])
    return [preItem, postItem]
  }

  /**
   * Splits the list at the position given.
   * @return {Array} pre-split list and post-split list, either of which could
   * be blank (0-item list) if the position is at the start or end of the list.
   *
   * Note: Contiguous list sections will be joined in the before_complete queue
   * of the postEditor.
   *
   * @private
   */
  _splitListAtPosition(list: ListSection, position: Position): [ListSection, ListSection] {
    assert('Cannot split list at position not in list', position.section!.parent === list)

    let positionIsMiddle = !position.isHead() && !position.isTail()
    if (positionIsMiddle) {
      let item = position.section! as ListItem
      let [pre] = this._splitListItem(item, position)
      position = pre.tailPosition()
    }

    let preList = this.builder.createListSection(list.tagName)
    let postList = this.builder.createListSection(list.tagName)

    let preItem = position.section
    let currentList = preList
    list.items.forEach(item => {
      // If this item matches the start item and the position is at its start,
      // it should be appended to the postList instead of the preList
      if (item === preItem && position.isEqual(item.headPosition())) {
        currentList = postList
      }
      currentList.items.append(item.clone())
      // If we just appended the preItem, append the remaining items to the postList
      if (item === preItem) {
        currentList = postList
      }
    })

    this._replaceSection(list, [preList, postList])
    return [preList, postList]
  }

  /**
   * @return Array of [prev, mid, next] lists. `prev` and `next` can
   *         be blank, depending on the position of `item`. `mid` will always
   *         be a 1-item list containing `item`. `prev` and `next` will be
   *         removed in the before_complete queue if they are blank
   *         (and still attached).
   *
   * @private
   */
  _splitListAtItem(list: ListSection, item: ListItem) {
    let next = list
    let prev = this.builder.createListSection(next.tagName, [], next.attributes)
    let mid = this.builder.createListSection(next.tagName)

    let addToPrev = true
    // must turn the LinkedList into an array so that we can remove items
    // as we iterate through it
    let items = next.items.toArray()
    items.forEach(i => {
      let listToAppend: ListSection
      if (i === item) {
        addToPrev = false
        listToAppend = mid
      } else if (addToPrev) {
        listToAppend = prev
      } else {
        return // break after iterating prev and mid parts of the list
      }
      listToAppend.join(i)
      this.removeSection(i)
    })
    let found = !addToPrev
    assert('Cannot split list at item that is not present in the list', found)

    let collection = this.editor.post.sections
    this.insertSectionBefore(collection, mid, next)
    this.insertSectionBefore(collection, prev, mid)

    // Remove possibly blank prev/next lists
    this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, () => {
      ;[prev, next].forEach(_list => {
        let isAttached = !!_list._parent
        if (_list.isBlank && isAttached) {
          this.removeSection(_list)
        }
      })
    })

    return [prev, mid, next]
  }

  _changeSectionFromListItem(section: Section, newTagName: string) {
    assertType<ListItem>('Must pass list item to `_changeSectionFromListItem`', section, isListItem(section))

    let listSection = section.parent as ListSection
    let markupSection = this.builder.createMarkupSection(newTagName)
    markupSection.join(section)

    let [, mid] = this._splitListAtItem(listSection, section)
    this.replaceSection(mid, markupSection)
    return markupSection
  }

  _changeSectionToListItem(section: ListSection | Markerable, newTagName: string) {
    let isAlreadyCorrectListItem =
      section.isListItem && (section.parent as unknown as TagNameable).tagName === newTagName

    if (isAlreadyCorrectListItem) {
      return section
    }

    let listSection = this.builder.createListSection(newTagName)
    listSection.join(section)

    let sectionToReplace: Section
    if (isListItem(section)) {
      let [, mid] = this._splitListAtItem(section.parent, section)
      sectionToReplace = mid
    } else {
      sectionToReplace = section
    }
    this.replaceSection(sectionToReplace, listSection)
    return listSection
  }

  /**
   * Insert a given section before another one, updating the post abstract
   * and the rendered UI.
   *
   * Usage:
   * ```
   *     let markerRange = editor.range;
   *     let sectionWithCursor = markerRange.headMarker.section;
   *     let section = editor.builder.createCardSection('my-image');
   *     let collection = sectionWithCursor.parent.sections;
   *     editor.run((postEditor) => {
   *       postEditor.insertSectionBefore(collection, section, sectionWithCursor);
   *     });
   * ```
   * @param {LinkedList} collection The list of sections to insert into
   * @param {Object} section The new section
   * @param {Object} beforeSection Optional The section "before" is relative to,
   *        if falsy the new section will be appended to the collection
   * @public
   */
  insertSectionBefore(
    collection: LinkedList<Section> | LinkedList<Cloneable<Section>>,
    section: Section,
    beforeSection?: Option<Section>
  ) {
    ;(collection as LinkedList<Section>).insertBefore(section, beforeSection)
    this._markDirty(section.parent)
  }

  /**
   * Insert the given section after the current active section, or, if no
   * section is active, at the end of the document.
   * @param {Section} section
   * @public
   */
  insertSection(section: Section) {
    const activeSection = this.editor.activeSection
    const nextSection = activeSection && activeSection.next

    const collection = this.editor.post.sections as unknown as LinkedList<Section>
    this.insertSectionBefore(collection, section, nextSection)
  }

  /**
   * Insert the given section at the end of the document.
   * @param {Section} section
   * @public
   */
  insertSectionAtEnd(section: Section) {
    this.insertSectionBefore(this.editor.post.sections, section, null)
  }

  /**
   * Insert the `post` at the given position in the editor's post.
   * @param {Position} position
   * @param {Post} post
   * @private
   */
  insertPost(position: Position, newPost: Post) {
    let post = this.editor.post
    let inserter = new PostInserter(this, post)
    let nextPosition = inserter.insert(position, newPost)
    return nextPosition
  }

  /**
   * Remove a given section from the post abstract and the rendered UI.
   *
   * Usage:
   * ```
   *     let { range } = editor;
   *     let sectionWithCursor = range.head.section;
   *     editor.run((postEditor) => {
   *       postEditor.removeSection(sectionWithCursor);
   *     });
   * ```
   * @param {Object} section The section to remove
   * @public
   */
  removeSection(section: Section) {
    let parent = section.parent

    assertType<HasChildSections>('expected section to have child sections', parent, hasChildSections(parent))

    this._scheduleForRemoval(section)
    parent.sections.remove(section)

    if (isListSection(parent)) {
      this._scheduleListRemovalIfEmpty(parent)
    }
  }

  removeAllSections() {
    this.editor.post.sections.toArray().forEach(section => {
      this.removeSection(section)
    })
  }

  migrateSectionsFromPost(post: Post) {
    post.sections.toArray().forEach(section => {
      post.sections.remove(section)
      this.insertSectionBefore(this.editor.post.sections, section, null)
    })
  }

  _scheduleListRemovalIfEmpty(listSection: ListSection) {
    this.addCallback(CALLBACK_QUEUES.BEFORE_COMPLETE, () => {
      // if the list is attached and blank after we do other rendering stuff,
      // remove it
      let isAttached = !!listSection._parent
      if (isAttached && listSection.isBlank) {
        this.removeSection(listSection)
      }
    })
  }

  /**
   * A method for adding work the deferred queue
   *
   * @param {Function} callback to run during completion
   * @param {Boolean} [once=false] Whether to only schedule the callback once.
   * @public
   */
  schedule(callback: LifecycleCallback, once: boolean = false) {
    assert('Work can only be scheduled before a post edit has completed', !this._didComplete)
    if (once) {
      this.addCallbackOnce(CALLBACK_QUEUES.COMPLETE, callback)
    } else {
      this.addCallback(CALLBACK_QUEUES.COMPLETE, callback)
    }
  }

  /**
   * A method for adding work the deferred queue. The callback will only
   * be added to the queue once, even if `scheduleOnce` is called multiple times.
   * The function cannot be an anonymous function.
   *
   * @param {Function} callback to run during completion
   * @public
   */
  scheduleOnce(callback: LifecycleCallback) {
    this.schedule(callback, true)
  }

  /**
   * Add a rerender job to the queue
   *
   * @public
   */
  scheduleRerender() {
    this.scheduleOnce(this._rerender)
  }

  /**
   * Schedule a notification that the post has been changed.
   * The notification will result in the editor firing its `postDidChange`
   * hook after the postEditor completes its work (at the end of {@link Editor#run}).
   *
   * @public
   */
  scheduleDidUpdate() {
    this.scheduleOnce(this._postDidChange)
  }

  scheduleAfterRender(callback: LifecycleCallback, once = false) {
    if (once) {
      this.addCallbackOnce(CALLBACK_QUEUES.AFTER_COMPLETE, callback)
    } else {
      this.addCallback(CALLBACK_QUEUES.AFTER_COMPLETE, callback)
    }
  }

  /**
   * Flush any work on the queue. {@link Editor#run} calls this method; it
   * should not be called directly.
   *
   * @private
   */
  complete() {
    assert('Post editing can only be completed once', !this._didComplete)

    this.runCallbacks(CALLBACK_QUEUES.BEFORE_COMPLETE)
    this._didComplete = true
    this.runCallbacks(CALLBACK_QUEUES.COMPLETE)
    this.runCallbacks(CALLBACK_QUEUES.AFTER_COMPLETE)
  }

  undoLastChange() {
    this.editor._editHistory.stepBackward(this)
  }

  redoLastChange() {
    this.editor._editHistory.stepForward(this)
  }

  cancelSnapshot() {
    this._shouldCancelSnapshot = true
  }
}

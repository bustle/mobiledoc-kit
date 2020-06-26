import Range from './cursor/range'
import Position from './cursor/position'
import assert from './assert'

export default function toRange(rangeLike: Range | Position) {
  assert(`Must pass non-blank object to "toRange"`, !!rangeLike)

  if (rangeLike instanceof Range) {
    return rangeLike
  } else if (rangeLike instanceof Position) {
    return rangeLike.toRange()
  }

  assert(`Incorrect structure for rangeLike: ${rangeLike}`, false)
}

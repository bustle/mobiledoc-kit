import Range from 'mobiledoc-kit/utils/cursor/range';
import Position from 'mobiledoc-kit/utils/cursor/position';
import assert from 'mobiledoc-kit/utils/assert';

export default function toRange(rangeLike) {
  assert(`Must pass non-blank object to "toRange"`, !!rangeLike);

  if (rangeLike instanceof Range) {
    return rangeLike;
  } else if (rangeLike instanceof Position) {
    return rangeLike.toRange();
  }

  assert(`Incorrect structure for rangeLike: ${rangeLike}`, false);
}

import assert from 'mobiledoc-kit/utils/assert';

export default function toRange(rangeLike) {
  assert(`Must pass non-blank object to "toRange"`, !!rangeLike);


  if (typeof rangeLike.toRange === 'function') {
    return rangeLike.toRange();
  } else {
    assert(`Incorrect structure for rangeLike: ${rangeLike}, requires a toRange function.`, false);
  }
}

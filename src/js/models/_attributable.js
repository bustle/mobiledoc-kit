import { filterObject } from '../utils/array-utils';

export const VALID_ATTRIBUTES = [
  'data-md-text-align'
];

/** @this Attributable */
export function attributable(ctx, attributes) {
  ctx.attributes = filterObject(attributes, VALID_ATTRIBUTES);
}

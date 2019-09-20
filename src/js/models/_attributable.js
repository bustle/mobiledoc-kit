import { entries } from '../utils/object-utils';

export const VALID_ATTRIBUTES = [
  'data-md-text-align'
];

/*
 * A "mixin" to add section attribute support
 * to markup and list sections.
 */
export function attributable(ctx) {
  ctx.attributes = {};

  ctx.setAttribute = (key, value) => {
    if (!VALID_ATTRIBUTES.includes(key)) {
      throw new Error(`Invalid attribute "${key}" was passed. Constrain attributes to the spec-compliant whitelist.`);
    }
    ctx.attributes[key] = value;
  };
  ctx.removeAttribute = key => {
    delete ctx.attributes[key];
  };
  ctx.getAttribute = key => ctx.attributes[key];
  ctx.eachAttribute = cb => {
    entries(ctx.attributes).forEach(([k,v]) => cb(k,v));
  };
}

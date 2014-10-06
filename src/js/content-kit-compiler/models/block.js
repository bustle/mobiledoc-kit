import Model from './model';
import { inherit } from '../../content-kit-utils/object-utils';

/**
 * Ensures block markups at the same index are always in a specific order.
 * For example, so all bold links are consistently marked up 
 * as <a><b>text</b></a> instead of <b><a>text</a></b>
 */
function sortBlockMarkups(markups) {
  return markups.sort(function(a, b) {
    if (a.start === b.start && a.end === b.end) {
      return b.type - a.type;
    }
    return 0;
  });
}

/**
 * @class BlockModel
 * @constructor
 * @extends Model
 */
function BlockModel(options) {
  options = options || {};
  Model.call(this, options);
  this.value = options.value || '';
  this.markup = sortBlockMarkups(options.markup || []);
}

inherit(BlockModel, Model);

export default BlockModel;

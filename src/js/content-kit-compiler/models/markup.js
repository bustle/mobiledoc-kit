import Model from './model';

/**
 * @class MarkupModel
 * @constructor
 * @extends Model
 */
function MarkupModel(options) {
  options = options || {};
  Model.call(this, options);
  this.start = options.start || 0;
  this.end = options.end || 0;
}

export default MarkupModel;

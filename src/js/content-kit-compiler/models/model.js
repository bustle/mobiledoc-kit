/**
 * @class Model
 * @constructor
 * @private
 */
function Model(options) {
  options = options || {};
  var type_name = options.type_name;
  var attributes = options.attributes;

  this.type = options.type || null;
  if (type_name) {
    this.type_name = type_name;
  }
  if (attributes) {
    this.attributes = attributes;
  }
}

/**
 * @method createWithType
 * @static
 * @param type Type
 * @param options Object
 */
Model.createWithType = function(type, options) {
  options = options || {};
  options.type = type.id;
  options.type_name = type.name;
  return new this(options);
};

export default Model;
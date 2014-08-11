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

export default Model;
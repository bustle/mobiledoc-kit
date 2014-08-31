import Type from './type';

/**
 * @class TypeSet
 * @private
 * @constructor
 * A Set of Types
 */
function TypeSet(types) {
  var len = types && types.length, i;

  this._autoId    = 1;  // Auto-increment id counter
  this.idLookup   = {}; // Hash cache for finding by id
  this.tagLookup  = {}; // Hash cache for finding by tag

  for (i = 0; i < len; i++) {
    this.addType(types[i]);
  }
}

TypeSet.prototype = {
  /**
   * Adds a type to the set
   */
  addType: function(type) {
    if (type instanceof Type) {
      this[type.name] = type;
      if (type.id === undefined) {
        type.id = this._autoId++;
      }
      this.idLookup[type.id] = type;
      if (type.tag) {
        this.tagLookup[type.tag] = type;
      }
      return type;
    }
  },

  /**
   * Returns type info for a given Node
   */
  findByNode: function(node) {
    if (node) {
      return this.findByTag(node.tagName);
    }
  },
  /**
   * Returns type info for a given tag
   */
  findByTag: function(tag) {
    if (tag) {
      return this.tagLookup[tag.toLowerCase()];
    }
  },
  /**
   * Returns type info for a given id
   */
  findById: function(id) {
    return this.idLookup[id];
  }
};

export default TypeSet;

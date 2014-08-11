import { underscore } from '../../content-kit-utils/string-utils';

/**
 * @class Type
 * @constructor
 * Contains meta info about a node type (id, name, tag, etc).
 */
function Type(options) {
  if (options) {
    this.name = underscore(options.name || options.tag).toUpperCase();
    if (options.id !== undefined) {
      this.id = options.id;
    }
    if (options.tag) {
      this.tag = options.tag.toLowerCase();
      this.selfClosing = /^(br|img|hr|meta|link|embed)$/i.test(this.tag);
    }

    // Register the type as constant
    Type[this.name] = this;
  }
}

export default Type;

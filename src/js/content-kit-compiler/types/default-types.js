import TypeSet from './type-set';
import Type from './type';

/**
 * Default supported block types
 */
var DefaultBlockTypeSet = new TypeSet([
  new Type({ tag: 'p', name: 'text' }),
  new Type({ tag: 'h2', name: 'heading' }),
  new Type({ tag: 'h3', name: 'subheading' }),
  new Type({ tag: 'img', name: 'image' }),
  new Type({ tag: 'blockquote', name: 'quote' }),
  new Type({ tag: 'ul', name: 'list' }),
  new Type({ tag: 'ol', name: 'ordered list' }),
  new Type({ name: 'embed' })
]);

/**
 * Default supported markup types
 */
var DefaultMarkupTypeSet = new TypeSet([
  new Type({ tag: 'b', name: 'bold' }),
  new Type({ tag: 'i', name: 'italic' }),
  new Type({ tag: 'u', name: 'underline' }),
  new Type({ tag: 'a', name: 'link' }),
  new Type({ tag: 'br', name: 'break' }),
  new Type({ tag: 'li', name: 'list item' }),
  new Type({ tag: 'sub', name: 'subscript' }),
  new Type({ tag: 'sup', name: 'superscript' })
]);

export { DefaultBlockTypeSet, DefaultMarkupTypeSet };

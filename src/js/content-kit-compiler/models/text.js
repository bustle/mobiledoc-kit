import BlockModel from './block';
import Type from '../types/type';
import { inherit } from '../../content-kit-utils/object-utils';

/**
 * @class TextModel
 * @constructor
 * @extends BlockModel
 * A simple BlockModel subclass representing a paragraph of text
 */
function TextModel(options) {
  options = options || {};
  options.type = Type.TEXT.id;
  options.type_name = Type.TEXT.name;
  BlockModel.call(this, options);
}
inherit(TextModel, BlockModel);

export default TextModel;

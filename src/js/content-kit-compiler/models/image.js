import BlockModel from './block';
import Type from '../types/type';
import { inherit } from '../../content-kit-utils/object-utils';

/**
 * @class ImageModel
 * @constructor
 * @extends BlockModel
 * A simple BlockModel subclass representing an image
 */
function ImageModel(options) {
  options = options || {};
  options.type = Type.IMAGE.id;
  options.type_name = Type.IMAGE.name;
  if (options.src) {
    options.attributes = { src: options.src };
  }
  BlockModel.call(this, options);
}
inherit(ImageModel, BlockModel);

export default ImageModel;

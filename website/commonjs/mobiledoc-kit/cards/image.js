'use strict';

var _utilsPlaceholderImageSrc = require('../utils/placeholder-image-src');

exports['default'] = {
  name: 'image',
  type: 'dom',

  render: function render(_ref) {
    var payload = _ref.payload;

    var img = document.createElement('img');
    img.src = payload.src || _utilsPlaceholderImageSrc['default'];
    return img;
  }
};
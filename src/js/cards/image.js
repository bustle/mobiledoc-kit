import placeholderImageSrc from 'mobiledoc-kit/utils/placeholder-image-src';

export default {
  name: 'image',

  display: {
    setup(element, options, env, payload) {
      let img = document.createElement('img');
      img.src = payload.src || placeholderImageSrc;
      element.appendChild(img);
      return img;
    },
    teardown(element) {
      element.parentNode.removeChild(element);
    }
  }
};

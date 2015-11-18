const defaultSrc = 'http://placekitten.com/200/75';

export default {
  name: 'image-card',
  type: 'html',
  render({payload}) {
    return `<img src="${payload.src || defaultSrc}">`;
  }
};

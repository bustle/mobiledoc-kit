export default {
  name: 'image-atom',
  type: 'html',
  render({value}) {
    return `<img src="${value}">`;
  }
};

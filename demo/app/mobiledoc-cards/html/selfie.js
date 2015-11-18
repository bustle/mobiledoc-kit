export default {
  name: 'selfie-card',
  type: 'html',
  render: ({env, payload}) => {
    return `<img src="${payload.src}">`;
  }
};

export default {
  name: 'codemirror-card',
  type: 'html',
  render({payload}) {
    if (payload.code) {
      return `<code>${payload.code}</code>`;
    }
  }
};

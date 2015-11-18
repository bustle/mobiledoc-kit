export default {
  name: 'codemirror-card',
  type: 'text',
  render({payload}) {
    if (payload.code) {
      return `[code] ${payload.code}`;
    }
  }
};

export default {
  name: 'input-card',
  type: 'html',
  render({payload}) {
    return 'Hello, ' + (payload.name || 'unknown')  + '!';
  }
};

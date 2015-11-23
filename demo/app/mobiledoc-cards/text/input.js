export default {
  name: 'input-card',
  type: 'text',
  render({payload}) {
    return 'Hello, ' + (payload.name || 'unknown')  + '!';
  }
};

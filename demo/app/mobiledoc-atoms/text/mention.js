export default {
  name: 'mention-atom',
  type: 'text',
  render({value}) {
    return `Hello ${value}`;
  }
};

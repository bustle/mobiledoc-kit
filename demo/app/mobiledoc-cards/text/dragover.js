export default {
  name: 'dragover',
  type: 'text',
  render({payload}) {
    return 'Hello, ' + (payload.didDrop ? 'did drop' : 'did not drop') +
      ', ' + (payload.didDrag ? 'did drag' : 'did not drag');
  }
};

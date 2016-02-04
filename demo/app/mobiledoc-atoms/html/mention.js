export default {
  name: 'mention-atom',
  type: 'html',
  render({value}) {
    return `<span class="mention-atom">Hello ${value}</span>`;
  }
};

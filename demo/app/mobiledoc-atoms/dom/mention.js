export default {
  name: 'mention-atom',
  type: 'dom',
  render({value}) {
    const element = document.createElement("span");
    element.className = 'mention-atom';
    element.appendChild(document.createTextNode(`Hello ${value}`));
    return element;
  }
};

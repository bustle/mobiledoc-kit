export default {
  name: 'image-atom',
  type: 'dom',
  render() {
    const element = document.createElement("img");
    element.style.display = 'inline';
    element.src = 'http://placehold.it/30x20';
    return element;
  }
};

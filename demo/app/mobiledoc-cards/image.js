export let imageCard = {
  name: 'image-card',
  display: {
    setup(element) {
      var card = document.createElement('img');
      card.src = 'http://placehold.it/200x75';
      element.appendChild(card);
    }
  }
};

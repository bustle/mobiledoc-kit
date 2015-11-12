import Ember from 'ember';

let { $ } = Ember;

export default {
  name: 'simple-card',
  display: {
    setup(element, options, env) {
      var card = document.createElement('span');
      card.innerHTML = 'Hello, world';
      element.appendChild(card);
      var button = $('<button>Remove card</button>');
      button.on('click', env.remove);
      $(element).append(button);
    }
  }
};

import Ember from 'ember';

let { $ } = Ember;

export default {
  name: 'simple-card',
  type: 'dom',
  render({env}) {
    var element = document.createElement('div');
    var card = document.createElement('span');
    card.innerHTML = 'Hello, world';
    element.appendChild(card);
    var button = $('<button>Remove card</button>');
    button.on('click', env.remove);
    element.appendChild(button[0]);
    return element;
  }
};

import Ember from 'ember';

let { $ } = Ember;

export let inputCard = {
  name: 'input-card',
  display: {
    setup(element, options, env, payload) {
      $(element).empty();

      var text = 'I am in display mode';
      if (payload.name) {
        text = 'Hello, ' + payload.name + '!';
      }
      var card = document.createElement('div');
      card.innerText = text;

      var button = document.createElement('button');
      button.innerText = 'Edit';
      button.onclick = env.edit;

      if (env.edit) {
        card.appendChild(button);
      }
      element.appendChild(card);
    }
  },
  edit: {
    setup(element, options, env) {
      $(element).empty();
      var card = document.createElement('div');
      card.innerHTML = 'What is your name?';

      var input = document.createElement('input');
      input.placeholder = 'Enter your name...';

      var button = document.createElement('button');
      button.innerText = 'Save';
      button.onclick = function() {
        var name = input.value;
        env.save({name:name});
      };

      card.appendChild(input);
      card.appendChild(button);
      element.appendChild(card);
    }
  }
};

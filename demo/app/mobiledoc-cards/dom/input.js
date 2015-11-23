import Ember from 'ember';

let { $ } = Ember;

export default {
  name: 'input-card',
  type: 'dom',
  render({env, payload}) {
    var text = 'I am in display mode';
    if (payload.name) {
      text = 'Hello, ' + payload.name + '!';
    }
    var card = $(`<div>${text}</div>`);
    var button = $('<button>Edit</button>');
    button.on('click', env.edit);

    if (env.edit) {
      card.append(button);
    }
    return card[0];
  },
  edit({env}) {
    var card = $('<div>What is your name?</div>');
    card.innerHTML = 'What is your name?';

    var input = $('<input placeholder="Enter your name...">');
    var button = $('<button>Save</button>');
    button.on('click', () => {
      var name = input.val();
      env.save({name});
    });

    card.append(input);
    card.append(button);
    return card[0];
  }
};

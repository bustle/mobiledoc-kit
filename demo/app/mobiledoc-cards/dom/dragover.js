import Ember from 'ember';

let { $ } = Ember;

export default {
  name: 'dragover',
  type: 'dom',
  render({env, payload}) {
    let color = payload.didDrop ? 'red' : (payload.didDrag ? 'green' : 'black');
    let text = payload.didDrop ? 'dropped' : (payload.didDrag ? 'dragged' : 'nothing');
    let div = $(`<div>${text}</div>`).css({
      border: `2px solid ${color}`
    });

    if (env.isInEditor) {
      div.on('dragover', function(event) {
        event.preventDefault();

        div.css({border: '2px solid green'}).text('DRAGOVER');
        payload.didDrag = true;
        env.save(payload);
      });
      div.on('drop', function(event) {
        event.preventDefault();

        div.css({border: '2px solid red'}).text('DROP');
        payload.didDrop = true;
        env.save(payload);
      });
    }

    return div[0];
  }
};

import View from './view';
import { inherit } from '../../content-kit-utils/object-utils';

function Message(options) {
  options = options || {};
  options.classNames = ['ck-message'];
  View.call(this, options);
}
inherit(Message, View);

Message.prototype.show = function(message) {
  var messageView = this;
  messageView.element.innerHTML = message;
  Message._super.prototype.show.call(messageView);
  setTimeout(function() {
    messageView.hide();
  }, 3000);
};

export default Message;

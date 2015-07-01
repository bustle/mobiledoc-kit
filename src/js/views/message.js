import View from './view';
import { inherit } from 'content-kit-utils';

var defaultClassNames = ['ck-message'];

function Message(options) {
  options = options || {};
  options.classNames = defaultClassNames;
  View.call(this, options);
}
inherit(Message, View);

function show(view, message) {
  view.element.innerHTML = message;
  Message._super.prototype.show.call(view);
  setTimeout(function() {
    view.hide();
  }, 3200);
}

Message.prototype.showInfo = function(message) {
  this.setClasses(defaultClassNames);
  show(this, message);
};

Message.prototype.showError = function(message) {
  this.addClass('ck-message-error');
  show(this, message);
};

export default Message;

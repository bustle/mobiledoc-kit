import { filter } from './array-utils';

export default class EventListenerMixin {
  addEventListener(context, eventName, listener) {
    if (!this._eventListeners) { this._eventListeners = []; }
    context.addEventListener(eventName, listener);
    this._eventListeners.push([context, eventName, listener]);
  }

  removeAllEventListeners() {
    const listeners = this._eventListeners || [];
    listeners.forEach(([context, ...args]) => {
      context.removeEventListener(...args);
    });
  }

  // This is primarily useful for programmatically simulating events on the
  // editor from the tests.
  triggerEvent(context, eventName, event) {
    let matches = filter(
      this._eventListeners,
      ([_context, _eventName]) => {
        return context === _context && eventName === _eventName;
      }
    );
    matches.forEach(([context, eventName, listener]) => {
      listener.call(context, event);
    });
  }
}

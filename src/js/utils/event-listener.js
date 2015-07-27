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
}

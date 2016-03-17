let options = {
  enabled: false,
  all: false,
  types: []
};

/**
 * A Logger to add debugging-style logging
 * that can be turned on/off by type of log
 *
 * Usage:
 * Logger.enable();
 * Logger.enableTypes(['my-events']);
 * let log = Logger.for('my-events');
 * log('some message'); // => will be logged because 'my-events' is enabled
 *
 * log = Logger.for('other-events');
 * log('another message'); // => wil not be logged, because 'other-events'
 *                         //    is not enabled
 */
const Logger = class Logger {
  constructor(type) {
    this.type = type;
  }

  static for(type) {
    let logger = new Logger(type);
    let logFn = (...args) => {
      logger.log(...args);
    };
    return logFn;
  }

  log(...args) {
    args.unshift('[' + this.type + ']');

    if (options.enabled &&
        (options.all || options.types.indexOf(this.type) !== -1)) {
      window.console.log(...args);
    }
  }

  static enable() {
    options.enabled = true;
  }

  static disable() {
    options.enabled = false;
  }

  static enableTypes(types=[]) {
    types.forEach(type => {
      if (options.types.indexOf(type) === -1) {
        options.types.push(type);
      }
    });
  }

  static enableAll() {
    options.all = true;
  }
};

export default Logger;

class Logger {
  constructor(type, manager) {
    this.type = type;
    this.manager = manager;
  }

  isEnabled() {
    return this.manager.isEnabled(this.type);
  }

  log(...args) {
    args.unshift(`[${this.type}]`);
    if (this.isEnabled()) {
      window.console.log(...args);
    }
  }
}

class LogManager {
  constructor() {
    this.enabledTypes = [];
    this.allEnabled = false;
  }

  for(type) {
    return new Logger(type, this);
  }

  enableAll() {
    this.allEnabled = true;
  }

  enableTypes(types) {
    this.enabledTypes = this.enabledTypes.concat(types);
  }

  disable() {
    this.enabledTypes = [];
    this.allEnabled = false;
  }

  isEnabled(type) {
    return this.allEnabled || this.enabledTypes.indexOf(type) !== -1;
  }
}

export default LogManager;

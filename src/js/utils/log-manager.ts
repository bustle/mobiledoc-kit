class Logger {
  type: string
  manager: LogManager

  constructor(type: string, manager: LogManager) {
    this.type = type
    this.manager = manager
  }

  isEnabled() {
    return this.manager.isEnabled(this.type)
  }

  log(...args: unknown[]) {
    args.unshift(`[${this.type}]`)
    if (this.isEnabled()) {
      window.console.log(...args)
    }
  }
}

export default class LogManager {
  enabledTypes: string[]
  allEnabled: boolean

  constructor() {
    this.enabledTypes = []
    this.allEnabled = false
  }

  for(type: string) {
    return new Logger(type, this)
  }

  enableAll() {
    this.allEnabled = true
  }

  enableTypes(types: []) {
    this.enabledTypes = this.enabledTypes.concat(types)
  }

  disable() {
    this.enabledTypes = []
    this.allEnabled = false
  }

  isEnabled(type: string) {
    return this.allEnabled || this.enabledTypes.indexOf(type) !== -1
  }
}

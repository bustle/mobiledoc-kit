export default class Command {
  constructor(options={}) {
    var command = this;
    var name = options.name;
    var prompt = options.prompt;
    command.name = name;
    command.button = options.button || name;
    if (prompt) { command.prompt = prompt; }
  }

  exec() {/* override in subclass */}
  unexec() {/* override in subclass */}
}

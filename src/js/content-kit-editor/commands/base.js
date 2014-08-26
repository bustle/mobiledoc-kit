function Command(options) {
  var command = this;
  var name = options.name;
  var prompt = options.prompt;
  command.name = name;
  command.button = options.button || name;
  if (prompt) { command.prompt = prompt; }
}

Command.prototype.exec = function(){};

export default Command;

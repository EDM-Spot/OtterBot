const Promise = require("bluebird");
const { keys, each } = require("lodash");
const fs = Promise.promisifyAll(require("fs-extra"));

module.exports = class CommandsManager {
  constructor(bot) {
    this.Bot = bot;
    this.cooldownTypes = ["perUse", "perUser", "none"];
    this.Class = this.Bot.Classes.Command;
    this.registeredCommands = {};

    // start it
    this.processor = this.loadCommands();
  }
  static generateCommandID(command) {
    const [handle] = command.names;

    return `command:${handle}`;
  }
  register(command) {
    command.id = this.constructor.generateCommandID(command);

    if (!this.cooldownTypes.includes(command.cooldownType)) return;

    if (!this.registeredCommands[command.id]) {
      this.registeredCommands[command.id] = command;
      return;
    }

    console.error("[!] Commands Manager Error", command);
  }
  getLoaded() {
    return keys(this.registeredCommands).map(keyName => this.registeredCommands[keyName]);
  }
  loadCommands() {
    return new Promise(async (resolve, reject) => {
      try {
        const fileNames = await fs.readdir(__dirname);
        fileNames.splice(fileNames.indexOf("index.js"), 1);

        const modules = [];

        each(fileNames, (name) => {
          /* eslint-disable global-require */
          /* eslint-disable import/no-dynamic-require */
          const Module = require(`${__dirname}/${name}`)(this.Bot);

          modules.push(Module);
        });

        return resolve(modules);
      } catch (err) {
        return reject(err);
      }
    });
  }
};
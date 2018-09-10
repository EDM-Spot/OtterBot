const { keys, each } = require("lodash");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs-extra"));

module.exports = function EventsManager(bot, platforms) {
  this.register = function RegisterEvent(event) {
    event.id = `event:${event.platform}:${event.name.toLowerCase()}`;

    this[event.id] = event;
  };

  this.init = function InitializeEvents() {
    keys(this).filter(a => a.includes("event:")).map(a => this[a].init());
  };

  this.kill = function TerminateEvents() {
    keys(this).filter(a => a.includes("event:")).map(a => this[a].kill());
  };

  this.getLoaded = function GetEventsHandler() {
    return keys(this).filter(a => a.includes("event:")).map(a => this[a]);
  };

  this.loadPlatformEvents = function LoadPlatformEventsHandler(platform) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileNames = await fs.readdir(`${__dirname}/${platform}`);
        const modules = [];

        each(fileNames, (name) => {
          /* eslint-disable global-require */
          /* eslint-disable import/no-dynamic-require */
          const Module = require(`${__dirname}/${platform}/${name}`)(bot, platform);

          modules.push(Module);
        });

        return resolve(modules);
      } catch (err) {
        return reject(err);
      }
    });
  };

  this.processor = Promise.all(platforms.map(this.loadPlatformEvents));
};
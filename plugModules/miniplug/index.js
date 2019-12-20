const { each } = require("lodash");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs-extra"));

module.exports = function MiniplugPluginsManager(bot) {
  this.loadPlugins = function LoadPlugins() {
    return new Promise(async (resolve, reject) => {
      try {
        const fileNames = await fs.readdir(__dirname);
        fileNames.splice(fileNames.indexOf("index.js"), 1);

        each(fileNames, (name) => {
          /* eslint-disable global-require */
          /* eslint-disable import/no-dynamic-require */
          const Plugin = require(`${__dirname}/${name}`);

          Object.assign(bot.miniplug, Plugin);

          Plugin()(bot.plug);
        });

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  };

  this.processor = this.loadPlugins();
};
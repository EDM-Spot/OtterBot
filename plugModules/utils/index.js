const { each } = require("lodash");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs-extra"));

module.exports = function UtilsManager(bot) {
  this.register = function RegisterUtil(util) {
    this[util.name] = util.function;
  };

  this.loadUtils = function LoadUtils() {
    return new Promise(async (resolve, reject) => {
      try {
        const fileNames = await fs.readdir(__dirname);
        fileNames.splice(fileNames.indexOf("index.js"), 1);

        const modules = [];

        each(fileNames, (name) => {
          /* eslint-disable global-require */
          /* eslint-disable import/no-dynamic-require */
          const Module = require(`${__dirname}/${name}`)(bot);

          modules.push(Module);
        });

        return resolve(modules);
      } catch (err) {
        return reject(err);
      }
    });
  };

  this.processor = this.loadUtils();
};
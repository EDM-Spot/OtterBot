global.Promise = require("bluebird");

const fs = Promise.promisifyAll(require("fs-extra"));
const gulp = require("gulp");

const gulpfile = require("../../gulpfile.js");

const { Op } = require("sequelize");

module.exports = function Util(bot) {
  const util = {
    name: "generateBadges",
    function: async () => {
      const template = await fs.readFile(__dirname + "/../data/badge-template.scss", "utf8");
      const users = await bot.db.models.users.findAll({ where: { badge: { [Op.not]: null } }, attributes: ["id", "badge"] });

      for (const user of users) {
        const idMap = user.map(instance => instance.get("id"));
        const badgesMap = user.map(instance => instance.get("badge"));

        const formatID = idMap.map(id => `.id-${id}`);
        const formatBadge = badgesMap.map(badge => `https://edmspot.tk/public/images/badges/${badge}`);

        const setTemplate = template
          .replace(/\t/g, "")
          .replace(/.id-USERID/g, formatID)
          .replace(/%%BADGE%%/g, formatBadge);

        await fs.outputFile(__dirname + `/../../dashboard/public/css/${user.get("id")}.scss`, setTemplate);
      }

      // build scss and minify it
      gulp.task("default", gulpfile.scss);
      gulp.task("default")();

      return template;
    },
  };

  bot.utils.register(util);
};
global.Promise = require("bluebird");

const fs = Promise.promisifyAll(require("fs-extra"));
const gulp = require("gulp");

const gulpfile = require("../../gulpfile.js");

const { Op } = require("sequelize");

module.exports = function Util(bot) {
  const util = {
    name: "generateBadges",
    function: async () => {
      let template = await fs.readFile(__dirname + "/../data/badge-template.scss", "utf8");
      let badges = await bot.db.models.users.findAll({ where: { badge: { [Op.not]: null } }, attributes: ["id", "badge"] });

      //const idMap = badges.map(instance => instance.get("id"));
      //const badgesMap = badges.map(instance => instance.get("badge"));

      //const formatID = idMap.map(id => `.id-${id}`).join(", ");
      //const formatBadge = badgesMap.map(badge => `https://edmspot.tk/public/images/badges/${badge}`).join(", ");

      badges = badges.map(instance => instance.get("id"));

      const format1 = badges.map(id => `.id-${id}`).join(", ");

      template = template
        .replace(/\t/g, "")
        .replace(/.id-USERID/g, format1)
        .replace(/%%BADGE%%/g, format1);

      await fs.outputFile(__dirname + "/../../dashboard/public/css/badges.scss", template);

      // build scss and minify it
      gulp.task("default", gulpfile.scss);
      gulp.task("default")();

      return template;
    },
  };

  bot.utils.register(util);
};
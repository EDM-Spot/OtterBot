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

      let completeFile = null;

      for (const user of users) {
        console.log(user);
        const id = user.get("id");
        const badge = user.get("badge");

        const setTemplate = template
          .replace(/\t/g, "")
          .replace(/.id-USERID/g, `.id-${id}`)
          .replace(/%%BADGE%%/g, `https://edmspot.tk/public/images/badges/${badge}`);

        console.log(setTemplate);
        completeFile += setTemplate;
      }

      console.log(completeFile);

      await fs.outputFile(__dirname + "/../../dashboard/public/css/badges.scss", completeFile);

      // build scss and minify it
      gulp.task("default", gulpfile.scss);
      gulp.task("default")();

      return template;
    },
  };

  bot.utils.register(util);
};
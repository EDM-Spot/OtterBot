global.Promise = require("bluebird");

const fs = Promise.promisifyAll(require("fs-extra"));
const gulp = require("gulp");

const gulpfile = require("../../gulpfile.js");

const mergeImg = require("merge-img");
const { isNil } = require("lodash");
const { Op } = require("sequelize");

module.exports = function Util(bot) {
  class GenerateCSS {
    constructor() {

    }
    async generateBadges() {
      const template = await fs.readFile(__dirname + "/../data/badge-template.scss", "utf8");
      const users = await bot.db.models.users.findAll({ where: { badge: { [Op.not]: null } }, attributes: ["id", "badge"] });

      let completeFile = "";

      for (const user of users) {
        const id = user.get("id");
        const badge = user.get("badge");

        const setTemplate = template
          .replace(/\t/g, "")
          .replace(/.id-USERID/g, `.id-${id}`)
          .replace(/%%BADGE%%/g, `https://edmspot.ml/public/images/badges/${badge}`);

        completeFile += setTemplate;
      }

      await fs.outputFile(__dirname + "/../../dashboard/public/css/badges.scss", completeFile);

      // build scss and minify it
      gulp.task("default", gulpfile.scss);
      gulp.task("default")();

      return template;
    }

    async generateProducers() {
      const template = await fs.readFile(__dirname + "/../data/producer-template.scss", "utf8");
      const users = await bot.db.models.users.findAll({ where: { producer: { [Op.eq]: true } }, attributes: ["id", "producer"] });

      let completeFile = "";

      for (const user of users) {
        const id = user.get("id");

        const setTemplate = template
          .replace(/\t/g, "")
          .replace(/.id-USERID/g, `.id-${id}`);

        completeFile += setTemplate;
      }

      await fs.outputFile(__dirname + "/../../dashboard/public/css/producers.scss", completeFile);

      // build scss and minify it
      gulp.task("default", gulpfile.scss);
      gulp.task("default")();

      return template;
    }

    async generateIcons() {
      const template = await fs.readFile(__dirname + "/../data/icon-template.scss", "utf8");

      const xmas2018 = [13585808, 4093788, 4473380, 34187258, 23408147, 4070111, 8203880, 21703169, 5220843, 4866676, 4890141, 3788262, 4734845, 5859330, 17379609, 5418139, 5264274, 12758208];

      const users = await bot.db.models.users.findAll({ attributes: ["id", "discord", "producer"] });

      let completeFile = "";

      for (const user of users) {
        const id = user.get("id");
        const discord = user.get("discord");
        const producer = user.get("producer");

        let padding = 0;
        let count = 0;

        if (!isNil(discord) || xmas2018.includes(id) || (!isNil(producer) && producer)) {
          const iconList = [];
          let content = "";

          if (!isNil(producer) && producer) {
            iconList.push(__dirname + "/../../dashboard/public/images/icons/producer.png");
            content = "Verified Producer";

            count++;
          }

          if (!isNil(discord)) {
            iconList.push(__dirname + "/../../dashboard/public/images/icons/discord.png");

            if ((!isNil(producer) && producer)) {
              content += " \\A Discord Linked";
            } else {
              content = "Discord Linked";
            }

            count++;
          }

          if (xmas2018.includes(id)) {
            iconList.push(__dirname + "/../../dashboard/public/images/events/xmas2018.png");

            if ((!isNil(producer) && producer) || !isNil(discord)) {
              content += " \\A Christmas Event 2018";
            } else {
              content = "Christmas Event 2018";
            }

            count++;
          }

          await mergeImg(iconList, {offset: 4}).then(async (img) => {
            await img.write(__dirname + `/../../dashboard/public/images/icons/${id}.png`);
          });

          await mergeImg(iconList, {direction: true}).then(async (img) => {
            await img.write(__dirname + `/../../dashboard/public/images/icons/${id}V.png`);
          });

          padding = 19 * count;

          if (count > 1) {
            padding = padding + (4 * (count - 1));
          }

          const setTemplate = template
            .replace(/\t/g, "")
            .replace(/.id-USERID/g, `.id-${id}`)
            .replace(/%%USERID%%/g, `${id}`)
            .replace(/%%ICONS%%/g, `https://edmspot.ml/public/images/icons/${id}.png`)
            .replace(/%%ICONSV%%/g, `https://edmspot.ml/public/images/icons/${id}V.png`)
            .replace(/.id-USERID/g, `.id-${id}`)
            .replace(/%%CONTENT%%/g, `${content}`)
            .replace(/%%PADDINGL%%/g, `${padding}px`);

          completeFile += setTemplate;
        }
      }

      await fs.outputFile(__dirname + "/../../dashboard/public/css/icons.scss", completeFile);

      // build scss and minify it
      gulp.task("default", gulpfile.scss);
      gulp.task("default")();

      return template;
    }
  }

  bot.generateCSS = new GenerateCSS();
};
const { isNil } = require("lodash");
const download = require("image-downloader");

module.exports = function Util(bot) {
  class API {
    constructor() {

    }
    async saveImage(id, options, type, free) {
      if (isNil(options)) {
        return;
      }

      download.image(options).then(async ({ filename, image }) => {
        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });
        console.log(filename);

        if (free === "false") {
          //await inst.decrement("props", { by: 100 });
          console.log("IT WAS FREE");
        }

        await bot.db.models.users.update(
          { badge: `${id}.${type}` },
          { where: { id: id }, defaults: { id: id }}
        );

        await bot.plug.sendChat("Thanks for the purchase.");

        await bot.utils.generateBadges();
      }).catch((err) => {
        console.warn(err);
      });

      return true;
    }
  }

  bot.shop = new API();
};
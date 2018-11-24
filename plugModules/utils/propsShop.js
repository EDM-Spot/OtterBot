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

      download.image(options).then(async ({ filename, image }) => { // eslint-disable-line no-unused-vars
        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });
        console.log(free);
        
        if (free === "false") {
          await inst.decrement("props", { by: 100 });
          console.log("-100 Props");
        }

        await bot.db.models.users.update(
          { badge: `${id}.${type}` },
          { where: { id: id }, defaults: { id: id }}
        );

        await bot.plug.sendChat("Thanks for your Badge purchase!");

        await bot.utils.generateBadges();
      }).catch((err) => {
        console.warn(err);
      });

      return true;
    }
  }

  bot.shop = new API();
};
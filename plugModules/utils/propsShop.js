const { isNil } = require("lodash");
const download = require("image-downloader");

module.exports = function Util(bot) {
  class PropsShop {
    constructor() {

    }
    async saveImage(id, options, type, free, event = false, giftID = null) {
      if (isNil(options)) {
        return;
      }

      const user = bot.plug.user(giftID);
      if (await bot.utils.getRole(user) === 5000) {
        console.log("5000");
        free = true;
      }

      download.image(options).then(async ({ filename, image }) => { // eslint-disable-line no-unused-vars
        if (!free) {
          if (isNil(giftID)) {
            const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });
            console.log(free);

            await inst.decrement("props", { by: 100 });
            await bot.db.models.users.increment("props", { by: 100, where: { id: "40333310" } });
            console.log("-100 Props");
          } else {
            const [buyer] = await bot.db.models.users.findOrCreate({ where: { giftID }, defaults: { giftID } });

            await buyer.decrement("props", { by: 100 });
            await bot.db.models.users.increment("props", { by: 100, where: { id: "40333310" } });
            console.log("GIFT -100 Props");
          }
        }

        if (event) {
          const [eventUser] = await bot.db.models.holiday.findOrCreate({ where: { id }, defaults: { id } });   
          await eventUser.decrement("currency", { by: 1200 });
        }

        await bot.db.models.users.update(
          { badge: `${id}.${type}` },
          { where: { id: id }, defaults: { id: id }}
        );

        bot.plug.chat("Thanks for your Badge purchase!");

        await bot.generateCSS.generateBadges();
      }).catch((err) => {
        console.warn(err);
      });

      return true;
    }
  }

  bot.shop = new PropsShop();
};
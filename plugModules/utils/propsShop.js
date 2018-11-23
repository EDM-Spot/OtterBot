const { isNil } = require("lodash");
const { ROOM_ROLE } = require("plugapi");
const probe = require("probe-image-size");
const download = require("image-downloader");

module.exports = function Util(bot) {
  class API {
    constructor() {

    }
    async saveImage(id, url) {
      const user = bot.plug.getUser(id);

      if (isNil(url)) {
        return;
      }

      probe(url).then(async result => {
        const type = result.type;
        const width = result.width;
        const height = result.height;

        if (width != 65 ||height != 65) {
          return await bot.plug.sendChat("Badge should be 65x65");
        }

        if (type != "jpg" && type != "jpeg" && type != "png" && type != "gif") {
          return await bot.plug.sendChat("Image not recognized");
        }

        if (type === "gif" && user.role < ROOM_ROLE.RESIDENTDJ) {
          return await bot.plug.sendChat("Only RDJ+ can have gifs");
        }

        const options = {
          url: url,
          dest: `./dashboard/public/images/badges/${id}.${type}`
        };

        download.image(options).then(async ({ filename, image }) => {
          const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });
          console.log(filename);

          //await inst.decrement("props", { by: 100 });

          await bot.db.models.users.update(
            { badge: `${id}.${type}` },
            { where: { id: id }, defaults: { id: id }}
          );

          await bot.utils.generateBadges();
        }).catch((err) => {
          console.warn(err);
        });
      });

      return true;
    }
  }

  bot.shop = new API();
};
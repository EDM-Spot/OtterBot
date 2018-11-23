const { isNil } = require("lodash");
const { ROOM_ROLE } = require("plugapi");
const probe = require("probe-image-size");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["buy", "shop"],
    minimumPermission: 5000,
    cooldownType: "perUser",
    cooldownDuration: 1,
    deleteInstantly: true,
    parameters: "[badge <Image>]",
    description: "Props Shop",
    async execute(rawData, { args }, lang) {
      const { id } = rawData.from;

      const buyType = args[0];
      const url = args[1];

      console.log(url);

      if (isNil(buyType) || isNil(url)) {
        return false;
      }

      if (args.length && buyType === "badge") {
        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

        const props = inst.get("props");
        const badge = inst.get("badge");

        if (props < 100) {
          this.reply(lang.join.noProps, {}, 6e4);
          return true;
        }

        probe(url).then(async result => {
          let free = false;
          const type = result.type;
          const width = result.width;
          const height = result.height;
  
          if (width != 65 ||height != 65) {
            await bot.plug.sendChat("Badge should be 65x65");
            return false;
          }
  
          if (type != "jpg" && type != "jpeg" && type != "png" && type != "gif") {
            await bot.plug.sendChat("Image not recognized");
            return false;
          }
  
          if (type === "gif" && rawData.from.role < ROOM_ROLE.RESIDENTDJ) {
            await bot.plug.sendChat("Only RDJ+ can have gifs");
            return false;
          }

          if (isNil(badge) && rawData.from.role >= ROOM_ROLE.BOUNCER) {
            free = true;
          }
  
          const options = {
            url: url,
            dest: `./dashboard/public/images/badges/${id}.${type}`
          };

          await bot.shop.saveImage(id, options, type, free);
        });

        return true;
      }

      return false;
    },
  });
};
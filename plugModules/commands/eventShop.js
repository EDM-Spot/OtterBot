const { isNil } = require("lodash");
const { ROLE } = require("miniplug");
const probe = require("probe-image-size");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["eventbuy", "eventshop"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    deleteInstantly: true,
    parameters: "[badge <Image>] || [icon] || [move]",
    description: "Event Shop",
    async execute(rawData, { args }, lang) {
      //NEEDS MINIPLUG
      return;
      
      const { id } = rawData.from;

      if (rawData.from.role >= ROOM_ROLE.BOUNCER) {
        return false;
      }

      const buyType = args[0];
      const url = args[1];

      if (isNil(buyType)) {
        return false;
      }

      const [eventUser] = await bot.db.models.holiday.findOrCreate({ where: { id }, defaults: { id } });

      if (isNil(eventUser)) return false;

      const currency = eventUser.get("currency");

      if (args.length && buyType === "badge") {
        if (isNil(url)) {
          return false;
        }

        probe(url).then(async result => {
          const type = result.type;
          const width = result.width;
          const height = result.height;

          console.log(result);
  
          if (width != 65 || height != 65) {
            this.reply(lang.eventShop.imageSize, {}, 6e4);
            return false;
          }
  
          if (type != "jpg" && type != "jpeg" && type != "png" && type != "gif") {
            this.reply(lang.eventShop.imageType, {}, 6e4);
            return false;
          }
  
          if (type === "gif" && rawData.from.role < ROOM_ROLE.RESIDENTDJ) {
            this.reply(lang.eventShop.imageRDJ, {}, 6e4);
            return false;
          }

          if (currency < 1200) {
            this.reply(lang.eventShop.noCandies, {}, 6e4);
            return true;
          }
  
          const options = {
            url: url,
            dest: `./dashboard/public/images/badges/${id}.${type}`
          };

          await bot.shop.saveImage(id, options, type, true, true);
        });

        return true;
      }

      if (args.length && buyType === "icon") {
        if (currency < 1500) {
          this.reply(lang.eventShop.noCandies, {}, 6e4);
          return true;
        }

        await eventUser.decrement("currency", { by: 1500 });

        const embed = new Discord.MessageEmbed()
          .setColor(0xFF00FF)
          .setFooter("By " + rawData.from.username)
          .setTimestamp()
          .addField("ID", rawData.from.id, true)
          .addField("EVENT", "Bought Icon", false);
  
        bot.channels.get("486598639691497474").send({embed});

        await bot.plug.sendChat("Thanks for your Icon purchase!");

        return true;
      }

      if (args.length && buyType === "move") {
        if (currency < 200) {
          this.reply(lang.eventShop.noCandies, {}, 6e4);
          return true;
        }

        await eventUser.decrement("currency", { by: 200 });

        const user = await bot.plug.getUser(id);
        const position = bot.plug.getWaitListPosition(id);

        if (position >= 5) {
          bot.queue.add(user, position - 5);
        }

        await bot.plug.sendChat("Thanks for your Move purchase!");

        return true;
      }

      return false;
    },
  });
};
const { isNil, isObject } = require("lodash");
const { ROOM_ROLE } = require("plugapi");
const probe = require("probe-image-size");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["buy", "shop"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    deleteInstantly: true,
    parameters: "[badge <Image>]",
    description: "Props Shop",
    async execute(rawData, { args, name }, lang) {
      const { id } = rawData.from;

      const buyType = args[0];
      let url = args[1];

      if (isNil(buyType) || isNil(url)) {
        return false;
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////USER SHOP
      if (args.length && buyType === "badge") {
        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

        const props = inst.get("props");
        const badge = inst.get("badge");

        probe(url).then(async result => {
          let free = false;
          const type = result.type;
          const width = result.width;
          const height = result.height;

          console.log(rawData.from.username);
          console.log(result);
  
          if (width != 65 || height != 65) {
            this.reply(lang.propsShop.imageSize, {}, 6e4);
            return false;
          }
  
          if (type != "jpg" && type != "jpeg" && type != "png" && type != "gif") {
            this.reply(lang.propsShop.imageType, {}, 6e4);
            return false;
          }
  
          if (type === "gif" && rawData.from.role < ROOM_ROLE.RESIDENTDJ) {
            this.reply(lang.propsShop.imageRDJ, {}, 6e4);
            return false;
          }

          if (isNil(badge) && rawData.from.role >= ROOM_ROLE.BOUNCER) {
            free = true;
          } else {
            if (props < 100) {
              this.reply(lang.propsShop.noProps, {}, 6e4);
              return true;
            }
          }
  
          const options = {
            url: url,
            dest: `./dashboard/public/images/badges/${id}.${type}`
          };

          await bot.shop.saveImage(id, options, type, free);
        });

        return true;
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////GIFT SHOP
      if (args.length && buyType === "gift") {
        const buyGift = args[1];
        url = args[2];

        if (isNil(buyGift) || isNil(url)) {
          return false;
        }

        if (buyGift === "badge") {
          const userMention = rawData.mentions[0];

          if (!isObject(userMention)) {
            this.reply(lang.userNotFound, {}, 6e4);
            return false;
          }

          const user = bot.plug.getUser(userMention.id);
      
          if (!isObject(user)) {
            this.reply(lang.userNotFound, {}, 6e4);
            return false;
          } else if (user.id === rawData.from.id) {
            this.reply(lang.moderation.onSelf, { command: `!${name}` }, 6e4);
            return false;
          }
      
          const [inst] = await bot.db.models.users.findOrCreate({ where: { id: user.id }, defaults: { id: user.id } });
  
          const badge = inst.get("badge");

          if (!isNil(badge)) {
            return false;
          }
  
          probe(url).then(async result => {
            const type = result.type;
            const width = result.width;
            const height = result.height;
  
            console.log(result);
    
            if (width != 65 || height != 65) {
              this.reply(lang.propsShop.imageSize, {}, 6e4);
              return false;
            }
    
            if (type != "jpg" && type != "jpeg" && type != "png" && type != "gif") {
              this.reply(lang.propsShop.imageType, {}, 6e4);
              return false;
            }
    
            if (type === "gif" && user.role < ROOM_ROLE.RESIDENTDJ) {
              this.reply(lang.propsShop.imageRDJ, {}, 6e4);
              return false;
            }

            const [buyer] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });
  
            const props = buyer.get("props");
  
            if (props < 100) {
              this.reply(lang.propsShop.noProps, {}, 6e4);
              return true;
            }
    
            const options = {
              url: url,
              dest: `./dashboard/public/images/badges/${user.id}.${type}`
            };
  
            await bot.shop.saveImage(user.id, options, type, false);
          });
  
          return true;
        }
      }

      return false;
    },
  });
};
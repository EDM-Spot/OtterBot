const { isNil, isObject } = require("lodash");
const { ROLE } = require("miniplug");
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
    async execute(rawData, { args, name, mentions }, lang) {
      const id = rawData.uid;

      const buyType = args[0];
      let url = args[1];

      if (isNil(buyType) || isNil(url)) {
        return false;
      }

      ///////////////////////////////////////////////////////////////////////////////////////////////USER SHOP
      if (args.length && buyType === "badge") {
        const [inst] = await bot.db.models.users.findOrCreate({ where: { id: id }, defaults: { id: id } });

        const props = inst.get("props");
        const badge = inst.get("badge");

        probe(url).then(async result => {
          let free = false;
          const type = result.type;
          const width = result.width;
          const height = result.height;

          console.log(rawData.un);
          console.log(result);
  
          if (width != 65 || height != 65) {
            this.reply(lang.propsShop.imageSize, {}, 6e4);
            return false;
          }
  
          if (type != "jpg" && type != "jpeg" && type != "png" && type != "gif") {
            this.reply(lang.propsShop.imageType, {}, 6e4);
            return false;
          }
  
          if (type === "gif" && await bot.utils.getRole(await rawData.getUser()) < ROLE.DJ) {
            this.reply(lang.propsShop.imageRDJ, {}, 6e4);
            return false;
          }

          if (isNil(badge) && await bot.utils.getRole(await rawData.getUser()) >= ROLE.BOUNCER) {
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
          const userMention = mentions[0];

          if (!mentions.length || mentions.length >= 2) {
            this.reply(lang.invalidUser, {}, 6e4);
            return false;
          }

          if (!isObject(userMention)) {	
            this.reply(lang.userNotFound, {}, 6e4);	
            return false;	
          }	

          const user = bot.plug.user(userMention.id);
      
          if (!isObject(user)) {
            this.reply(lang.userNotFound, {}, 6e4);
            return false;
          } else if (user.id === rawData.uid) {
            this.reply(lang.moderation.onSelf, { command: `!${name}` }, 6e4);
            return false;
          }
      
          //const [inst] = await bot.db.models.users.findOrCreate({ where: { id: user.id }, defaults: { id: user.id } });
  
          //const badge = inst.get("badge");

          //if (!isNil(badge)) {
          //return false;
          //}
  
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
    
            if (type === "gif" && user.role < ROLE.DJ) {
              this.reply(lang.propsShop.imageRDJ, {}, 6e4);
              return false;
            }

            const [buyer] = await bot.db.models.users.findOrCreate({ where: { id: id }, defaults: { id: id } });

            console.log(buyer);
  
            const props = buyer.get("props");
            const buyerID = buyer.get("id");

            console.log(buyerID);
            console.log("&&&&&&&&&&&&&&&&&&&&&");
  
            if (props < 100) {
              this.reply(lang.propsShop.noProps, {}, 6e4);
              return true;
            }
    
            const options = {
              url: url,
              dest: `./dashboard/public/images/badges/${user.id}.${type}`
            };
  
            await bot.shop.saveImage(user.id, options, type, false, id);
          });
  
          return true;
        }
      }

      return false;
    },
  });
};
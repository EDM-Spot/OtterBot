const { isObject, isNil } = require("lodash");
const { ROOM_ROLE, GLOBAL_ROLES } = require("plugapi");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["give"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    parameters: "<@username>",
    description: "Gives your positions in the waitlist.",
    async execute(rawData, { args, name }, lang) { // eslint-disable-line no-unused-vars
      if (!rawData.mentions.length || rawData.mentions.length >= 2) {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const user = rawData.mentions[0];

      if (!isObject(user)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      } else if (user.id === rawData.raw.uid) {
        this.reply(lang.moderation.onSelf, { command: `!${name}` }, 6e4);
        return false;
      }

      const userPosition = bot.plug.getWaitListPosition(rawData.raw.id);
      const toUserPosition = bot.plug.getWaitListPosition(user.id);

      if (userPosition < 1 && toUserPosition < 1) {
        this.reply(lang.give.notInList, {}, 6e4);
        return false;
      }

      if (userPosition > toUserPosition) {
        this.reply(lang.give.behindPosition, {}, 6e4);
        return false;
      }

      const userGiving = await bot.redis.findGivePosition(rawData.raw.id);
      const userHaveGives = await bot.redis.findGivePosition(user.id);

      if (isNil(latestDisconnection) || position < latestDisconnection) {
        await bot.redis.registerGivePosition(rawData.raw.id, user.id, userPosition);
      }

      this.reply(lang.give.isGiving, {
        user: rawData.raw.un,
        toUser: user.username,
        position: userPosition,
      });
      return true;
    },
  });
};
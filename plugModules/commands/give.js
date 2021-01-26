const { isObject, isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["give"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 180,
    parameters: "<@username>",
    description: "Gives your positions in the waitlist.",
    async execute(rawData, { mentions }, lang) { // eslint-disable-line no-unused-vars
      if (!mentions.length || mentions.length >= 2) {
        this.reply(lang.invalidUser, {});
        return false;
      }

      const user = mentions[0];

      if (!isObject(user)) {
        this.reply(lang.userNotFound, {});
        return false;
      } else if (user.id === rawData.uid) {
        return false;
      }

      const userPosition = bot.plug.waitlist().positionOf(rawData.uid) + 1;
      const toUserPosition = bot.plug.waitlist().positionOf(user.id) + 1;

      if (userPosition < 1 || toUserPosition < 1) {
        this.reply(lang.give.notInList, {});
        return false;
      }

      if (userPosition > toUserPosition) {
        this.reply(lang.give.behindPosition, {});
        return false;
      }

      const userGiving = await bot.redis.findGivePosition(rawData.uid);
      const userHaveGives = await bot.redis.findGivePositionTo(user.id);

      if (!isNil(userGiving) || !isNil(userHaveGives)) {
        await bot.redis.removeGivePosition(rawData.uid, user.id);

        //this.reply(lang.give.cantGiveAgain, {});
        //return false;
      }

      await bot.redis.registerGivePosition(rawData.uid, user.id, userPosition);
      this.reply(lang.give.isGiving, {
        toUser: user.username,
        position: userPosition,
      });
      return true;
    },
  });
};
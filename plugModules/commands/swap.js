const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["swap"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "<@username @username>",
    description: "Swap users position.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      if (!rawData.mentions.length || rawData.mentions.length !== 2) {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const user = rawData.mentions[0];
      const user2 = rawData.mentions[1];

      if (!isObject(user) || !isObject(user2)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      }

      const userPosition = bot.plug.getWaitListPosition(user.id);
      const user2Position = bot.plug.getWaitListPosition(user2.id);

      if (userPosition < 1 || user2Position < 1) {
        this.reply(lang.give.notInList, {}, 6e4);
        return false;
      }
      
      bot.queue.add(user, user2Position);
      await bot.wait(1000);
      bot.queue.add(user2, userPosition);
      return true;
    },
  });
};
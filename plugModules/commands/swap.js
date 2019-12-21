const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["swap"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "<@username> <@username>",
    description: "Swap users position.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      console.log(args);
      console.log(args.join(" ").substr(1));
      console.log(args.join(" ").substr(2));
      if (!args.length || args.join(" ").substr(1).charAt(0) !== "@" || args.join(" ").substr(2).charAt(0) !== "@") {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const user = bot.plug.userByName(args.join(" ").substr(1).trim());
      const user2 = bot.plug.userByName(args.join(" ").substr(2).trim());

      if (!isObject(user) || !isObject(user2)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      }

      const userPosition = bot.plug.waitlist().positionOf(user.id) + 1;
      const user2Position = bot.plug.waitlist().positionOf(user2.id) + 1;

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
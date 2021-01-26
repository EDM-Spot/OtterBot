const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["cookie", "cookies"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 240,
    parameters: "<@username>",
    description: "Sends the specified user a cookie.",
    async execute(rawData, { mentions }, lang) {
      if (!mentions.length || mentions.length >= 2) {
        this.reply(bot.lang.commands.invalidUser, {});
        return false;
      }

      const user = mentions[0];

      if (!isObject(user)) {
        this.reply(lang.userNotFound, {});
        return false;
      }

      const randomCookie = Math.floor(Math.random() * lang.cookie.length);

      this.reply(lang.cookie[randomCookie], { receiver: user, sender: rawData.un });
      return true;
    },
  });
};
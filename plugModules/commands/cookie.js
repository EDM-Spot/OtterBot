const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["cookie", "cookies"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 240,
    parameters: "<@username>",
    description: "Sends the specified user a cookie.",
    async execute(rawData, { args }, lang) {
      if (!args.length || args.join(" ").charAt(0) !== "@") {
        this.reply(bot.lang.commands.invalidUser, {}, 6e4);
        return false;
      }

      const username = args.join(" ").substr(1);
      const users = bot.plug.users();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
				users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

      if (!isObject(user)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      }

      const randomCookie = Math.floor(Math.random() * lang.cookie.length);

      this.reply(lang.cookie[randomCookie], { receiver: user, sender: rawData.un }, 6e4);
      return true;
    },
  });
};
const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["faq", "pi"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "[@username]",
    description: "Sends the faq Link.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const username = args.join(" ").substr(1);
      const users = bot.plug.users();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
				users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

      this.reply(lang.faq, { mention: user || "" });
      return true;
    },
  });
};
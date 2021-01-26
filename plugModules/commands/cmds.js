const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["commands", "cmds"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 120,
    parameters: "[@username]",
    description: "Links to this page.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const username = args.join(" ").substr(1);
      const users = bot.plug.users();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
				users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

      let mention = "";

      if (!isNil(user)) {
        mention = `@${user}`;
      }

      this.reply(lang.commands, { mention });
      return true;
    },
  });
};
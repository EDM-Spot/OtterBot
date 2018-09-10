module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["propsinfo", "pi"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "[@username]",
    description: "Explains what props are.",
    async execute(rawData, { args }, lang) {
      const username = args.join(" ").substr(1);
      const users = bot.plug.getUsers();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
				users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

      this.reply(lang.propsInfo, { mention: user || "" }, 6e4);
      return true;
    },
  });
};
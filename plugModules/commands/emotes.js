module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["emotes"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 600,
    parameters: "",
    description: "Lists emotes available to use on Plug.dj",
    async execute(rawData, { name }, lang) { // eslint-disable-line no-unused-vars
      this.reply(lang.emotes[name], {}, 3e4);
      return true;
    },
  });
};

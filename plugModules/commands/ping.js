module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["ping"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 10,
    parameters: "",
    description: "Pong!",
    async execute(rawData, { name }, lang) {
      this.reply(lang.ping[name], {}, 3e4);
      return true;
    },
  });
};
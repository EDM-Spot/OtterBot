module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["meh"],
    minimumPermission: 1000,
    cooldownType: "perUse",
    cooldownDuration: 20,
    parameters: "",
    description: "Shows the Mehs needed to skip a song",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const usersCount = bot.plug.getUsers().length;

      const mehRule = Math.round((usersCount/100)*8);
      const hsMehRule = Math.round((usersCount/100)*5);

      this.reply(lang.mehRule, {
        mehs: mehRule,
        hsMehs: hsMehRule,
      }, 6e4);
      return true;
    },
  });
};
module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["myid"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    parameters: "",
    description: "Check user ID.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const id = rawData.from.id;

      this.reply(lang.myID, { id }, 6e4);
      return true;
    },
  });
};
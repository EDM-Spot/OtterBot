module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["myid"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    parameters: "",
    description: "Check user ID.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const id = rawData.uid;

      this.reply(lang.myID, { id });
      return true;
    },
  });
};
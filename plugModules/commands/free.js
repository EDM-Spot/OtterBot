module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["free"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 86400,
    parameters: "",
    description: "Daily Props.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      await bot.db.models.users.increment("props", { by: 2, where: { id: rawData.uid } });

      bot.plug.chat("You got your daily 2 props. Come back tomorrow for more free props!");

      return true;
    },
  });
};

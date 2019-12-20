module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["free"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 86400,
    parameters: "",
    description: "XMas Daily Props.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      await bot.db.models.users.increment("props", { by: 10, where: { id: rawData.uid } });

      bot.plug.chat(bot.utils.replace(":christmasballs1: Merry Christmas! Come back tomorrow for more free props! :christmasballs1:", {})).delay(6e4).call("delete");

      return true;
    },
  });
};

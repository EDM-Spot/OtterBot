const moment = require("moment");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["free"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 86400,
    parameters: "",
    description: "Daily Props.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const isDecember = (moment().month() === 11);

      let props = 2;

      if (isDecember) {
        props = 10;

        bot.plug.chat(":christmasballs1: Merry Christmas! You got your daily 10 props. Come back tomorrow for more free props! :christmasballs1:");
      } else {
        bot.plug.chat("You got your daily 2 props. Come back tomorrow for more free props!");
      }

      await bot.db.models.users.increment("props", { by: props, where: { id: rawData.uid } });

      return true;
    },
  });
};

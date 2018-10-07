const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["sodas"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    parameters: "",
    description: "Get a Random Joke.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const sodas = await bot.api.getSodas(rawData.from.username);

      if (isNil(sodas)) return false;

      this.reply(lang.sodas, { sodas: sodas.value.joke });
      return true;
    },
  });
};
const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["catfact", "catfacts"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 240,
    parameters: "",
    description: "Get a Random Catfact.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const catFact = await bot.api.getCatfact();

      if (isNil(catFact)) return false;

      this.reply(lang.catfact, { catfact: catFact.fact });
      return true;
    },
  });
};
const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["urban"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 240,
    parameters: "<Text>",
    description: "Urban Dictionary.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      if (!args.length) return;

      const text = args.join(" ");

      const urban = bot.api.getUrban(text);

      if (isNil(urban)) return false;
      if (isNil(urban.list[0])) return false;

      this.reply(lang.urban, { text: urban.list[0].definition });
      return true;
    },
  });
};
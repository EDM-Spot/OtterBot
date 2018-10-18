const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["urban"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    parameters: "<Text>",
    description: "Urban Dictionary.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      if (!rawData.args.length) return;

      const text = rawData.args.join(" ");

      const urban = await bot.api.getUrban(text);

      if (isNil(urban)) return false;
      if (isNil(urban.list[0])) return false;

      this.reply(lang.urban, { text: urban.list[0].definition });
      return true;
    },
  });
};
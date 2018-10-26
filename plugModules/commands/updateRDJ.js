const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["rdjranks"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 1,
    parameters: "<id>",
    description: "Update RDJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      if (!rawData.args.length) return;

      const id = rawData.args.join(" ");

      bot.utils.updateRDJ(id);
      return true;
    },
  });
};
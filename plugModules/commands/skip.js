const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["skip", "s"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 3,
    parameters: "",
    description: "Force skips the current DJ.",
    async execute(rawData, { name }, lang) {
      const currentMedia = bot.plug.getMedia();
      const dj = bot.plug.getDJ();

      if (isObject(currentMedia) && isObject(dj)) {
        await bot.plug.moderateForceSkip();
        this.reply(lang.moderation.effective, {
          mod: rawData.raw.un,
          command: `!${name}`,
          user: dj.username,
        }, 6e4);
        return true;
      }

      return false;
    },
  });
};
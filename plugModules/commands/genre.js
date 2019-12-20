const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["genre"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "",
    description: "Check song genre.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const currentMedia = bot.plug.historyEntry();

      const genres = await bot.api.getGenre(currentMedia.media);

      if (isNil(genres)) return false;

      this.reply(lang.genre, { genres: genres });
      return true;
    },
  });
};
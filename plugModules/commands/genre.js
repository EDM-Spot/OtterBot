module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["genre"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 60,
    parameters: "Text",
    description: "Check song genre.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const currentMedia = bot.plug.getMedia();

      const genres = await bot.api.getGenre(currentMedia);

      this.reply(lang.genre, { genres: genres });
      return true;
    },
  });
};
const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["gif"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 180,
    parameters: "<Text>",
    description: "Random Gif.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      if (!rawData.args.length) return;

      const text = rawData.args.join(" ");

      const gif = await bot.api.getGiphy(text);
      var randomNumb = Math.floor(Math.random() * 10) + 0;

      if (isNil(gif)) return false;

      if (gif.data.length < 10) {
        randomNumb = Math.floor(Math.random() * gif.data.length) + 0;
      }

      this.reply(lang.gif, { url: gif.data[randomNumb].images.downsized.url });
      return true;
    },
  });
};
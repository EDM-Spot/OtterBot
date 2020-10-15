const { isNil } = require("lodash");
const request = require("request-promise");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["gif"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 240,
    parameters: "<Text>",
    description: "Random Gif.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      if (!args.length) return;

      const text = args.join(" ");

      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      const gif = await request(`https://api.giphy.com/v1/gifs/search?api_key=${bot.config.giphy}&q=${text}&limit=10&offset=0&rating=G&lang=en`, options).then(body => body).catch((err) => {
        console.warn("[!] Giphy API Error");
        //console.error(err);
      });

      var randomNumb = Math.floor(Math.random() * 10) + 0;

      if (isNil(gif) || gif.data.length < 0) return false;

      if (gif.data.length <= 10) {
        randomNumb = Math.floor(Math.random() * gif.data.length) + 0;
      }

      if (isNil(gif.data[randomNumb])) return false;

      this.reply(lang.gif, { url: gif.data[randomNumb].images.downsized.url });
      return true;
    },
  });
};
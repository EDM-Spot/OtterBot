const { isNil } = require("lodash");
const request = require("request-promise");

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

      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      const urban = await request("https://api.urbandictionary.com/v0/define?term=" + text, options).then(body => body).catch((err) => {
        console.warn("[!] Urban API Error");
        //console.error(err);
      });

      if (isNil(urban)) return false;
      if (isNil(urban.list[0])) return false;

      this.reply(lang.urban, { text: urban.list[0].definition });
      return true;
    },
  });
};
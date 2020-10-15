const { isNil } = require("lodash");
const request = require("request-promise");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["catfact", "catfacts"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 240,
    parameters: "",
    description: "Get a Random Catfact.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };
      
      const catFact = await request("https://catfact.ninja/fact", options).then(body => body).catch((err) => {
        console.warn("[!] Catfact API Error");
        //console.error(err);
      });

      if (isNil(catFact)) return false;

      this.reply(lang.catfact, { catfact: catFact.fact });
      return true;
    },
  });
};
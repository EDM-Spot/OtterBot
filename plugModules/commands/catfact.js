const request = require("request");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["catfact", "catfacts"],
    minimumPermission: 0,
    cooldownType: "perUse",
    cooldownDuration: 0,
    parameters: "",
    description: "Get a Random Catfact.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      request("https://catfact.ninja/fact", function(error, response, body) { // eslint-disable-line no-unused-vars
        const catFact = JSON.parse(response.body);
        console.log(response);
        bot.reply(lang.catfact, { catfact: catFact.fact });
      }).catch(err => {
        console.log(err);
        bot.reply(lang.catfactfail, { });
      });

      return true;
    },
  });
};
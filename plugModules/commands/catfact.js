const request = require("request");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["catfact", "catfacts"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 120,
    parameters: "",
    description: "Get a Random Catfact.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      return;
      let catFact;
      request("https://catfact.ninja/fact", function(error, response, body) { // eslint-disable-line no-unused-vars
        if (error) return false;
      
        catFact = JSON.parse(body);
      });

      this.reply(lang.catfact, { catfact: catFact[0].fact });
      return true;
    },
  });
};
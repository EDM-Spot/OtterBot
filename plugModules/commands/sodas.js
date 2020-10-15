const { isNil } = require("lodash");
const request = require("request-promise");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["sodas"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 240,
    parameters: "",
    description: "Get a Random Joke.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const options = {
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };
      
      const sodas = await request(`https://api.icndb.com/jokes/random?firstName=${rawData.un}&lastName=&escape=javascript`, options).then(body => body).catch((err) => {
        console.warn("[!] Sodas API Error");
        //console.error(err);
      });

      if (isNil(sodas)) return false;

      this.reply(lang.sodas, { sodas: sodas.value.joke });
      return true;
    },
  });
};
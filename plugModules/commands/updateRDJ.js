module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["updaterdj"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Update RDJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const users = await bot.db.models.users.findAll();

      var i = 0;
      var interval = setInterval(function() {
        console.log(users[i].username);
        bot.utils.updateRDJ(users[i].id);
        i++;
        if (i === users.length) clearInterval(interval);
      }, 10000);

      console.log("Finished");

      return true;
    },
  });
};
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

      for (let i = 0; i < users.length; i++) {
        await bot.wait(1000);
        bot.utils.updateRDJ(users[i].id);
      }

      return true;
    },
  });
};
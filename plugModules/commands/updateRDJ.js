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

      for (const user of users) {
        bot.utils.updateRDJ(user.id);
      }

      return true;
    },
  });
};
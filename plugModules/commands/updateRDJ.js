const PromiseQueue = require ("easy-promise-queue");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["updaterdj"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 2,
    parameters: "",
    description: "Update RDJ.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const pq = new PromiseQueue({concurrency: 1});

      const users = await bot.db.models.users.findAll();

      for (const user of users) {
        pq.add(async () => {
          await bot.utils.updateRDJ(user.id);
        });
      }

      console.log("Finished");

      return true;
    },
  });
};
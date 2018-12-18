const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["giveaway"],
    minimumPermission: 4000,
    cooldownType: "perUse",
    cooldownDuration: 180,
    parameters: "<Winners>",
    description: "Giveaway.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      if (!rawData.args.length) return;

      let winners = rawData.args.join(" ");

      await bot.db.models.holiday.update(
        { ticket: true },
        { where: { ticket: false }, defaults: { ticket: false }}
      );

      const playersBD = await bot.db.models.holiday.findAll({
        where: { ticket: true }
      });

      const players = [];

      if (!isNil(playersBD)) {
        for (const player of playersBD) {
          players.add(player.id);
        }
      }

      let i = 1;

      while (winners > 0) {
        const winner = players[Math.floor(Math.random() * players.length)];
        const user = bot.plug.getUser(winner);

        if (!user || typeof user.username !== "string" || !user.username.length) {
          //await bot.plug.sendChat("User Offline! Picking up someone else...");
          console.log("User Offline! Picking up someone else...");

          players.filter(player => player !== winner);
          await bot.wait(5000);
          return;
        }

        //await bot.plug.sendChat("Winner " + i + " - " + user.username);
        console.log("Winner " + i + " - " + user.username);
        
        await bot.wait(5000);

        i++;
        winners--;
      }

      await bot.db.models.holiday.update(
        { ticket: false },
        { where: { ticket: true }, defaults: { ticket: true }}
      );

      return true;
    },
  });
};
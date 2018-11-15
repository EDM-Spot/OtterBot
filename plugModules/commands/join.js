const { isObject } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["join", "enter"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 60,
    deleteInstantly: true,
    parameters: "",
    description: "Joins the roulette, if there is one active. This may also charge the user in props if the roulette had a set price.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const dj = bot.plug.getDJ();

      if (!await bot.roulette.check() && !await bot.russianRoulette.check()) {
        this.reply(lang.join.noRoulette, {}, 6e4);
        return true;
      } else if (isObject(dj) && dj.id === rawData.from.id) {
        this.reply(lang.join.isPlaying, {}, 6e4);
        return true;
      } else if (bot.plug.getWaitListPosition(rawData.from.id) >= 0 && bot.plug.getWaitListPosition(rawData.from.id) <= 5) {
        this.reply(lang.join.closeToPlaying, {}, 6e4);
        return true;
      }

      const { id } = rawData.from;

      if (bot.roulette.running) {
        if (bot.roulette.players.includes(rawData.from.id)) return true;

        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

        const props = inst.get("props");

        if (props < bot.roulette.price) {
          this.reply(lang.join.noProps, {}, 6e4);
          return true;
        }

        await inst.decrement("props", { by: bot.roulette.price });
        bot.roulette.add(rawData.from.id);
        return true;
      }
      else {
        if (bot.russianRoulette.players.includes(rawData.from.id)) return true;

        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

        const props = inst.get("props");

        if (props < bot.russianRoulette.price) {
          this.reply(lang.join.noProps, {}, 6e4);
          return true;
        }

        await inst.decrement("props", { by: bot.russianRoulette.price });
        bot.russianRoulette.add(rawData.from.id);
        return true;
      }
    },
  });
};
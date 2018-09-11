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
    async execute(rawData, command, lang) {
      const dj = bot.plug.getDJ();

      if (!await bot.roulette.check()) {
        this.reply(lang.join.noRoulette, {}, 6e4);
        return true;
      } else if (isObject(dj) && dj.id === rawData.raw.uid) {
        this.reply(lang.join.isPlaying, {}, 6e4);
        return true;
      } else if (bot.plug.getWaitListPosition(rawData.raw.uid) >= 1 && bot.plug.getWaitListPosition(rawData.raw.uid) <= 5) {
        this.reply(lang.join.closeToPlaying, {}, 6e4);
        return true;
      }

      const { uid: id } = rawData.raw;

      if (bot.roulette.players.includes(rawData.raw.uid)) return true;

      const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

      const props = inst.get("props");

      if (props < bot.roulette.price) {
        this.reply(lang.join.noProps, {}, 6e4);
        return true;
      }

      await inst.decrement("props", { by: bot.roulette.price });
      bot.roulette.add(rawData.raw.uid);
      return true;
    },
  });
};
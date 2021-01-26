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
      const dj = bot.plug.dj();
      const waitlist = bot.plug.waitlist();
      
      if (!await bot.roulette.check() && !await bot.russianRoulette.check()) {
        this.reply(lang.join.noRoulette, {});
        return true;
      } else if (isObject(dj) && dj.id === rawData.uid) {
        this.reply(lang.join.isPlaying, {});
        return true;
      } else if (waitlist.contains(rawData.uid) && waitlist.positionOf(rawData.uid) <= 4) {
        this.reply(lang.join.closeToPlaying, {});
        return true;
      }

      const { uid: id } = rawData;

      if (bot.roulette.running) {
        if (bot.roulette.players.includes(id)) return true;

        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

        const props = inst.get("props");

        if (id != 4866676 || id != 26613571 || id != 41362497) {
          if (props < bot.roulette.price) {
            this.reply(lang.join.noProps, {});
            return true;
          }

          await inst.decrement("props", { by: bot.roulette.price });
          await bot.db.models.users.increment("props", { by: bot.roulette.price, where: { id: "40333310" } });
        }
        
        bot.roulette.add(id);
        return true;
      }
      else {
        if (bot.russianRoulette.players.includes(id)) return true;

        const [inst] = await bot.db.models.users.findOrCreate({ where: { id }, defaults: { id } });

        const props = inst.get("props");

        if (id != 4866676 || id != 26613571 || id != 41362497) {
          if (props < bot.russianRoulette.price) {
            this.reply(lang.join.noProps, {});
            return true;
          }

          await inst.decrement("props", { by: bot.russianRoulette.price });
          await bot.db.models.users.increment("props", { by: bot.russianRoulette.price, where: { id: "40333310" } });
        }
      
        bot.russianRoulette.add(id);
        return true;
      }
    },
  });
};
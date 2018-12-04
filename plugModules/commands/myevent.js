const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["myevent"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 3600,
    parameters: "",
    description: "Checks how many event currency do you have.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const id = rawData.from.id;

      const [inst] = await bot.db.models.holiday.findOrCreate({ where: { id }, defaults: { id } });

      if (isNil(inst)) return false;

      const currency = bot.utils.numberWithCommas(inst.get("currency"));

      if (currency <= 0) {
        this.reply(lang.myevent.noCurrency, {}, 6e4);
        return true;
      }

      this.reply(lang.myevent.result, { currency }, 6e4);
      return true;
    },
  });
};
const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["myprops"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 21600,
    parameters: "[given]",
    description: "Checks how many props the user has and their ranking, or how many the user has given.",
    async execute(rawData, { args }, lang) {
      const id = rawData.uid;

      if (args.length && `${args.shift()}`.toLowerCase() === "given") {
        const props = await bot.db.models.props.count({ where: { id } });

        this.reply(lang.myprops[props ? "given" : "noneGiven"], { props, plural: props > 1 ? "s" : "" });
        return true;
      }

      const inst = await bot.db.query("SELECT x.* FROM(SELECT id, props, ROW_NUMBER() OVER(ORDER BY props DESC) as rank FROM users) x WHERE x.id = '" + id + "'");

      if (isNil(inst)) return false;
      
      //const rank = bot.utils.numberWithCommas(inst[0][0].rank);
      const props = bot.utils.numberWithCommas(inst[0][0].props);

      if (props <= 0) {
        this.reply(lang.myprops.noProps, {});
        return true;
      }

      //this.reply(lang.myprops.result, { rank, props });
      this.reply(lang.myprops.result, { props });
      return true;
    },
  });
};
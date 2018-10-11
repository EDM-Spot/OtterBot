const { isNil } = require("lodash");
const { fn, literal, col } = require("sequelize");
const moment = require("moment");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["myrank"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 10800,
    parameters: "",
    description: "Checks your Rank in the leaderboards.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const id = rawData.from.id;

      const inst = await bot.db.models.plays.findAll({
        attributes: ["plays.dj",
          [fn("SUM", col("plays.woots")
          ), "totalwoots"],
          [fn("SUM", col("plays.mehs")
          ), "totalmehs"],
          [fn("SUM", col("plays.grabs")
          ), "totalgrabs"],
          [fn("COUNT", col("plays.cid")
          ), "playscount"],
          [literal(
            "(SELECT COUNT(messages.cid) FROM messages WHERE messages.id = plays.dj AND messages.command = false)"
          ), "totalmessages"],
          [literal(
            "(SELECT COUNT(index) FROM props WHERE props.id = plays.dj)"
          ), "propsgiven"],
          [literal(
            "ROW_NUMBER() OVER(ORDER BY ((((SELECT COUNT(index) FROM props WHERE props.id = plays.dj) * .025) + ((SELECT COUNT(messages.cid) FROM messages WHERE messages.id = plays.dj AND messages.command = false) * .0075) + (((SUM(plays.woots) * 0.75) + (SUM(plays.grabs) * 1.5)) * (COUNT(plays.cid))) - (SUM(plays.mehs) * EXTRACT(DAY FROM current_date-last_seen))) / (COUNT(plays.cid))) DESC)"
          ), "rank"]],
        include: [{
          model: bot.db.models.users,
          attributes: ["username", "last_seen"]
        }],
        where: {
          skipped: false,
          dj: id
        },
        group: ["user.id", "plays.dj"],
      });

      const points = (((inst[0].dataValues.propsgiven * .025) + (inst[0].dataValues.totalmessages * .0075) + (((inst[0].dataValues.totalwoots * 0.75) + (inst[0].dataValues.totalgrabs * 1.5)) * inst[0].dataValues.playscount) - (inst[0].dataValues.totalmehs * moment().diff(inst[0].dataValues.user.dataValues.last_seen, "days"))) / inst[0].dataValues.playscount);
      
      if (isNil(inst)) return false;
      
      const rank = bot.utils.numberWithCommas(inst[0].dataValues.rank);
      const totalpoints = bot.utils.numberWithCommas(Math.round(points));

      this.reply(lang.myrank.result, { rank, totalpoints }, 6e4);
      return true;
    },
  });
};
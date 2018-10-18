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

      const totalmessages = await bot.db.models.messages.count({
        where: { id: id, command: false }
      });

      const discordpoints = await bot.db.models.users.findOne({
        where: {
          id: id
        },
      });

      const propsgiven = await bot.db.models.props.count({ where: { id } });

      const playscount = await bot.db.models.plays.count({
        where: { dj: id, skipped: false }
      });

      const bancount = await bot.db.models.bans.count({
        where: { id: id, type: "BAN" }
      });

      const mutecount = await bot.db.models.bans.count({
        where: { id: id, type: "MUTE" }
      });

      const wlbancount = await bot.db.models.bans.count({
        where: { id: id, type: "WLBAN" }
      });

      const songvotes = await bot.db.models.plays.findAll({
        attributes: [
          [fn("SUM", col("plays.woots")
          ), "totalwoots"],
          [fn("SUM", col("plays.mehs")
          ), "totalmehs"],
          [fn("SUM", col("plays.grabs")
          ), "totalgrabs"]],
        where: {
          dj: id,
          skipped: false
        },
        group: ["dj"]
      });

      const totalsongs = await bot.db.models.plays.count({
        where: { skipped: false }
      });
      
      const totalbans = ((bancount * 4.5) + (mutecount * 2.75) + (wlbancount * 3.25) * 100);

      const rankList = await bot.db.models.plays.findAll({
        attributes: ["plays.dj",
          [literal(
            "ROW_NUMBER() OVER(ORDER BY (((" + (propsgiven * 1.75) + " + " + ((totalmessages + discordpoints.get("points")) * 1.25) + " + (((SUM(plays.woots) * 0.75) * (SUM(plays.grabs) * 3.5)) / " + playscount + ") - (((SUM(plays.mehs) * 8.75) * ((EXTRACT(DAY FROM current_date-last_seen) * 100) + 1)) + " + totalbans + ")) / " + totalsongs + ") * 1000) DESC)"
          ), "rank"],
          [literal(
            "plays.dj"
          ), "userid"]],
        include: [{
          model: bot.db.models.users,
          attributes: ["last_seen"]
        }],
        where: {
          skipped: false
        },
        group: ["user.id", "plays.dj"],
        logging: console.log
      });

      const inst = rankList.filter(u => u.dataValues.userid === id);
      
      if (isNil(inst)) return false;
      
      const propsGivenPoints = propsgiven * 1.75;
      const totalMessagesPoints = (totalmessages + discordpoints.get("points")) * 1.25;

      const totalWootsPoints = songvotes[0].dataValues.totalwoots * 0.75;
      const totalGrabsPoints = songvotes[0].dataValues.totalgrabs * 3.5;
      const totalMehsPoints = songvotes[0].dataValues.totalmehs * 8.75;

      const offlineDaysPoints = (moment().diff(inst[0].dataValues.user.dataValues.last_seen, "days") * 100) + 1;

      const points = ((propsGivenPoints + totalMessagesPoints + ((totalWootsPoints * totalGrabsPoints) / playscount) - ((totalMehsPoints * offlineDaysPoints) + totalbans)) / totalsongs) * 1000;
      
      const rank = bot.utils.numberWithCommas(inst[0].dataValues.rank);
      const totalpoints = bot.utils.numberWithCommas(Math.round(points));

      this.reply(lang.myrank.result, { rank, totalpoints }, 6e4);
      return true;
    },
  });
};
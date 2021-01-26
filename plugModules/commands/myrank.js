const { isNil } = require("lodash");
const { Op, literal } = require("sequelize");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["myrank"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 21600,
    parameters: "",
    description: "Checks your Rank in the leaderboards.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      const id = rawData.uid;

      const totalWootsPointsSQL = "(SUM(plays.woots) * " + bot.global.pointsWeight.woots + ")";
      const totalGrabsPointsSQL = "(SUM(plays.grabs) * " + bot.global.pointsWeight.grabs + ")";
  
      const MehsPoints = "((SELECT SUM(mehs) FROM plays a WHERE a.dj = plays.dj))";
      const totalMehsPointsSQL = "((" + MehsPoints + " + 1) * " + bot.global.pointsWeight.mehs + ")";
  
      const bancountSQL = "((SELECT COUNT(index) FROM bans WHERE bans.id = plays.dj AND bans.type = 'BAN') * " + bot.global.pointsWeight.ban + ")";
  
      const mutecountSQL = "((SELECT COUNT(index) FROM bans WHERE bans.id = plays.dj AND bans.type = 'MUTE') * " + bot.global.pointsWeight.mute + ")";
  
      const wlbancountSQL = "((SELECT COUNT(index) FROM bans WHERE bans.id = plays.dj AND bans.type = 'WLBAN') * " + bot.global.pointsWeight.wlban + ")";
  
      const totalbansSQL = "((" + bancountSQL + " + " + mutecountSQL + " + " + wlbancountSQL + ") * 100)";
  
      const propsGivenPointsSQL = "((SELECT COUNT(index) FROM props WHERE props.id = plays.dj) * " + bot.global.pointsWeight.propsGiven + ")";
      const totalMessagesPoints = "(((SELECT COUNT(messages.cid) FROM messages WHERE messages.id = plays.dj AND messages.command = false AND messages.deleted_by IS NULL) + points) * " + bot.global.pointsWeight.messages + ")";
  
      const offlineDaysPointsSQL = "(((EXTRACT(DAY FROM current_date-last_seen) * " + bot.global.pointsWeight.daysOffline + ") * 100) + 1)";
  
      const totalsongs = await bot.db.models.plays.count({
        where: { skipped: false }
      });
  
      const Songpoints = "(CAST(COUNT(plays.cid) as float) / CAST(" + totalsongs + " as float)) * 1000";
  
      const voteWootspoints = "(" + totalWootsPointsSQL + " / CAST(COUNT(plays.cid) as float))";
      const voteGrabspoints = "(" + totalGrabsPointsSQL + " / CAST(COUNT(plays.cid) as float))";
      const voteMehspoints = "(" + totalMehsPointsSQL + " / CAST(COUNT(plays.cid) as float))";
  
      const votePoints = "(" + voteWootspoints + " + " + voteGrabspoints + ") / " + voteMehspoints;
  
      const totalpoints = "((" + Songpoints + " * " + votePoints + ") + " + propsGivenPointsSQL + " + " + totalMessagesPoints + ") - (" + offlineDaysPointsSQL + " + " + totalbansSQL + ")";

      const rankList = await bot.db.models.plays.findAll({
        attributes: ["plays.dj",
          [literal(
            "ROW_NUMBER() OVER(ORDER BY (((" + Songpoints + " * " + votePoints + ") + " + propsGivenPointsSQL + " + " + totalMessagesPoints + ") - (" + offlineDaysPointsSQL + " + " + totalbansSQL + ")) DESC)"
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
        group: ["user.id", "plays.dj"]
      });

      const inst = rankList.filter(u => u.dataValues.userid === id);

      if (isNil(inst) || isNil(inst[0])) return false;

      /*const totalmessages = await bot.db.models.messages.count({
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

      const totalbans = (((bancount * bot.global.pointsWeight.ban) + (mutecount * bot.global.pointsWeight.mute) + (wlbancount * bot.global.pointsWeight.wlban)) * 100);

      const propsGivenPoints = propsgiven * bot.global.pointsWeight.propsGiven;
      const totalMessagesPoints = (totalmessages + discordpoints.get("points")) * bot.global.pointsWeight.messages;

      const totalWootsPoints = songvotes[0].dataValues.totalwoots * bot.global.pointsWeight.woots;
      const totalGrabsPoints = songvotes[0].dataValues.totalgrabs * bot.global.pointsWeight.grabs;
      const totalMehsPoints = songvotes[0].dataValues.totalmehs * bot.global.pointsWeight.mehs;

      const offlineDaysPoints = (moment().diff(inst[0].dataValues.user.dataValues.last_seen, "days") * 100) + 1;

      const points = ((propsGivenPoints + totalMessagesPoints + ((totalWootsPoints * totalGrabsPoints) / (playscount - totalsongs)) - ((totalMehsPoints * offlineDaysPoints) + totalbans)));*/

      const rank = bot.utils.numberWithCommas(inst[0].dataValues.rank);
      //const totalpoints = bot.utils.numberWithCommas(Math.round(points));

      //this.reply(lang.myrank.result, { rank, totalpoints });
      this.reply(lang.myrank.result, { rank });
      return true;
    },
  });
};
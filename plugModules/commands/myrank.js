const { isNil } = require("lodash");

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

      const inst = await bot.db.query(
        "SELECT x.* FROM(SELECT plays.dj, " +
        "ROW_NUMBER() OVER(ORDER BY ((((SELECT COUNT(index) FROM props WHERE props.id = plays.dj) * .025) + ((SELECT COUNT(messages.cid) FROM messages WHERE messages.id = plays.dj AND messages.command = false) * .0075) + (((SUM(plays.woots) * 0.75) + (SUM(plays.grabs) * 1.5)) * (COUNT(plays.cid))) - (SUM(plays.mehs) * EXTRACT(DAY FROM current_date-users.last_seen))) / (COUNT(plays.cid))) DESC) as rank, " + 
        "round(((((SELECT COUNT(index) FROM props WHERE props.id = plays.dj) * .025) + ((SELECT COUNT(messages.cid) FROM messages WHERE messages.id = plays.dj AND messages.command = false) * .0075) + (((SUM(plays.woots) * 0.75) + (SUM(plays.grabs) * 1.5)) * (COUNT(plays.cid))) - (SUM(plays.mehs) * EXTRACT(DAY FROM current_date-users.last_seen))) / (COUNT(plays.cid)))) as totalpoints " +
        "FROM plays " +
        "JOIN users ON (plays.dj = users.id) " +
        "WHERE plays.skipped = false " +
        "GROUP BY plays.dj, users.last_seen " +
        "ORDER BY totalpoints DESC) x WHERE x.dj = '" + id + "'");

      if (isNil(inst)) return false;
      
      const rank = bot.utils.numberWithCommas(inst[0][0].rank);
      const totalpoints = bot.utils.numberWithCommas(inst[0][0].totalpoints);

      this.reply(lang.myrank.result, { rank, totalpoints }, 6e4);
      return true;
    },
  });
};
const { isNil } = require("lodash");
const { Op } = require("sequelize");

module.exports = function Util(bot) {
  const util = {
    name: "getSongHistory",
    function: async (songAuthor, songTitle, cid) => {
      if (isNil(cid)) return;

      const songHistory = await bot.db.models.plays.findAll({
        where: {
          created_at: {
            [Op.gt]: bot.moment().subtract(360, "minutes").toDate()
          }
        },
        order: [["created_at", "ASC"]],
      });

      if (!isNil(songHistory)) {
        for (let i = 0; i < songHistory.length; i++) {
          const playedMinutes = bot.moment().diff(bot.moment(songHistory[i].created_at), "minutes");

          if (!isNil(songHistory[i].title)) {
            if (playedMinutes <= 360) {
              const currentAuthor = songAuthor.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
              const savedAuthor = songHistory[i].author.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();

              const currentTitle = songTitle.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
              const savedTitle = songHistory[i].title.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();

              if (songHistory[i].cid === cid) {
                // Song Played | Same ID
                return { songHistory: songHistory[i], maybe: false };
              }

              if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (songHistory[i].cid !== cid)) {
                // Same Song | Diff CID | Diff Remix/Channel
                return { songHistory: songHistory[i], maybe: false };
              }

              if ((savedTitle === currentTitle) && (savedAuthor !== currentAuthor) && (songHistory[i].cid !== cid)) {
                // Same Song Name/Maybe diff Author
                if (songHistory[i].format === 1) { //Until soundcloud works?
                  return { songHistory: songHistory[i], maybe: true };
                }
              }
            }
          }
        }
      }

      return undefined;
    },
  };

  bot.utils.register(util);
};
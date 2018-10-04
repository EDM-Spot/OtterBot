const { isNil } = require("lodash");
const { literal } = require("sequelize");

module.exports = function Util(bot) {
  const util = {
    name: "getSongHistory",
    function: async (songAuthor, songTitle, cid) => {
      if (isNil(cid)) return;

      const songHistory = await bot.db.models.plays.findAll({
        attributes: ["id", "cid", "format", "woots", "grabs", "mehs", "dj", "skipped", "author", "title",
          [literal(
            "COUNT(cid)"
          ), "count"]],
        group: ["id"],
        order: [["created_at", "ASC"]],
      });

      if (!isNil(songHistory)) {
        for (let i = 0; i < songHistory.length; i++) {
          const playedMinutes = bot.moment().diff(bot.moment(songHistory[i].created_at), "minutes");

          if (!isNil(songHistory[i].title)) {
            const currentAuthor = songAuthor.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
            const savedAuthor = songHistory[i].author.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();

            const currentTitle = songTitle.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
            const savedTitle = songHistory[i].title.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();

            if (playedMinutes <= 360) {
              if (songHistory[i].cid === cid) {
                // Song Played | Same ID
                return { songHistory: songHistory[i], maybe: false, skip: true };
              }

              if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (songHistory[i].cid !== cid)) {
                // Same Song | Diff CID | Diff Remix/Channel
                return { songHistory: songHistory[i], maybe: false, skip: true };
              }

              if ((savedTitle === currentTitle) && (savedAuthor !== currentAuthor) && (songHistory[i].cid !== cid)) {
                // Same Song Name/Maybe diff Author
                if (songHistory[i].format === 1) { //Until soundcloud works?
                  return { songHistory: songHistory[i], maybe: true, skip: true };
                }
              }
            }
            else {
              if (songHistory[i].cid === cid) {
                // Song Played | Same ID
                return { songHistory: songHistory[i], maybe: false, skip: false };
              }

              if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (songHistory[i].cid !== cid)) {
                // Same Song | Diff CID | Diff Remix/Channel
                return { songHistory: songHistory[i], maybe: false, skip: false };
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
const { isObject, isNil, has, get, map } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["plays", "lastplayed"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 60,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Checks the specified link, or the current media, for the last time it was played in the community.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      if (!args.length) {
        const currentMedia = bot.plug.historyEntry();
        const dj = bot.plug.dj();

        if (!isObject(currentMedia)) {
          this.reply(lang.plays.nothingPlaying, {});
          return false;
        }

        //if (rawData.uid == dj.id) { return false; }

        let songAuthor = null;
        let songTitle = null;

        try {
          if (get(currentMedia.media, "format", 2) === 1) {
            const YouTubeMediaData = await bot.youtube.getMedia(currentMedia.media.cid);

            const fullTitle = get(YouTubeMediaData, "snippet.title");

            songAuthor = fullTitle.split(" - ")[0].trim();
            songTitle = fullTitle.split(" - ")[1].trim();
          } else {
            const SoundCloudMediaData = await bot.soundcloud.getTrack(currentMedia.media.cid);

            if (!isNil(SoundCloudMediaData)) {
              const fullTitle = SoundCloudMediaData.title;

              songAuthor = fullTitle.split(" - ")[0].trim();
              songTitle = fullTitle.split(" - ")[1].trim();
            }
          }
        }
        catch (err) {
          songAuthor = currentMedia.media.author;
          songTitle = currentMedia.media.title;
        }

        if (isNil(songAuthor) || isNil(songTitle)) {
          songAuthor = currentMedia.media.author;
          songTitle = currentMedia.media.title;
        }

        const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, currentMedia.media.cid);

        if (isNil(songHistory)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.current });
          return true;
        } else {
          if (!songHistory.maybe) {
            const playsCount = await bot.db.models.plays.count({
              where: { cid: `${map(songHistory, "cid")[0]}`, skipped: false },
            });

            if (playsCount < 1) {
              this.reply(lang.plays.lastPlaySkippedWas, {
                which: lang.plays.current,
                time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              });
              return true;
            }

            this.reply(lang.plays.lastPlayWas, {
              which: lang.plays.current,
              time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              count: playsCount,
            });
            return true;
          } else {
            if (map(songHistory, "format")[0] === 1) {
              this.reply(lang.plays.maybeLastPlayWas, {
                which: lang.plays.current,
                cid: map(songHistory, "cid")[0],
                time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              });
              return true;
            }
          }
        }
      }

      const link = args.shift();

      if (isNil(link)) return;

      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        const YouTubeMediaData = await bot.youtube.getMedia(cid);
        let songAuthor = null;
        let songTitle = null;

        try {
          const fullTitle = get(YouTubeMediaData, "snippet.title");

          songAuthor = fullTitle.split(" - ")[0].trim();
          songTitle = fullTitle.split(" - ")[1].trim();
        }
        catch (err) {
          //console.warn(err);
          //return;
        }

        const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, cid);
        const isOverplayed = await bot.utils.isSongOverPlayed(songAuthor, songTitle, cid);

        if (isNil(songHistory)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.specified });
          return true;
        } else {
          if (!songHistory.maybe) {
            const playsCount = await bot.db.models.plays.count({
              where: { cid: `${map(songHistory, "cid")[0]}`, skipped: false },
            });

            if (playsCount < 1) {
              this.reply(lang.plays.lastPlaySkippedWas, {
                which: lang.plays.specified,
                time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              });
              if (isOverplayed) { bot.plug.chat("Song Is Overplayed!"); }

              return true;
            }

            this.reply(lang.plays.lastPlayWas, {
              which: lang.plays.specified,
              time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              count: playsCount,
            });
            if (isOverplayed) { bot.plug.chat("Song Is Overplayed!"); }

            return true;
          } else {
            if (map(songHistory, "format")[0] === 1) {
              this.reply(lang.plays.maybeLastPlayWas, {
                which: lang.plays.specified,
                cid: map(songHistory, "cid")[0],
                time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
              });
              if (isOverplayed) { bot.plug.chat("Song Is Overplayed!"); }

              return true;
            }
          }
        }
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMediaRaw = await bot.soundcloud.resolve(link);
        const soundcloudMedia = JSON.parse(soundcloudMediaRaw);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          const SoundCloudMediaData = await bot.soundcloud.getTrack(soundcloudMedia.id);

          if (!isNil(SoundCloudMediaData)) {
            const fullTitle = SoundCloudMediaData.title;
            let songAuthor = null;
            let songTitle = null;

            try {
              songAuthor = fullTitle.split(" - ")[0].trim();
              songTitle = fullTitle.split(" - ")[1].trim();
            }
            catch (err) { }

            const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, cid);
            const isOverplayed = await bot.utils.isSongOverPlayed(songAuthor, songTitle, cid);

            if (isNil(songHistory)) {
              this.reply(lang.plays.neverPlayed, { which: lang.plays.specified });
              return true;
            } else {
              if (!songHistory.maybe) {
                const playsCount = await bot.db.models.plays.count({
                  where: { cid: `${map(songHistory, "cid")[0]}`, skipped: false },
                });

                if (playsCount < 1) {
                  this.reply(lang.plays.lastPlaySkippedWas, {
                    which: lang.plays.specified,
                    time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                  });
                  if (isOverplayed) { bot.plug.chat("Song Is Overplayed!"); }

                  return true;
                }

                this.reply(lang.plays.lastPlayWas, {
                  which: lang.plays.specified,
                  time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                  count: playsCount,
                });
                if (isOverplayed) { bot.plug.chat("Song Is Overplayed!"); }

                return true;
              } else {
                if (map(songHistory, "format")[0] === 1) {
                  this.reply(lang.plays.maybeLastPlayWas, {
                    which: lang.plays.specified,
                    cid: map(songHistory, "cid")[0],
                    time: bot.moment(map(songHistory, "createdAt")[0]).fromNow(),
                  });
                  if (isOverplayed) { bot.plug.chat("Song Is Overplayed!"); }

                  return true;
                }
              }
            }
          }
        }

        return false;
      }

      this.reply(lang.plays.invalidLink, {});
      return false;
    },
  });
};
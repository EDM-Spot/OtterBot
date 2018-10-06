const { isObject, isNil, has, get, map } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["plays", "lastplayed"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 10,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Checks the specified link, or the current media, for the last time it was played in the community.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      if (!args.length) {
        const currentMedia = bot.plug.getMedia();

        if (!isObject(currentMedia)) {
          this.reply(lang.plays.nothingPlaying, {}, 6e4);
          return false;
        }

        let songAuthor = null;
        let songTitle = null;
  
        if (get(currentMedia, "format", 2) === 1) {
          const YouTubeMediaData = await bot.youtube.getMedia(currentMedia.cid);
  
          const { snippet } = YouTubeMediaData; // eslint-disable-line no-unused-vars
          const fullTitle = get(YouTubeMediaData, "snippet.title");
  
          songAuthor = fullTitle.split(" - ")[0].trim();
          songTitle = fullTitle.split(" - ")[1].trim();
        } else {
          const SoundCloudMediaData = await bot.soundcloud.getTrack(currentMedia.cid);
  
          if (!isNil(SoundCloudMediaData)) {
            console.log(SoundCloudMediaData);
            const fullTitle = SoundCloudMediaData.title;
  
            songAuthor = fullTitle.split(" - ")[0].trim();
            songTitle = fullTitle.split(" - ")[1].trim();
          }
        }
  
        if (isNil(songAuthor) || isNil(songTitle)) {
          songAuthor = currentMedia.author;
          songTitle = currentMedia.title;
        }
  
        const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, currentMedia.cid);

        if (isNil(songHistory)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.current }, 6e4);
          return true;
        } else {
          if (!songHistory.maybe) {
            const playsCount = await bot.db.models.plays.count({
              where: { cid: `${map(songHistory, "cid")[0]}`, skipped: false },
            });
            this.reply(lang.plays.lastPlayWas, {
              which: lang.plays.specified,
              time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
              count: playsCount,
            }, 6e4);
            return true;
          } else {
            if (map(songHistory, "format")[0] === 1) {
              this.reply(lang.plays.maybeLastPlayWas, {
                which: lang.plays.specified,
                cid: map(songHistory, "cid")[0],
                time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
              }, 6e4);
              return true;
            }
          }
        }
      }

      const link = args.shift();
      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        const YouTubeMediaData = await bot.youtube.getMedia(cid);
  
        const { snippet } = YouTubeMediaData; // eslint-disable-line no-unused-vars
        const fullTitle = get(YouTubeMediaData, "snippet.title");
  
        const songAuthor = fullTitle.split(" - ")[0].trim();
        const songTitle = fullTitle.split(" - ")[1].trim();

        const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, cid);

        if (isNil(songHistory)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.specified }, 6e4);
          return true;
        } else {
          if (!songHistory.maybe) {
            const playsCount = await bot.db.models.plays.count({
              where: { cid: `${map(songHistory, "cid")[0]}`, skipped: false },
            });
            this.reply(lang.plays.lastPlayWas, {
              which: lang.plays.specified,
              time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
              count: playsCount,
            }, 6e4);
            return true;
          } else {
            if (map(songHistory, "format")[0] === 1) {
              this.reply(lang.plays.maybeLastPlayWas, {
                which: lang.plays.specified,
                cid: map(songHistory, "cid")[0],
                time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
              }, 6e4);
              return true;
            }
          }
        }
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMedia = await bot.soundcloud.resolve(link);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          const SoundCloudMediaData = await bot.soundcloud.getTrack(soundcloudMedia.id);
  
          if (!isNil(SoundCloudMediaData)) {
            const fullTitle = SoundCloudMediaData.title;
  
            const songAuthor = fullTitle.split(" - ")[0].trim();
            const songTitle = fullTitle.split(" - ")[1].trim();

            const songHistory = await bot.utils.getSongHistory(songAuthor, songTitle, cid);

            if (isNil(songHistory)) {
              this.reply(lang.plays.neverPlayed, { which: lang.plays.specified }, 6e4);
              return true;
            } else {
              if (!songHistory.maybe) {
                const playsCount = await bot.db.models.plays.count({
                  where: { cid: `${map(songHistory, "cid")[0]}`, skipped: false },
                });
                this.reply(lang.plays.lastPlayWas, {
                  which: lang.plays.specified,
                  time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
                  count: playsCount,
                }, 6e4);
                return true;
              } else {
                if (map(songHistory, "format")[0] === 1) {
                  this.reply(lang.plays.maybeLastPlayWas, {
                    which: lang.plays.specified,
                    cid: map(songHistory, "cid")[0],
                    time: bot.moment(map(songHistory, "created_at")[0]).fromNow(),
                  }, 6e4);
                  return true;
                }
              }
            }
          }
        }

        return false;
      }

      this.reply(lang.plays.invalidLink, {}, 6e4);
      return false;
    },
  });
};
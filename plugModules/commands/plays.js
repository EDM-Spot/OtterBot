const { isObject, isNil, has, get } = require("lodash");
const { Op } = require("sequelize");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["plays", "lastplayed", "history"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 10,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Checks the specified link, or the current media, for the last time it was played in the community.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      
      const instance = await bot.db.models.plays.findAll({
        where: {
          created_at: {
            [Op.gt]: bot.moment().subtract(360, "minutes").toDate()
          }
        },
        order: [["created_at", "ASC"]],
      });

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
            const fullTitle = SoundCloudMediaData.title;
  
            songAuthor = fullTitle.split(" - ")[0].trim();
            songTitle = fullTitle.split(" - ")[1].trim();
          }
        }
  
        if (isNil(songAuthor) || isNil(songTitle)) {
          songAuthor = currentMedia.author;
          songTitle = currentMedia.title;
        }
  
        if (!isNil(instance)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.current }, 6e4);
          return true;
        } else {
          for (let i = 0; i < instance.length; i++) {
            const playedMinutes = bot.moment().diff(bot.moment(instance[i].created_at), "minutes");
  
            if (!isNil(instance[i].title)) {
              if (playedMinutes <= 360) {
                const currentAuthor = songAuthor.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
                const savedAuthor = instance[i].author.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
  
                const currentTitle = songTitle.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
                const savedTitle = instance[i].title.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
  
                if (instance.cid === currentMedia.cid) {
                  // Song Played | Same ID
                  this.reply(lang.plays.lastPlayWas, {
                    which: lang.plays.specified,
                    time: bot.moment(instance[i].created_at).fromNow(),
                  }, 6e4);
                  return true;
                }
  
                if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (instance[i].cid !== currentMedia.cid)) {
                  // Same Song | Diff CID | Diff Remix/Channel
                  this.reply(lang.plays.lastPlayWas, {
                    which: lang.plays.specified,
                    time: bot.moment(instance[i].created_at).fromNow(),
                  }, 6e4);
                  return true;
                }
  
                if ((savedTitle === currentTitle) && (savedAuthor !== currentAuthor) && (instance[i].cid !== currentMedia.cid)) {
                  // Same Song Name/Maybe diff Author
                  if (instance[i].format === 1) {
                    this.reply(lang.plays.maybeLastPlayWas, {
                      which: lang.plays.specified,
                      cid: instance[i].cid,
                      time: bot.moment(instance[i].created_at).fromNow(),
                    }, 6e4);
                    return true;
                  }
                }
              }
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

        if (!isObject(instance)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.specified }, 6e4);
          return true;
        } else {
          for (let i = 0; i < instance.length; i++) {
            const playedMinutes = bot.moment().diff(bot.moment(instance[i].created_at), "minutes");
  
            if (!isNil(instance[i].title)) {
              if (playedMinutes <= 360) {
                const currentAuthor = songAuthor.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
                const savedAuthor = instance[i].author.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
  
                const currentTitle = songTitle.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
                const savedTitle = instance[i].title.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
  
                if (instance.cid === cid) {
                  // Song Played | Same ID
                  this.reply(lang.plays.lastPlayWas, {
                    which: lang.plays.specified,
                    time: bot.moment(instance[i].created_at).fromNow(),
                  }, 6e4);
                  return true;
                }
  
                if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (instance[i].cid !== cid)) {
                  // Same Song | Diff CID | Diff Remix/Channel
                  this.reply(lang.plays.lastPlayWas, {
                    which: lang.plays.specified,
                    time: bot.moment(instance[i].created_at).fromNow(),
                  }, 6e4);
                  return true;
                }
  
                if ((savedTitle === currentTitle) && (savedAuthor !== currentAuthor) && (instance[i].cid !== cid)) {
                  // Same Song Name/Maybe diff Author
                  if (instance[i].format === 1) {
                    this.reply(lang.plays.maybeLastPlayWas, {
                      which: lang.plays.specified,
                      cid: instance[i].cid,
                      time: bot.moment(instance[i].created_at).fromNow(),
                    }, 6e4);
                    return true;
                  }
                }
              }
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

            if (!isObject(instance)) {
              this.reply(lang.plays.neverPlayed, { which: lang.plays.specified }, 6e4);
              return true;
            } else {
              for (let i = 0; i < instance.length; i++) {
                const playedMinutes = bot.moment().diff(bot.moment(instance[i].created_at), "minutes");
    
                if (!isNil(instance[i].title)) {
                  if (playedMinutes <= 360) {
                    const currentAuthor = songAuthor.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
                    const savedAuthor = instance[i].author.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
    
                    const currentTitle = songTitle.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
                    const savedTitle = instance[i].title.replace(/ *\([^)]*\) */g, "").replace(/\[.*?\]/g, "").trim();
    
                    if (instance.cid === cid) {
                    // Song Played | Same ID
                      this.reply(lang.plays.lastPlayWas, {
                        which: lang.plays.specified,
                        time: bot.moment(instance[i].created_at).fromNow(),
                      }, 6e4);
                      return true;
                    }
    
                    if ((savedTitle === currentTitle) && (savedAuthor === currentAuthor) && (instance[i].cid !== cid)) {
                    // Same Song | Diff CID | Diff Remix/Channel
                      this.reply(lang.plays.lastPlayWas, {
                        which: lang.plays.specified,
                        time: bot.moment(instance[i].created_at).fromNow(),
                      }, 6e4);
                      return true;
                    }
    
                    if ((savedTitle === currentTitle) && (savedAuthor !== currentAuthor) && (instance[i].cid !== cid)) {
                    // Same Song Name/Maybe diff Author
                      if (instance[i].format === 1) {
                        this.reply(lang.plays.maybeLastPlayWas, {
                          which: lang.plays.specified,
                          cid: instance[i].cid,
                          time: bot.moment(instance[i].created_at).fromNow(),
                        }, 6e4);
                        return true;
                      }
                    }
                  }
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
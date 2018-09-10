const { isObject, isNil, has } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["plays", "lastplayed", "history"],
    minimumPermission: 0,
    cooldownType: "perUser",
    cooldownDuration: 10,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Checks the specified link, or the current media, for the last time it was played in the community.",
    async execute(rawData, { args }, lang) {
      if (!args.length) {
        const currentMedia = bot.plug.getMedia();

        if (!isObject(currentMedia)) {
          this.reply(lang.plays.nothingPlaying, {}, 6e4);
          return false;
        }

        const instance = await bot.db.models.plays.findOne({
          where: {
            cid: `'${currentMedia.cid}'`,
            format: currentMedia.format,
          },
          order: [["created_at", "DESC"]],
        });

        if (isNil(instance)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.current }, 6e4);
          return true;
        }

        this.reply(lang.plays.lastPlayWas, {
          which: lang.plays.specified,
          time: bot.moment(instance.get("created_at")).fromNow(),
        }, 6e4);
        return true;
      }

      const link = args.shift();
      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        const instance = await bot.db.models.plays.findOne({
          where: {
            cid: cid,
            format: 1,
          },
          order: [["created_at", "DESC"]],
        });

        if (isNil(instance)) {
          this.reply(lang.plays.neverPlayed, { which: lang.plays.specified }, 6e4);
          return true;
        }

        this.reply(lang.plays.lastPlayWas, {
          which: lang.plays.specified,
          time: await bot.moment(instance.get("created_at")).fromNow(),
        }, 6e4);
        return true;
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMedia = await bot.soundcloud.resolve(link);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          const instance = await bot.db.models.plays.findOne({
            where: {
              cid: `'${soundcloudMedia.id}'`,
              format: 2,
            },
            order: [["created_at", "DESC"]],
          });

          if (isNil(instance)) {
            this.reply(lang.plays.neverPlayed, { which: lang.plays.specified }, 6e4);
            return true;
          }

          this.reply(lang.plays.lastPlayWas, {
            which: lang.plays.specified,
            time: bot.moment(instance.get("created_at")).fromNow(),
          }, 6e4);
          return true;
        }

        return false;
      }

      this.reply(lang.plays.invalidLink, {}, 6e4);
      return false;
    },
  });
};
const { isObject, isNil, has } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["blacklist", "bl"],
    minimumPermission: 2000,
    cooldownType: "perUser",
    cooldownDuration: 3,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Blacklist a song",
    async execute(rawData, { args }, lang) {
      if (!args.length) {
        const currentMedia = bot.plug.getMedia();

        if (!isObject(currentMedia)) {
          this.reply(lang.blacklist.nothingPlaying, {}, 6e4);
          return false;
        }

        await bot.db.models.blacklist.findOrCreate({
          where: { cid: currentMedia.cid },
          defaults: {
            cid: currentMedia.cid,
            moderator: rawData.from.id,
          },
        });

        this.reply(lang.blacklist.currentAdded, {}, 6e4);
        await bot.plug.moderateForceSkip();
        return true;
      }

      const link = args.shift();
      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        await bot.db.models.blacklist.findOrCreate({
          where: { cid: cid },
          defaults: {
            cid: cid,
            moderator: rawData.from.id,
          },
        });

        this.reply(lang.blacklist.linkAdded, {}, 6e4);
        return true;
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMediaRaw = await bot.soundcloud.resolve(link);
        const soundcloudMedia = JSON.parse(soundcloudMediaRaw);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          await bot.db.models.blacklist.findOrCreate({
            where: { cid: `${soundcloudMedia.id}` },
            defaults: {
              cid: `${soundcloudMedia.id}`,
              moderator: rawData.from.id,
            },
          });

          this.reply(lang.blacklist.linkAdded, {}, 6e4);
          return true;
        }

        return false;
      }

      this.reply(lang.blacklist.invalidLink, {}, 6e4);
      return false;
    },
  });
};
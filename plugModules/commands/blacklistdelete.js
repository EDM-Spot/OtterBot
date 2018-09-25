const { isObject, isNil, has } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["bdel", "bldel"],
    minimumPermission: 2000,
    cooldownType: "perUser",
    cooldownDuration: 3,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Delete a song from blacklist",
    async execute(rawData, { args }, lang) {
      const link = args.shift();
      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        const song = await bot.db.models.blacklist.findOne({
          where: {
            cid: cid,
          },
        });
  
        if (isNil(song)) return false;

        await bot.db.models.blacklist.destroy({ where: { cid: cid } });
        this.reply(lang.blacklist.deleted, {}, 6e4);
        return true;
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMedia = await bot.soundcloud.resolve(link);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          const song = await bot.db.models.blacklist.findOne({
            where: {
              cid: soundcloudMedia.id,
            },
          });

          if (isNil(song)) return false;

          await bot.db.models.blacklist.destroy({ where: { cid: soundcloudMedia.id } });
          this.reply(lang.blacklist.deleted, {}, 6e4);
          return true;
        }

        return false;
      }

      this.reply(lang.blacklist.invalidLink, {}, 6e4);
      return false;
    },
  });
};
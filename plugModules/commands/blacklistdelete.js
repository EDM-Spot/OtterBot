const { isObject, isNil, has, get } = require("lodash");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["bdel", "bldel"],
    minimumPermission: 2000,
    cooldownType: "perUser",
    cooldownDuration: 3,
    parameters: "<YouTube Link|SoundCloud Link>",
    description: "Delete a song from blacklist",
    async execute(rawData, { args }, lang) {
      const link = args.shift();
      const cid = bot.youtube.getMediaID(link);

      console.log(cid);

      if (!isNil(cid)) {
        const song = await bot.db.models.blacklist.findOne({
          where: {
            cid: cid,
          },
        });

        if (isNil(song)) return false;

        const YouTubeMediaData = await bot.youtube.getMedia(cid);
        const fullTitle = get(YouTubeMediaData, "snippet.title");

        const embed = new Discord.RichEmbed()
          //.setTitle("Title")
          .setAuthor(fullTitle, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
          .setColor(0xFF00FF)
          //.setDescription("This is the main body of text, it can hold 2048 characters.")
          .setFooter("By " + rawData.from.username)
          //.setImage("http://i.imgur.com/yVpymuV.png")
          //.setThumbnail("http://i.imgur.com/p2qNFag.png")
          .setTimestamp()
          //.addField("This is a field title, it can hold 256 characters")
          .addField("Removed From Blacklist", " (youtube.com/watch?v=" + cid + ")", false);
        //.addBlankField(true);

        bot.channels.get("486637288923725824").send({ embed });

        await bot.db.models.blacklist.destroy({ where: { cid: cid } });
        this.reply(lang.blacklist.deleted, {}, 6e4);
        return true;
      } else if (link.includes("soundcloud.com")) {
        const soundcloudMedia = await bot.soundcloud.resolve(link);

        console.log(soundcloudMedia);

        if (isNil(soundcloudMedia)) return false;

        if (isObject(soundcloudMedia) && has(soundcloudMedia, "id")) {
          const song = await bot.db.models.blacklist.findOne({
            where: {
              cid: soundcloudMedia.id,
            },
          });

          console.log(song);

          if (isNil(song)) return false;

          const SoundCloudMediaData = await bot.soundcloud.getTrack(soundcloudMedia.id);
          const fullTitle = SoundCloudMediaData.title;

          const embed = new Discord.RichEmbed()
            //.setTitle("Title")
            .setAuthor(fullTitle, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
            .setColor(0xFF00FF)
            //.setDescription("This is the main body of text, it can hold 2048 characters.")
            .setFooter("By " + rawData.from.username)
            //.setImage("http://i.imgur.com/yVpymuV.png")
            //.setThumbnail("http://i.imgur.com/p2qNFag.png")
            .setTimestamp()
            //.addField("This is a field title, it can hold 256 characters")
            .addField("Removed From Blacklist", "SoundCloud", false);
          //.addBlankField(true);

          bot.channels.get("486637288923725824").send({ embed });

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
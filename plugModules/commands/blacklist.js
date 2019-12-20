const { isObject, isNil, has, get } = require("lodash");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["blacklist", "bl"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 3,
    parameters: "[YouTube Link|SoundCloud Link]",
    description: "Blacklist a song",
    async execute(rawData, { args }, lang) {
      if (!args.length) {
        const currentMedia = bot.plug.historyEntry();
        const dj = bot.plug.dj();

        if (!isObject(currentMedia)) {
          this.reply(lang.blacklist.nothingPlaying, {}, 6e4);
          return false;
        }

        await bot.db.models.blacklist.findOrCreate({
          where: { cid: currentMedia.media.cid },
          defaults: {
            cid: currentMedia.cid,
            moderator: rawData.uid,
          },
        });

        const embed = new Discord.RichEmbed()
          //.setTitle("Title")
          .setAuthor(currentMedia.media.author + " - " + currentMedia.media.title, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
          .setColor(0xFF00FF)
          //.setDescription("This is the main body of text, it can hold 2048 characters.")
          .setFooter("By " + rawData.un)
          //.setImage("http://i.imgur.com/yVpymuV.png")
          //.setThumbnail("http://i.imgur.com/p2qNFag.png")
          .setTimestamp()
          //.addField("This is a field title, it can hold 256 characters")
          .addField("ID", dj.id, true)
          .addField("User ", dj.username, true)
          .addField("Blacklisted", " (youtube.com/watch?v=" + currentMedia.media.cid + ")", false);
        //.addBlankField(true);

        bot.channels.get("486637288923725824").send({ embed });

        this.reply(lang.blacklist.currentAdded, {}, 6e4);
        await currentMedia.skip();
        return true;
      }

      const link = args.shift();
      const cid = bot.youtube.getMediaID(link);

      if (!isNil(cid)) {
        await bot.db.models.blacklist.findOrCreate({
          where: { cid: cid },
          defaults: {
            cid: cid,
            moderator: rawData.uid,
          },
        });

        const YouTubeMediaData = await bot.youtube.getMedia(cid);
        const fullTitle = get(YouTubeMediaData, "snippet.title");

        const embed = new Discord.RichEmbed()
          //.setTitle("Title")
          .setAuthor(fullTitle, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
          .setColor(0xFF00FF)
          //.setDescription("This is the main body of text, it can hold 2048 characters.")
          .setFooter("By " + rawData.un)
          //.setImage("http://i.imgur.com/yVpymuV.png")
          //.setThumbnail("http://i.imgur.com/p2qNFag.png")
          .setTimestamp()
          //.addField("This is a field title, it can hold 256 characters")
          .addField("Added To Blacklist", " (youtube.com/watch?v=" + cid + ")", false);
        //.addBlankField(true);

        bot.channels.get("486637288923725824").send({ embed });

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
              moderator: rawData.uid,
            },
          });

          const SoundCloudMediaData = await bot.soundcloud.getTrack(soundcloudMedia.id);
          const fullTitle = SoundCloudMediaData.title;

          const embed = new Discord.RichEmbed()
            //.setTitle("Title")
            .setAuthor(fullTitle, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
            .setColor(0xFF00FF)
            //.setDescription("This is the main body of text, it can hold 2048 characters.")
            .setFooter("By " + rawData.un)
            //.setImage("http://i.imgur.com/yVpymuV.png")
            //.setThumbnail("http://i.imgur.com/p2qNFag.png")
            .setTimestamp()
            //.addField("This is a field title, it can hold 256 characters")
            .addField("Added To Blacklist", "SoundCloud", false);
          //.addBlankField(true);

          bot.channels.get("486637288923725824").send({ embed });

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
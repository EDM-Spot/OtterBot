const { isObject, isNil } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "modSkip",
    platform,
    _filename: filename,
    run: async (moderator) => {
      if (!isObject(moderator)) return;

      if (moderator.id === bot.plug.me().id) return;

      bot.plug.getRoomHistory().then(async (history) => {
        var skippedSong = history;

        if (isNil(skippedSong)) return;

        const embed = new Discord.MessageEmbed()
          //.setTitle("Title")
          .setAuthor(skippedSong.user.username, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
          .setColor(0xFF00FF)
          //.setDescription("This is the main body of text, it can hold 2048 characters.")
          .setFooter("By " + moderator.username)
          //.setImage("http://i.imgur.com/yVpymuV.png")
          //.setThumbnail("http://i.imgur.com/p2qNFag.png")
          .setTimestamp()
          //.addField("This is a field title, it can hold 256 characters")
          .addField("ID", skippedSong.user.id, true)
          .addField("Skipped", skippedSong.media.name + " (youtube.com/watch?v=" + skippedSong.media.cid + ")", false);
        //.addBlankField(true);

        bot.channels.get("487985043776733185").send({ embed });
      });
    },
    init() {
      bot.plug.on(this.name, this.run);
    },
    kill() {
      bot.plug.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};
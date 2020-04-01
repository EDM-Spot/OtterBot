const { isObject } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, platform) {
  const event = {
    name: "modWaitlistBan",
    platform,
    run: async (data) => {
      if (!isObject(data)) return;

      await bot.db.models.bans.create({
        id: data.user.id,
        type: "WLBAN",
        duration: data.duration,
      });

      if (data.moderator.id === bot.plug.me().id) return;

      const embed = new Discord.MessageEmbed()
        //.setTitle("Title")
        .setAuthor(data.user.username, "http://icons.iconarchive.com/icons/paomedia/small-n-flat/64/sign-ban-icon.png")
        .setColor(0xFF00FF)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + data.moderatorName)
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
        //.addField("This is a field title, it can hold 256 characters")
        .addField("ID", data.user.id, true)
        .addField("Type", "WL Ban", true)
        .addField("Time", data.duration, true);
      //.addBlankField(true);

      bot.channels.get("487985043776733185").send({embed});

      await bot.utils.updateRDJ(data.user.id);
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
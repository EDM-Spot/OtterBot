const { isNil } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: bot.plug.events.CHAT_LEVEL_UPDATE,
    platform,
    _filename: filename,
    run: async (data) => {
      if (isNil(data)) return;

      if (data.user.id === bot.plug.getSelf().id) return;

      const embed = new Discord.RichEmbed()
        //.setTitle("Title")
        .setAuthor(data.user, "http://www.myiconfinder.com/uploads/iconsets/64-64-60eade7f184e696a79fa2ff1e81c851d.png")
        .setColor(0xFF00FF)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + data.user.username)
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
        //.addField("This is a field title, it can hold 256 characters")
        .addField("Update", "Chat Level", true)
        .addField("Data", data.level, true);
      //.addBlankField(true);

      bot.channels.get("486637288923725824").send({embed});
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
const { isNil } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: bot.plug.events.MODERATE_STAFF,
    platform,
    _filename: filename,
    run: async (data) => {
      if (isNil(data)) return;

      if (data.moderator.id === bot.plug.getSelf().id) return;
      if (data.users.length <= 0) return;

      const embed = new Discord.RichEmbed()
        //.setTitle("Title")
        .setAuthor(data.users.map((item) => { if (item.user != null) { return `${item.user.username}`;
        }}), "http://www.myiconfinder.com/uploads/iconsets/64-64-60eade7f184e696a79fa2ff1e81c851d.png")
        .setColor(0xFF00FF)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + data.moderator.username)
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
        //.addField("This is a field title, it can hold 256 characters")
        .addField("Update", "Role", true)
        .addField("Data", data.users.map((item) => { if (item.user != null) { return `${item.role}`; }}), true);
      //.addBlankField(true);

      bot.channels.get("486637288923725824").send({embed});

      await bot.utils.updateRDJ(data.users.map((item) => { if (item.user != null) { return `${item.user.id}`; }})[0]);
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
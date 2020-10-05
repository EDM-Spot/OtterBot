const { isObject, isNil } = require("lodash");
const Discord = require("discord.js");

module.exports = function Event(bot, platform) {
  const event = {
    name: "modMute",
    platform,
    run: async (data) => {
      if (!isObject(data)) return;

      const userDB = await bot.db.models.users.findOne({ where: { username: data.username }});

      if (isNil(userDB)) { console.log(data); return; }

      const userID = userDB.get("id");

      try {
        await bot.db.models.bans.create({
          id: userID,
          type: "MUTE",
          duration: data.duration,
        });
      }
      catch (err) {
        console.warn(err);
        console.log(data);
      }

      if (data.moderator.id === bot.plug.me().id) return;

      const embed = new Discord.MessageEmbed()
        //.setTitle("Title")
        .setAuthor(data.username, "http://icons.iconarchive.com/icons/paomedia/small-n-flat/64/sign-ban-icon.png")
        .setColor(0xFF00FF)
        //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + data.moderator.username)
        //.setImage("http://i.imgur.com/yVpymuV.png")
        //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
        //.addField("This is a field title, it can hold 256 characters")
        .addField("ID", userID, true)
        .addField("Type", "Mute", true)
        .addField("Time", data.duration, true);
      //.addBlankField(true);

      bot.channels.cache.get("487985043776733185").send({embed});

      await bot.utils.updateRDJ(userID);
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
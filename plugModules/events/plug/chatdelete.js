//const { isObject } = require("lodash");
//const Discord = require("discord.js");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: 'chatDelete',
    platform,
    _filename: filename,
    run: async (del) => {
      await bot.db.models.messages.update({ deleted_by: del.user.id }, { where: { cid: del.cid } });

      //const userDB = await bot.db.models.messages.findOne({ where: { cid: cid }});

      //if (!isObject(userDB)) return;

      //const userId = userDB.get("id");
      //const username = userDB.get("username");
      //const message = userDB.get("message");

      //const users = bot.plug.getUsers();
      //const deletedbyUser = users.filter(u => u.id === deleted_by)[0];

      //if (deleted_by === bot.plug.getSelf().id) return;
      //if (deleted_by === cid) return;

      //const embed = new Discord.RichEmbed()
      //.setTitle("Title")
      //  .setAuthor(username, "https://www.shareicon.net/data/64x64/2017/06/21/887378_delete_512x512.png")
      //  .setColor(0xFF00FF)
      //.setDescription("This is the main body of text, it can hold 2048 characters.")
      //  .setFooter("By " + deletedbyUser.username)
      //.setImage("http://i.imgur.com/yVpymuV.png")
      //.setThumbnail("http://i.imgur.com/p2qNFag.png")
      //  .setTimestamp()
      //.addField("This is a field title, it can hold 256 characters")
      // .addField("Update", "Chat", true)
      //  .addField("ID", userId, true)
      //  .addField("Data", message, false);
      //.addBlankField(true);

      // Spam Channel
      //bot.channels.get("486637288923725824").send({embed});
    },
    init() {
      //bot.plug.on('connected', () => {
      bot.plug.on(this.name, this.run);
      //});
    },
    kill() {
      bot.plug.removeListener(this.name, this.run);
    },
  };

  bot.events.register(event);
};
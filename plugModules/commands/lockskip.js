const { isObject } = require("lodash");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["lockskip", "ls"],
    minimumPermission: 2000,
    cooldownType: "perUse",
    cooldownDuration: 4,
    parameters: "",
    description: "Executes a lockskip, which skips the current DJ and moves them back to the 3rd position to have another try.",
    async execute(rawData, { name }, lang) {
      const dj = bot.plug.dj();
			const currentMedia = bot.plug.historyEntry();

      const embed = new Discord.RichEmbed()
      //.setTitle("Title")
        .setAuthor(currentMedia.author + " - " + currentMedia.title, "http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-8/64/Skip-forward-icon.png")
        .setColor(0xFF00FF)
      //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + rawData.un)
      //.setImage("http://i.imgur.com/yVpymuV.png")
      //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
      //.addField("This is a field title, it can hold 256 characters")
        .addField("ID", dj.id, true)
        .addField("User ", dj.username, true)
        .addField("Lock Skipped", " (youtube.com/watch?v=" + currentMedia.cid + ")", false);
      //.addBlankField(true);

      bot.channels.get("486637288923725824").send({embed});

      if (isObject(dj) && isObject(currentMedia)) {
        await bot.utils.lockskip(dj);
        this.reply(lang.moderation.effective, {
          mod: rawData.un,
          command: `!${name}`,
          user: dj.username,
        }, 6e4);
        return true;
      }

      return false;
    },
  });
};
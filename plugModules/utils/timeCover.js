const Discord = require("discord.js");

module.exports = function Util(bot) {
  const util = {
    name: "timeCover",
    function: async () => {
      const usersCount = bot.plug.getUsers().length;
      const modsOnline = bot.plug.getStaff().join(", ");
      
      const embed = new Discord.RichEmbed()
        .setAuthor("Time Cover Utility", "http://icons.iconarchive.com/icons/hamzasaleem/stock-apps-style-2-part-2/64/Time-Machine-icon.png")
        .setColor(0xFF00FF)
        .setFooter("By TheOtterBot")
        .setTimestamp()
        .addField("Users Online", usersCount, true)
        .addField("Mods Online", modsOnline, true);

      bot.channels.get("536278824753561630").send({embed});
    },
  };

  bot.utils.register(util);
};
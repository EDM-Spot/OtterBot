const Discord = require("discord.js");
const { ROLE } = require("miniplug");

module.exports = function Util(bot) {
  const util = {
    name: "timeCover",
    function: async () => {
      const usersCount = bot.plug.users().length;

      const users = bot.plug.users();
      const modsOnline = users.filter(u => u.role === ROLE.DJ || ROLE.BOUNCER || ROLE.MANAGER || ROLE.COHOST || ROLE.HOST).join(", ");

      const embed = new Discord.MessageEmbed()
        .setAuthor("Time Cover Utility", "http://icons.iconarchive.com/icons/hamzasaleem/stock-apps-style-2-part-2/64/Time-Machine-icon.png")
        .setColor(0xFF00FF)
        .setFooter("By TheOtterBot")
        .setTimestamp()
        .addField("Users Online", usersCount, true)
        .addField("Mods Online", modsOnline, true);

      bot.channels.cache.get("536278824753561630").send({embed});
    },
  };

  bot.utils.register(util);
};
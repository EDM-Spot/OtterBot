const { isObject } = require("lodash");
const { ROOM_ROLE } = require("plugapi");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["cmdban"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<@username> [s|h|hour|short|l|d|day|long|f|p|perma|forever]",
    description: "Bans the specified user from using specific commands for the specified duration (hour, day or forever) or defaults to hour.",
    async execute(rawData, { args, name }, lang) {
      if (!args.length || args.join(" ").charAt(0) !== "@") {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      let banDuration = args.pop();
      const durations = {
        s: "h",
        h: "h",
        hour: "h",
        short: "h",
        l: "d",
        d: "d",
        day: "d",
        long: "d",
        f: "f",
        p: "f",
        perma: "f",
        forever: "f",
      };

      if (!Object.keys(durations).includes(banDuration)) {
        args.push(banDuration);
        banDuration = "h";
      }

      if (!args.length || args.join(" ").charAt(0) !== "@") {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const username = args.join(" ").substr(1);
      const users = bot.plug.getUsers();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
				users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

      if (!isObject(user)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      } else if (user.id === rawData.uid) {
        this.reply(lang.moderation.onSelf, { command: `!${name}` }, 6e4);
        return false;
      } else if (user.role >= ROOM_ROLE.BOUNCER) {
        this.reply(lang.moderation.onStaff, {}, 6e4);
        return false;
      }
      
      const embed = new Discord.RichEmbed()
      //.setTitle("Title")
        .setAuthor(user.username, "http://icons.iconarchive.com/icons/paomedia/small-n-flat/64/sign-ban-icon.png")
        .setColor(0xFF00FF)
      //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + rawData.from.username)
      //.setImage("http://i.imgur.com/yVpymuV.png")
      //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
      //.addField("This is a field title, it can hold 256 characters")
        .addField("ID", user.id, true)
        .addField("Type", "CMD Ban", true)
        .addField("Time", banDuration, true)
      //.addBlankField(true);

      bot.channels.get("485173444330258454").send({embed});
      bot.channels.get("486637288923725824").send({embed});

      await bot.db.models.cmdbans.findOrCreate({
        where: {
          id: user.id,
          time: bot.moment(),
          duration: banDuration,
        },
        defaults: { id: user.id },
      });
      this.reply(lang.moderation.effective, {
        mod: rawData.un,
        command: `!${name}`,
        user: user.username,
      }, 6e4);
      return false;
    },
  });
};
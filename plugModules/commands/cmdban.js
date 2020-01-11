const { isObject, isEmpty } = require("lodash");
const { ROLE } = require("miniplug");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["cmdban"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<@username> [s|h|hour|short|l|d|day|long|f|p|perma|forever] <reason>",
    description: "Bans the specified user from using specific commands for the specified duration (hour, day or forever).",
    async execute(rawData, { args, mentions, name }, lang) {
      if (!mentions.length || mentions.length >= 2) {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const user = mentions[0];
      
      const moderator = await rawData.getUser();
      const moderatorRole = await bot.utils.getRole(moderator);
      
      if (!isObject(user)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      } else if (user.id === rawData.uid) {
        this.reply(lang.moderation.onSelf, { command: `!${name}` }, 6e4);
        return false;
      } else if ((user.role >= ROLE.BOUNCER && moderatorRole < ROLE.MANAGER) || user.gRole >= ROLE.SITEMOD) {
        this.reply(lang.moderation.onStaff, {}, 6e4);
        return false;
      }

      const durationArgs = args.slice(1).shift();
      let apiDuration;
      let timeSelected = true;
      let reason;

      switch (durationArgs) {
        case "hour":
        case "h":
          apiDuration = "h";
          break;
        case "day":
        case "d":
          apiDuration = "d";
          break;
        case "perma":
        case "p":
          apiDuration = "f";
          break;
        default:
          apiDuration = "h";
          timeSelected = false;
          break;
      }

      if (timeSelected) {
        reason = args.slice(2).join(" ");
      }
      else
      {
        reason = args.slice(1).join(" ");
      }

      if (isEmpty(reason) || reason.trim() === "" || reason.length < 2) {
        this.reply(lang.moderation.needReason, {}, 6e4);
        return false;
      }
      
      const embed = new Discord.RichEmbed()
      //.setTitle("Title")
        .setAuthor(user.username, "http://icons.iconarchive.com/icons/paomedia/small-n-flat/64/sign-ban-icon.png")
        .setColor(0xFF00FF)
      //.setDescription("This is the main body of text, it can hold 2048 characters.")
        .setFooter("By " + rawData.un)
      //.setImage("http://i.imgur.com/yVpymuV.png")
      //.setThumbnail("http://i.imgur.com/p2qNFag.png")
        .setTimestamp()
      //.addField("This is a field title, it can hold 256 characters")
        .addField("ID", user.id, true)
        .addField("Type", "CMD Ban", true)
        .addField("Time", apiDuration, true)
        .addField("Reason", reason, false);
      //.addBlankField(true);

      bot.channels.get("485173444330258454").send({embed});
      bot.channels.get("486637288923725824").send({embed});

      await bot.db.models.cmdbans.findOrCreate({
        where: {
          id: user.id,
          time: bot.moment(),
          duration: apiDuration,
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
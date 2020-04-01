const { isObject, isEmpty } = require("lodash");
const { ROLE, MUTE_DURATION, MUTE_REASON } = require("miniplug");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["mute"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<@username> [15|s|short|30|m|medium|45|l|long] <reason>",
    description: "Mutes the specified user for the specified duration, or defaults to 15 minutes.",
    async execute(rawData, { args, name, mentions }, lang) { // eslint-disable-line no-unused-vars
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
        case "15":
        case "s":
        case "short":
          apiDuration = MUTE_DURATION.SHORT;
          break;
        case "30":
        case "m":
        case "medium":
          apiDuration = MUTE_DURATION.MEDIUM;
          break;
        case "45":
        case "l":
        case "long":
          apiDuration = MUTE_DURATION.LONG;
          break;
        default:
          apiDuration = MUTE_DURATION.SHORT;
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

      const embed = new Discord.MessageEmbed()
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
        .addField("Type", "Mute", true)
        .addField("Time", apiDuration, true)
        .addField("Reason", reason, false);
      //.addBlankField(true);

      bot.channels.cache.get("485173444330258454").send({embed});
      bot.channels.cache.get("486637288923725824").send({embed});
      
      if (user.role < ROLE.BOUNCER && user.gRole < ROLE.SITEMOD) {
        const { role } = user;
        
        await user.setRole(0);
        await user.mute(apiDuration, MUTE_REASON.VIOLATING_RULES);
        await user.setRole(role);
        
        this.reply(lang.moderation.effective, {
          mod: rawData.un,
          command: `!${name}`,
          user: user.username,
        });
        return true;
      }

      await user.mute(apiDuration, MUTE_REASON.VIOLATING_RULES);
      this.reply(lang.moderation.effective, {
        mod: rawData.un,
        command: `!${name}`,
        user: user.username,
      });
      return true;
    },
  });
};
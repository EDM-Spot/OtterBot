const { isObject, isEmpty } = require("lodash");
const { ROOM_ROLE, GLOBAL_ROLES } = require("plugapi");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["mute"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<@username> [15|s|short|30|m|medium|45|l|long] <reason>",
    description: "Mutes the specified user for the specified duration, or defaults to 15 minutes.",
    async execute(rawData, { args, name }, lang) { // eslint-disable-line no-unused-vars
      if (!rawData.mentions.length || rawData.mentions.length >= 2) {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const user = rawData.mentions[0];
      
      if (!isObject(user)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      } else if (user.id === rawData.from.id) {
        this.reply(lang.moderation.onSelf, { command: `!${name}` }, 6e4);
        return false;
      } else if ((user.role >= ROOM_ROLE.BOUNCER && rawData.from.role <= ROOM_ROLE.MANAGER) || user.gRole >= GLOBAL_ROLES.MODERATOR) {
        this.reply(lang.moderation.onStaff, {}, 6e4);
        return false;
      }

      const durationArgs = rawData.args.slice(1).shift();
      let apiDuration;
      let timeSelected = true;
      let reason;

      switch (durationArgs) {
        case "15":
        case "s":
        case "short":
          apiDuration = bot.plug.MUTE.SHORT;
          break;
        case "30":
        case "m":
        case "medium":
          apiDuration = bot.plug.MUTE.MEDIUM;
          break;
        case "45":
        case "l":
        case "long":
          apiDuration = bot.plug.MUTE.LONG;
          break;
        default:
          apiDuration = bot.plug.MUTE.SHORT;
          timeSelected = false;
          break;
      }

      if (timeSelected) {
        reason = rawData.args.slice(2).join(" ");
      }
      else
      {
        reason = rawData.args.slice(1).join(" ");
      }

      if (isEmpty(reason)) {
        this.reply(lang.moderation.needReason, {}, 6e4);
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
        .addField("Type", "Mute", true)
        .addField("Time", apiDuration, true)
        .addField("Reason", reason, false);
      //.addBlankField(true);

      bot.channels.get("485173444330258454").send({embed});
      bot.channels.get("486637288923725824").send({embed});
      
      if (user.role < ROOM_ROLE.BOUNCER && user.gRole < GLOBAL_ROLES.MODERATOR) {
        const { role } = user;
        
        await bot.plug.moderateSetRole(user.id, ROOM_ROLE.NONE);
        await bot.plug.moderateMuteUser(user.id, bot.plug.MUTE_REASON.VIOLATING_COMMUNITY_RULES, apiDuration);
        await bot.plug.moderateSetRole(user.id, role);
        
        this.reply(lang.moderation.effective, {
          mod: rawData.from.username,
          command: `!${name}`,
          user: user.username,
        });
        
        return true;
      }

      await bot.moderateMuteUser(user.id, bot.plug.MUTE._REASON.VIOLATING_COMMUNITY_RULES, apiDuration);
      this.reply(lang.moderation.effective, {
        mod: rawData.from.username,
        command: `!${name}`,
        user: user.username,
      });
      return true;
    },
  });
};
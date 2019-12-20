const { isObject, isEmpty } = require("lodash");
const { ROLE, WAITLIST_BAN_DURATION, WAITLIST_BAN_REASON } = require("miniplug");
const Discord = require("discord.js");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["wlban"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<@username> [s|short|h|hour|d|day|p|perma] <reason>",
    description: "Bans the specified user for the specified duration from the WaitList.",
    async execute(rawData, { args, name }, lang) { // eslint-disable-line no-unused-vars
      if (!args.length || args.join(' ').charAt(0) !== '@') {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const user = bot.plug.userByName(args.join(' ').substr(1));
      
      if (!isObject(user)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      } else if (user.id === rawData.uid) {
        this.reply(lang.moderation.onSelf, { command: `!${name}` }, 6e4);
        return false;
      } else if ((user.role >= ROLE.BOUNCER && await bot.utils.getRole(rawData.getUser) < ROLE.MANAGER) || user.gRole >= ROLE.SITEMOD) {
        this.reply(lang.moderation.onStaff, {}, 6e4);
        return false;
      }

      const durationArgs = rawData.args.slice(1).shift();
      let apiDuration;
      let timeSelected = true;
      let reason;

      switch (durationArgs) {
        case "short":
        case "s":
          apiDuration = WAITLIST_BAN_DURATION.SHORT;
          break;
        case "hour":
        case "h":
          apiDuration = WAITLIST_BAN_DURATION.MEDIUM;
          break;
        case "day":
        case "d":
          apiDuration = WAITLIST_BAN_DURATION.LONG;
          break;
        case "perma":
        case "p":
          apiDuration = WAITLIST_BAN_DURATION.PERMA;
          break;
        default:
          apiDuration = WAITLIST_BAN_DURATION.SHORT;
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
        .addField("Type", "WLBan", true)
        .addField("Time", apiDuration, true)
        .addField("Reason", reason, false);
      //.addBlankField(true);

      bot.channels.get("485173444330258454").send({embed});
      bot.channels.get("486637288923725824").send({embed});

      await bot.plug.waitlistBan(user.id, apiDuration, WAITLIST_BAN_REASON.ATTITUDE);
      this.reply(lang.moderation.effective, {
        mod: rawData.un,
        command: `!${name}`,
        user: user.username,
      });
      return true;
    },
  });
};
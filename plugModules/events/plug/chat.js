const { each, isNil } = require("lodash");
const moment = require("moment");
const Discord = require("discord.js");
const { ROLE } = require("miniplug");

module.exports = function Event(bot, platform) {
  const event = {
    name: "chat",
    platform,
    run: async (rawData) => {
      const commandHandleRegex = /^(\/(em|me)\s)?!/;
      const emoteRegex = /^\/(em|me)\s/;
      rawData.timestamp = Date.now();

      const message = await bot.db.models.messages.create({
        id: rawData.uid,
        cid: rawData.id,
        username: rawData.un,
        message: rawData.message,
      });

      try {
        await bot.db.models.users.update(
          { username: rawData.un, last_seen: moment() },
          { where: { id: rawData.uid }, defaults: { id: rawData.uid } }
        );
      }
      catch (err) {
        console.warn(err);
        console.log(rawData);
      }

      if (/(skip pls)|(pls skip)|(skip this shit)|(mods skip this)|(nigger)|(faggot)/ig.test(rawData.message)) {
        await rawData.delete();
        return;
      }

      if (commandHandleRegex.test(rawData.message)) {
        const splitMessage = rawData.message.replace(emoteRegex, "").split(" ");

        const cmd = rawData.message.split(" ")[0];
        let messageArgs = rawData.message.substr(cmd.length + 1);

        let i;
        const random = Math.ceil(Math.random() * 1E10);
        const messageMentions = [];

        if (!isNil(messageArgs)) {
          let lastIndex = -1;
          let allUsers = bot.plug.users;

          if (allUsers.length > 0) {
            allUsers = allUsers.sort((a, b) => {
              if (Object.is(a.username.length, b.username.length)) {
                return 0;
              }

              return a.username.length < b.username.length ? -1 : 1;
            });

            for (const user of allUsers) {
              lastIndex = messageArgs.toLowerCase().indexOf(user.username.toLowerCase());

              console.log(lastIndex);
              if (lastIndex > -1) {
                console.log(user.username);

                messageArgs = `${messageArgs.substr(0, lastIndex).replace("@", "")}%MENTION-${random}-${messageMentions.length}% ${messageArgs.substr(lastIndex + user.username.length + 1)}`;
                messageMentions.push(user);
              }
            }
          }

          messageArgs = messageArgs.split(" ").filter((item) => item != null && !Object.is(item, ""));

          for (i = 0; i < messageArgs.length; i++) {
            if (isFinite(Number(messageArgs[i])) && !Object.is(messageArgs[i], "")) {
              messageArgs[i] = Number(messageArgs[i]);
            }
          }
        }

        console.log(messageMentions);
        if (messageMentions.length > 0) {
          for (i = 0; i < messageMentions.length; i++) {
            const atIndex = messageArgs.indexOf(`@%MENTION-${random}-${i}%`);
            const normalIndex = messageArgs.indexOf(`%MENTION-${random}-${i}%`);

            if (normalIndex > -1) {
              messageArgs[normalIndex] = messageMentions[i];
            }
            if (atIndex > -1) {
              messageArgs[atIndex] = messageMentions[i];
            }
          }
        }

        console.log("Mentions " + messageMentions);
        console.log("OriginalArgs " + splitMessage.splice(1));
        console.log("NewArgs " + messageArgs);

        const command = {
          name: splitMessage[0].replace(commandHandleRegex, "").toLowerCase(),
          args: splitMessage.splice(1),
          mentions: messageMentions,
          platform,
        };

        each(bot.plugCommands.getLoaded(), async (registeredCommand) => {
          if (registeredCommand.names.includes(command.name)) {
            await message.update({ command: true });
            command.registeredCommand = registeredCommand;
            new bot.plugCommands.Class(bot, rawData, command);
          }
        });
      }

      const dubtrack = /^(?=.*join)(?=.*dubtrack.fm)/i;
      const plug = /(plug\.dj\/)(?!edmspot\b|about\b|ba\b|forgot-password\b|founders\b|giftsub\/\d|jobs\b|legal\b|merch\b|partners\b|plot\b|privacy\b|purchase\b|subscribe\b|team\b|terms\b|press\b|_\/|@\/|!\/)(.+)/i;

      if (rawData.role >= ROLE.DJ || rawData.gRole >= ROLE.SITEMOD) {
        if (dubtrack.test(rawData.message) || plug.test(rawData.message)) {
          await rawData.delete();
          //await bot.plug.moderateBanUser(rawData.from.id, bot.plug.BAN_REASON.NEGATAIVE_ATTITUDE, bot.plug.BAN.PERMA);

          const embed = new Discord.RichEmbed()
            .setAuthor(rawData.un, "http://icons.iconarchive.com/icons/paomedia/small-n-flat/64/sign-ban-icon.png")
            .setColor(0xFF00FF)
            .setFooter("By OtterBot")
            .setTimestamp()
            .addField("ID", rawData.uid, true)
            .addField("Warning", "Promote other room", false)
            .addField("Message", rawData.message, false);

          bot.channels.get("485173444330258454").send({ embed });
          bot.channels.get("486637288923725824").send({ embed });
        }
      }

      if (/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(rawData.message)) {
        setTimeout(() => rawData.delete(), 3e5);
      }

      //bot.channels.get("486125808553820160").send(rawData.from.username + ": " + rawData.message);

      if (!commandHandleRegex.test(rawData.message)) {
        if (isNil(bot.lottery.timer)) return;
        if (bot.lottery.timer.isStarted) {
          if (rawData.uid !== bot.plug.me().id) {
            if (moment().valueOf() > bot.lottery.canJoinDate.valueOf()) {
              bot.lottery.add(rawData.uid);
            }
          }
        }
      }
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
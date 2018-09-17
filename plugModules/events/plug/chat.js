const { each, isNaN } = require("lodash");
const moment = require("moment");

module.exports = function Event(bot, platform) {
  const event = {
    name: bot.plug.events.CHAT,
    platform,
    run: async (rawData) => {
      const commandHandleRegex = /^(\/(em|me)\s)?!/;
      const emoteRegex = /^\/(em|me)\s/;
      rawData.timestamp = Date.now();
      
      const message = await bot.db.models.messages.create({
        id: rawData.from.id,
        cid: rawData.id,
        username: rawData.from.username,
        message: rawData.message,
      });
      
      await bot.db.models.users.update(
        { username: rawData.from.username },
        { where: { id: rawData.from.id }, defaults: { id: rawData.from.id }}
      );

      if (/(skip pls)|(pls skip)|(skip this shit)|(mods skip this)|(nigger)|(faggot)/ig.test(rawData.message)) {
        await bot.plug.moderateDeleteChat(rawData.id);
        return;
      }

      if (!commandHandleRegex.test(rawData.message)) {
        if (bot.lottery.timer.isStarted) {
          if (rawData.from.id !== bot.plug.getSelf().id) {
            if (moment().valueOf() > bot.lottery.canJoinDate.valueOf()) {
              bot.lottery.add(rawData.from.id);
            }
          }
        }
      }

      if (commandHandleRegex.test(rawData.message)) {
        const splitMessage = rawData.message.replace(emoteRegex, "").split(" ");
        const command = {
          name: splitMessage[0].replace(commandHandleRegex, "").toLowerCase(),
          args: splitMessage.splice(1),
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

      if (/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(rawData.message)) {
        setTimeout(() => bot.plug.moderateDeleteChat(rawData.id), 3e5);
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
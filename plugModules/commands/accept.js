const { isNil } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["accept"],
    minimumPermission: 0,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "",
    description: "Accept if someone gives you the position in the waitlist.",
    async execute(rawData, command, lang) { // eslint-disable-line no-unused-vars
      const byID = await bot.redis.findGivePositionTo(rawData.raw.uid);

      if (isNil(byID)) {
        return false;
      }

      const byUser = bot.plug.getUser(parseInt(byID));
      const toUser = bot.plug.getUser(rawData.raw.uid);

      const byPosition = bot.plug.getWaitListPosition(byUser.id);
      const toPosition = bot.plug.getWaitListPosition(rawData.raw.uid);

      if (byUser.id === bot.plug.getSelf().id) {
        bot.lottery.accepted();
      }

      if (byPosition < 1 || toPosition < 1) {
        this.reply(lang.give.notInList, {}, 6e4);
        return false;
      }

      if (byPosition > toPosition) {
        this.reply(lang.give.behindPosition, {}, 6e4);
        return false;
      }

      //console.log(`Moving ${rawData.raw.uid} to ${byPosition} and ${byID} to ${toPosition}`);

      if (byUser.id !== bot.plug.getSelf().id) {
        bot.queue.add(byUser, toPosition);
      }
      await bot.wait(1000);
      bot.queue.add(toUser, byPosition);

      await bot.redis.removeGivePosition(byUser.id, rawData.raw.uid);

      return true;
    },
  });
};
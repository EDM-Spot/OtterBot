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
      const byID = await bot.redis.findGivePositionTo(rawData.uid);

      if (isNil(byID)) {
        return false;
      }

      const byUser = bot.plug.getUser(parseInt(byID));
      const toUser = bot.plug.getUser(rawData.uid);

      if (isNil(byUser) || isNil(toUser)) {
        return false;
      }

      const byPosition = bot.plug.waitlist().positionOf(byUser.id);
      const toPosition = bot.plug.waitlist().positionOf(rawData.uid);

      if (byUser.id === bot.plug.me().id) {
        bot.lottery.accepted();
        bot.queue.add(toUser, 5);
        await bot.redis.removeGivePosition(byUser.id, rawData.uid);
        return true;
      }

      if (byPosition < 1 || toPosition < 1) {
        this.reply(lang.give.notInList, {}, 6e4);
        return false;
      }

      if (byPosition > toPosition) {
        this.reply(lang.give.behindPosition, {}, 6e4);
        return false;
      }

      //console.log(`Moving ${rawData.from.id} to ${byPosition} and ${byID} to ${toPosition}`);

      bot.queue.add(byUser, toPosition);
      await bot.wait(1000);
      bot.queue.add(toUser, byPosition);

      await bot.redis.removeGivePosition(byUser.id, rawData.uid);

      return true;
    },
  });
};
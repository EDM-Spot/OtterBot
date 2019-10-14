const { isObject } = require("lodash");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: bot.plug.events.VOTE,
    platform,
    _filename: filename,
    run: async () => {
      const dj = bot.plug.getDJ();

      if (!isObject(dj)) return;

      const mehCount   = bot.plug.getRoomScore().negative;
      const usersCount = bot.plug.getUsers().length;
      const mehPercent = Math.round((mehCount / usersCount) * 100);

      if (mehPercent >= 6 && mehCount >= 3) {
        bot.global.isSkippedByMehGuard = true;
        
        await bot.plug.sendChat(`@${dj.username} ` + bot.lang.mehSkip);
        await bot.plug.moderateForceSkip();
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
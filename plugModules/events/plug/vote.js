const { isObject } = require("lodash");

module.exports = function Event(bot, filename, platform) {
  const event = {
    name: "vote",
    platform,
    _filename: filename,
    run: async () => {
      const currentMedia = bot.plug.historyEntry();
      const dj = bot.plug.dj();

      if (!isObject(dj)) return;

      const mehCount   = bot.plug.score().negative;
      const usersCount = bot.plug.users().length;
      const mehPercent = Math.round((mehCount / usersCount) * 100);

      if (mehPercent >= 6 && mehCount >= 3) {
        bot.global.isSkippedByMehGuard = true;
        
        bot.plug.chat(`@${dj.username} ` + bot.lang.mehSkip);
        await currentMedia.skip();
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
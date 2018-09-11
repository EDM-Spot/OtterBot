module.exports = function Event(bot, filename, platform) {
  const event = {
    name: bot.plug.events.VOTE,
    platform,
    _filename: filename,
    run: async () => {
      const dj = bot.plug.getDJ();

      const mehCount = bot.plug.getRoomScore().negative;
      const usersCount = bot.plug.getUsers().length;

      const mehRule = Math.round((usersCount/100)*8);

      if (mehCount >= mehRule) {
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
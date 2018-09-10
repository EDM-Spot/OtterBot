module.exports = function Event(bot, filename, platform) {
  const event = {
    name: bot.plug.events.VOTE,
    platform,
    _filename: filename,
    run: async () => {
      const dj = bot.plug.getDJ();
      const score = {
        mehCount: bot.plug.getRoomScore().negative,
        usersCount: bot.plug.getUsers().length,
      };

      switch (true) {
        case ((score.usersCount >= 0 && score.usersCount <= 150) && score.mehCount >= 5):
        case ((score.usersCount >= 151 && score.usersCount <= 250) && score.mehCount >= 10):
        case ((score.usersCount >= 251 && score.usersCount <= 500) && score.mehCount >= 15):
        case (score.usersCount >= 501 && score.mehCount >= 20):
          await bot.plug.sendChat(`@${dj.username} ` + bot.lang.mehSkip);
          await bot.plug.moderateForceSkip();
          break;
        default:
          break;
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
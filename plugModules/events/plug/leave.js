const moment = require("moment");

module.exports = function Event(bot, platform) {
  const event = {
    name: bot.plug.events.USER_LEAVE,
    platform,
    run: async (user) => {
      await bot.db.models.users.update(
        { username: user.username, last_seen: moment() },
        { where: { id: user.id }, defaults: { id: user.id }}
      );

      bot.queue.remove(user);
      await bot.redis.removeGivePosition(user.id);
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
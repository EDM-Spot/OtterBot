const { isNil } = require("lodash");
const moment = require("moment");

module.exports = function Event(bot, platform) {
  const event = {
    name: "userLeave",
    platform,
    run: async (user) => {
      if (isNil(user.username) || user.guest || user.id === bot.plug.me().id) return;

      try {
        await bot.db.models.users.update(
          { username: user.username, last_seen: moment() },
          { where: { id: user.id }, defaults: { id: user.id }}
        );
      }
      catch (err) {
        console.warn(err);
        console.log(user);
      }

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
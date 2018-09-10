module.exports = function Event(bot, platform) {
  const event = {
    name: bot.plug.events.USER_LEAVE,
    platform,
    run: async (user) => {
      bot.queue.remove(user);
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
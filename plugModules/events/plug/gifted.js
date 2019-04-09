const { isNil } = require("lodash");

module.exports = function Event(bot, platform) {
  const event = {
    name: bot.plug.events.GIFTED,
    platform,
    run: async (data) => {
      if (isNil(data)) return;

      console.log(data);
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
const { isObject } = require("lodash");

module.exports = function Event(bot, platform) {
  const event = {
    name: "modRemoveDj",
    platform,
    run: async (data) => {
      if (data.inBooth) return;

      const userDB = await bot.db.models.users.findOne({ where: { username: data.user }});
      const userID = userDB.get("id");

      if (!isObject(data)) return;

      await bot.redis.removeDisconnection(userID);
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
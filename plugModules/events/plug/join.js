const { isNil, isNaN } = require("lodash");
const moment = require("moment");

module.exports = function Event(bot, platform) {
  const event = {
    name: "userJoin",
    platform,
    run: async (data) => {
      if (isNil(data.username) || data.guest || data.id === bot.plug.me().id) return;
      
      const position = parseInt(await bot.redis.findDisconnection(data.id), 10);

      await bot.db.models.users.findOrCreate({
        where: { id: data.id }, defaults: { id: data.id, username: data.username },
      });
      
      try {
        await bot.db.models.users.update(
          { username: data.username, last_seen: moment() },
          { where: { id: data.id }, defaults: { id: data.id }}
        );
      }
      catch (err) {
        console.warn(err);
        console.log(data);
      }
      
      if (isNil(position) || isNaN(position))	return;

      const waitlist = bot.plug.waitlist();
      
      if (waitlist.length <= position && !waitlist.contains(data.id)) {
        bot.plug.chat(`@${data.username} ` + bot.lang.commands.dc.waitlistSmaller);
        bot.queue.add(data, waitlist.length);
      } else if (waitlist.contains(data.id) && waitlist.positionOf(data.id) <= position) {
        bot.plug.chat(`@${data.username} ` + bot.lang.commands.dc.sameOrLower);
      } else {
        bot.queue.add(data, position);
        bot.plug.chat(`@${data.username} ` + bot.utils.replace(bot.lang.commands.dc.placeBack, {
          position: position,
          when: waitlist.length === 50 ?
            bot.lang.commands.dc.whenPossible : bot.lang.commands.dc.now,
        }));
      }
      
      await bot.redis.removeDisconnection(data.id);
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
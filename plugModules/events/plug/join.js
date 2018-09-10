const { isNil, isNaN } = require("lodash");

module.exports = function Event(bot, platform) {
  const event = {
    name: bot.plug.events.USER_JOIN,
    platform,
    run: async (data) => {
      if (isNil(data.username) || data.id === bot.plug.getSelf().id) return;
      
      const position = parseInt(await bot.redis.findDisconnection(data.id), 10);
      
      const user = bot.plug.getUser(data.id);
      await bot.db.models.users.findOrCreate({
        where: { id: user.id }, defaults: { id: user.id, username: user.username },
      });
      
      await bot.db.models.users.update(
        { username: user.username },
        { where: { id: user.id }, defaults: { id: user.id }}
      );
      
      if (isNil(position) || isNaN(position))	return;

      const waitlist = bot.plug.getWaitList();
      
      if (waitlist.length <= position && bot.plug.getWaitListPosition(user.id) === -1) {
        await bot.plug.sendChat(`@${user.username} ` + bot.lang.commands.dc.waitlistSmaller);
        bot.queue.add(user, waitlist.length);
      } else if (bot.plug.getWaitListPosition(user.id) !== -1 && bot.plug.getWaitListPosition(user.id) <= position) {
        await bot.plug.sendChat(`@${user.username} ` + bot.lang.commands.dc.sameOrLower);
      } else {
        bot.queue.add(user, position);
        await bot.plug.sendChat(`@${user.username} ` + bot.utils.replace(bot.lang.commands.dc.placeBack, {
          position: position,
          when: waitlist.length === 50 ?
            bot.lang.commands.dc.whenPossible : bot.lang.commands.dc.now,
        }));
      }
      
      await bot.redis.removeDisconnection(user.id);
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
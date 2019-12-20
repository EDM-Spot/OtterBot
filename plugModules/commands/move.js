const { isObject, isNaN } = require("lodash");

module.exports = function Command(bot) {
  bot.plugCommands.register({
    names: ["move"],
    minimumPermission: 2000,
    cooldownType: "none",
    cooldownDuration: 0,
    parameters: "<@username> <1-50>",
    description: "Moves the specified user to the specified waitlist position.",
    async execute(rawData, { args }, lang) { // eslint-disable-line no-unused-vars
      if (!args.length || args.join(" ").charAt(0) !== "@") {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const position = parseInt(args.pop(), 10);

      if (isNaN(position) || position < 1 || position > 50) {
        this.reply(lang.move.invalidPosition, {}, 6e4);
        return false;
      }

      if (!args.length || args.join(" ").charAt(0) !== "@") {
        this.reply(lang.invalidUser, {}, 6e4);
        return false;
      }

      const username = args.join(" ").substr(1);
      const users = bot.plug.users();
      const user = users.filter(u => u.username.toLowerCase() === username.toLowerCase())[0] ||
				users.filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

      if (!isObject(user)) {
        this.reply(lang.userNotFound, {}, 6e4);
        return false;
      }

      const dj = bot.plug.dj();

      if (isObject(dj) && dj.id === user.id) {
        this.reply(lang.moderation.isPlaying, {}, 6e4);
        return false;
      }

      const waitlist = bot.plug.waitlist();

      bot.queue.add(user, position);
      this.reply(lang.move.willMove, {
        user: user.username,
        position: position,
        when: waitlist.length === 50 ? lang.move.whenPossible : lang.move.now,
      }, 6e4);
      return true;
    },
  });
};
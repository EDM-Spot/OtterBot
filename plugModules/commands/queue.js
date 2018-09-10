module.exports = function (bot, filename) {
	bot.commands.register("queue", filename, [], 2000, true, {type: "per_use", duration: 10}, function (raw_data, command) {
		if (!command.args.length) {
			const queue = bot.utils.queue.users.map(e => e.user.username || e.user.id);
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: !queue.length ? "Empty" : queue
			})).delay(1e4).call("delete");
		}

		if (`${command.args[0]}`.toLowerCase() === "clear") {
			bot.utils.queue.users = [];
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.queue.cleared
			})).delay(1e4).call("delete");
		}
	}, {
		parameters: "[clear]",
		description: "Displays or clears the queue."
	});
};
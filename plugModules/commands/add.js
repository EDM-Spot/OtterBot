module.exports = function (bot, filename) {
	bot.commands.register("add", filename, ["adduser"], 2000, true, {type: "none", duration: 0}, function (raw_data, command) {
		if (!command.args.length)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.moderation.nouser
			})).delay(6e4).call("delete");
		else if (command.args.join(" ").charAt(0) !== "@")
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.moderation.invaliduser
			})).delay(6e4).call("delete");
		else {
			let username = command.args.join(" ").substr(1);
			let user = bot.plug.users().filter(u => u.username.toLowerCase() === username.toLowerCase())[0] || bot.plug.users().filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];
			
			if (!user)
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.moderation.usernotfound
				})).delay(6e4).call("delete");
			else {
				let position = 49;
				bot.utils.queue.add({user, position});

				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.utils.replace(bot.lang.commands.moderation.add, {
						mod: raw_data.un,
						user: user.username
					})
				}));
			}
		}
	}, {
		parameters: "<@username>",
		description: "Adds the specified user to the wait list."
	});
};
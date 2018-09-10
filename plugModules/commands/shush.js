module.exports = function (bot, filename) {
	bot.commands.register("shush", filename, ["sush", "noskip", "noskiperino"], 1000, true, {type: "per_use", duration: 60}, function (raw_data, command) {
		if (!command.args.length || command.args.join(" ").charAt(0) !== "@")
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.moderation.invaliduser
			})).delay(3e4).call("delete");
		else {
			let username = command.args.join(" ").substr(1);
			let user = bot.plug.users().filter(u => u.username.toLowerCase() === username.toLowerCase())[0] || bot.plug.users().filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

			if (!user)
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.moderation.usernotfound
				})).delay(3e4).call("delete");
			else
				return user.chat(bot.lang.commands.shush).delay(6e4).call("delete");
		}
	}, {
		parameters: "<@username>",
		description: "Calls out an user that asked for skips. Big no-no."
	});
};
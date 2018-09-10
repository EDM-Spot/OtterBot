module.exports = function (bot, filename) {
	bot.commands.register("cookie", filename, ["cookies"], 0, true, {type: "per_user", duration: 60}, function (raw_data, command) {
		if (!command.args.length || command.args.join(" ").charAt(0) !== "@")
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.cookie.invaliduser
			})).delay(3e4).call("delete");
		else {
			let username = command.args.join(" ").substr(1);
			let user = bot.plug.users().filter(u => u.username.toLowerCase() === username.toLowerCase())[0] || bot.plug.users().filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];
			
			if (!user)
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.cookie.usernotfound
				})).delay(3e4).call("delete");
			else
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.cookie.types[Math.floor(Math.random() * bot.lang.commands.cookie.types.length)], {
					receiver: user.mention(),
					sender: raw_data.un
				})).delay(6e4).call("delete");
		}
	}, {
		parameters: "<@username>",
		description: "Sends the specified user a cookie."
	});
};
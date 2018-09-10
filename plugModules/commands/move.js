module.exports = function (bot, filename) {
	bot.commands.register("move", filename, [], 2000, true, {type: "none", duration: 1}, function (raw_data, command) {
		if (!command.args.length)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.move.nouser
			})).delay(3e4).call("delete");
		else {
			let position = parseInt(command.args.pop());

			if (isNaN(position) || position < 1 || 50 < position)
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.move.invalidposition
				})).delay(3e4).call("delete");
			else {
				if (!command.args.length || command.args.join(" ").charAt(0) !== "@")
					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.lang.commands.move.invaliduser
					})).delay(3e4).call("delete");
				else {
					let username = command.args.join(" ").substr(1);
					let user = bot.plug.users().filter(u => u.username.toLowerCase() === username.toLowerCase())[0] || bot.plug.users().filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];

					if (!user)
						return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
							command: command.name,
							user: raw_data.un,
							message: bot.lang.commands.move.usernotfound
						})).delay(3e4).call("delete");
					else {
						let waitlist = bot.plug.waitlist();

						position = position - 1;
						
						bot.utils.queue.add({user, position});
						if (waitlist.length === 50) {
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.utils.replace(bot.lang.commands.move.addwhenpossible, {
									user: user.username,
									position: position + 1
								})
							}));
						} else {
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.utils.replace(bot.lang.commands.move.addnow, {
									user: user.username,
									position: position + 1
								})
							}));
						}
					}
				}
			}
		}
	}, {
		parameters: "<@username> <1-50>",
		description: "Moves the specified user to the specified waitlist position."
	});
};
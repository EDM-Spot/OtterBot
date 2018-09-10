module.exports = function (bot, filename) {
	bot.commands.register("kick", filename, [], 2000, true, {type: "none", duration: 1}, async function (raw_data, command) {
		if (!command.args.length)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.moderation.nouser
			})).delay(3e4).call("delete");
		else {
			let duration = command.args.pop();
			let durations = {
				"s": "h",
				"h": "h",
				"hour": "h",
				"short": "h",
				"l": "d",
				"d": "d",
				"day": "d",
				"long": "d"
			};

			if (!Object.keys(durations).includes(duration)) {
				command.args.push(duration);
				duration = "h";
			}

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
				else if (user.id === raw_data.uid)
					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.utils.replace(bot.lang.commands.moderation.onSelf, {
							command: `!${command.name}`
						})
					})).delay(3e4).call("delete");
				else if (user.role || user.gRole >= 2500)
					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.lang.commands.moderation.onStaff
					})).delay(3e4).call("delete");
				else {
					await user.ban(duration, 1);
					return await bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.utils.replace(bot.lang.commands.moderation.effective, {
							mod: raw_data.un,
							command: `!${command.name}`,
							user: user.username
						})
					}));
				}
			}
		}
	}, {
		parameters: "<@username> [s|h|hour|short|l|d|day|long]",
		description: "Kicks the specified user from the community for the specified duration (hour or day) or defaults to hour."
	});
};
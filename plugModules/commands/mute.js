module.exports = function (bot, filename) {
	bot.commands.register("mute", filename, [], 2000, true, {type: "none", duration: 1}, async function (raw_data, command) {
		if (!command.args.length)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.moderation.nouser
			})).delay(3e4).call("delete");
		else {
			let duration = command.args.pop();
			let durations = {
				"s": "s",
				"15": "s",
				"short": "s",
				"m": "m",
				"30": "m",
				"medium": "m",
				"l": "l",
				"45": "l",
				"long": "l"
			};

			if (!Object.keys(durations).includes(duration)) {
				command.args.push(duration);
				duration = "s";
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
				else if (user.role > 1000 || user.gRole >= 2500)
					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.lang.commands.moderation.onStaff
					})).delay(3e4).call("delete");
				else {
					if (user.role) {
						try {
							let role = user.role;
							await user.setRole(0);
							await user.mute(duration, 1);
							await user.setRole(role);
							return await bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.utils.replace(bot.lang.commands.moderation.effective, {
									mod: raw_data.un,
									command: `!${command.name}`,
									user: user.username
								})
							}));
						} catch (err) {
							console.error(err);
						}
					} else {
						await user.mute(duration, 1);
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
		}
	}, {
		parameters: "<@username> [15|s|short|30|m|medium|45|l|long]",
		description: "Mutes the specified user for the specified duration, or defaults to 15 minutes. When used on staff, it will first demote them."
	});
};
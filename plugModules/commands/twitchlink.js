module.exports = function (bot, filename) {
	bot.commands.register("twitchlink", filename, [], 0, true, {type: "per_user", duration: 150}, function (raw_data, command) {
		if (!command.args.length)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.twitchlink.info
			})).delay(6e4).call("delete");
		else {
			let key = command.args.shift();

			return bot.db.models.twitch_links.findOne({
				where: {
					key: key
				}
			}).then(instance => {
				if (instance === null || typeof instance === "undefined")
					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.lang.commands.twitchlink.invalidkey
					})).delay(6e4).call("delete");
				else {
					if (instance.get("plug"))
						return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
							command: command.name,
							user: raw_data.un,
							message: bot.lang.commands.twitchlink.alreadylinked
						})).delay(6e4).call("delete");
					else
						return instance.update({
							plug: raw_data.uid
						}).then(() => {
							if (raw_data.user.role === 0 && raw_data.user.gRole < 5000)
								return raw_data.user.setRole(1000).then(() => {
									return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
										command: command.name,
										user: raw_data.un,
										message: bot.lang.commands.twitchlink.linked
									})).delay(6e4).call("delete");
								}).catch(console.error);
							else
								return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
									command: command.name,
									user: raw_data.un,
									message: bot.lang.commands.twitchlink.linkednopromote
								})).delay(6e4).call("delete");
						}).catch(console.error);
				}

			}).catch(console.error);
		}
	}, {
		parameters: "<key>",
		description: "If the provided encrypted key matches the internal one, the bot will link your plug.dj account to your Twitch Account, which promotes you to Resident DJ in the community."
	});
};

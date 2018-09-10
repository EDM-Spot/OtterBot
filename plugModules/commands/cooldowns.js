module.exports = function (bot, filename) {
	bot.commands.register("cooldowns", filename, ["cd"], 4000, true, {type: "per_use", duration: 10}, function (raw_data, command) {
		if (!command.args.length)
			return bot.db.models.cooldowns.count({
				where: {
					command: {
						$iLike: "command:%"
					}
				}
			}).then(count => {
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.utils.replace(bot.lang.commands.cooldowns.status, {
						amount: count
					})
				})).delay(6e4).call("delete");
			});
		else {
			let action = command.args.shift().toLowerCase();
			let actions = ["check", "reset"];

			let identifier = command.args.shift().toLowerCase();

			if (!actions.includes(action))
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.cooldowns.invalidaction
				})).delay(6e4).call("delete");
			else if (typeof identifier !== "string")
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.cooldowns.invalididentifier
				})).delay(6e4).call("delete");
			else {
				switch (action) {
					case "check":
						return bot.db.models.cooldowns.findAll({
							where: {
								command: identifier
							}
						}).then(instances => {
							instances = instances.map(instance => instance.toJSON());

							if (!instances.length)
								return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
									command: command.name,
									user: raw_data.un,
									message: bot.lang.commands.cooldowns.checkfoundnone
								})).delay(6e4).call("delete");
							else
								return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
									command: command.name,
									user: raw_data.un,
									message: bot.utils.replace(bot.lang.commands.cooldowns.check, {
										cooldowns: instances.map(instance => `${instance.command.split(":")[1]} (${instance.id}, ${instance[0].type === "per_use" ? "per use" : "per user"}, ${Math.ceil(((+new Date(instance.created_at) + instance.length) - +new Date()) / 6e4)}m)`)
									})
								})).delay(6e4).call("delete");
						}).catch(console.error);
					case "reset":
						return bot.db.models.cooldowns.destroy({
							where: {
								command: identifier === "roulette" ? "roulette@start" : identifier
							}
						}).then(affectedRows => {
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.utils.replace(bot.lang.commands.cooldowns.reset, {
									command: identifier
								})
							})).delay(6e4).call("delete");
						}).catch(console.error);
				}
			}
		}
	}, {
		parameters: "[check <identifier>|reset <identifier>]",
		description: "Checks and resets command cooldowns."
	});
};
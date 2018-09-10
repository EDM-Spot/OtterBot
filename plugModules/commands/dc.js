module.exports = function (bot, filename) {
	bot.commands.register("dc", filename, ["dclookup"], 0, true, {type: "per_user", duration: 30}, function (raw_data, command) {
		let dj = bot.plug.dj();

		if (dj && dj.id === raw_data.uid)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.dc.isdj
			})).delay(6e4).call("delete");
		else {
			return bot.db.models.disconnections.findOne({
				where: {
					id: raw_data.uid
				}
			}).then(instance => {
				if (instance === null || typeof instance === "undefined")
					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.lang.commands.dc.nodc
					})).delay(6e4).call("delete");
				else {
					let waitlist = bot.plug.waitlist();

					if (waitlist.contains(raw_data.uid) && waitlist.positionOf(raw_data.uid) <= instance.get("position"))
						return instance.destroy().then(() => {
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.lang.commands.dc.sameorlower
							})).delay(6e4).call("delete");
						});
					else {
						if (waitlist.length === 50) {
							bot.utils.queue.add({user: bot.plug.user(raw_data.uid), position: instance.get("position")});
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.utils.replace(bot.lang.commands.dc.addwhenpossible, {
									position: instance.get("position") + 1,
									how_long: Math.ceil((+new Date() - +new Date(instance.get("updated_at"))) / 6e4),
									plural: Math.ceil((+new Date() - +new Date(instance.get("updated_at"))) / 6e4) > 1 ? "s" : ""
								})
							}));
						} else {
							bot.utils.queue.add({user: bot.plug.user(raw_data.uid), position: instance.get("position")});
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.utils.replace(bot.lang.commands.dc.addnow, {
									position: instance.get("position") + 1,
									how_long: Math.ceil((+new Date() - +new Date(instance.get("updated_at"))) / 6e4),
									plural: Math.ceil((+new Date() - +new Date(instance.get("updated_at"))) / 6e4) > 1 ? "s" : ""
								})
							}));
						}
					}
				}
			});
		}
	}, {
		parameters: "",
		description: "Checks the database to see if the user had a disconnection, if so, attempts to move the user back."
	});
};
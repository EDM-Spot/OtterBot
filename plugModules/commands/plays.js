const got = require("got");

module.exports = function (bot, filename) {
	bot.commands.register("plays", filename, ["lastplayed", "history"], 0, true, {type: "per_user", duration: 5}, function (raw_data, command) {
		if (!command.args.length) {
			let current_media = bot.plug.historyEntry();

			if (!current_media || !current_media.media)
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.plays.nosongplaying
				})).delay(6e4).call("delete");
			else {
				return bot.db.models.plays.findOne({
					where: {
						cid: current_media.media.cid,
						format: current_media.media.format
					},
					order: [["created_at", "DESC"]]
				}).then(instance => {
					if (instance === null || typeof instance === "undefined")
						return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
							command: command.name,
							user: raw_data.un,
							message: bot.lang.commands.plays.currentnever
						})).delay(6e4).call("delete");

					instance = instance.toJSON();

					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.utils.replace(bot.lang.commands.plays.currentlastwas, {
							how_long_ago: bot.moment(instance.created_at).fromNow()
						})
					})).delay(6e4).call("delete");
				}).catch(console.error);
			}
		} else {
			let link = command.args.shift();

			if (bot.youtube.getMediaID(link))
				return bot.db.models.plays.findOne({
					where: {
						cid: bot.youtube.getMediaID(link),
						format: 1
					},
					order: [["created_at", "DESC"]]
				}).then(instance => {
					if (instance === null || typeof instance === "undefined")
						return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
							command: command.name,
							user: raw_data.un,
							message: bot.lang.commands.plays.never
						})).delay(6e4).call("delete");

					instance = instance.toJSON();

					return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
						command: command.name,
						user: raw_data.un,
						message: bot.utils.replace(bot.lang.commands.plays.lastwas, {
							how_long_ago: bot.moment(instance.created_at).fromNow()
						})
					})).delay(6e4).call("delete");
				}).catch(console.error);
			else if (link.includes("soundcloud"))
				return got(`https://api.soundcloud.com/resolve?url=${link}&client_id=${bot.config.soundcloud_key}`, {json: true}).then(response => {
					if (typeof response.body === "object" && typeof response.body.id === "number")
						return bot.db.models.plays.findOne({
							where: {
								cid: `${response.body.id}`,
								format: 2
							},
							order: [["created_at", "DESC"]]
						}).then(instance => {
							if (instance === null || typeof instance === "undefined")
								return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
									command: command.name,
									user: raw_data.un,
									message: bot.lang.commands.plays.never
								})).delay(6e4).call("delete");

							instance = instance.toJSON();

							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.utils.replace(bot.lang.commands.plays.lastwas, {
									how_long_ago: bot.moment(instance.created_at).fromNow()
								})
							})).delay(6e4).call("delete");
						}).catch(console.error);
				}).catch(console.error);
			else {
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.plays.invalidlink
				})).delay(6e4).call("delete");
			}
		}
	}, {
		parameters: "[youtube link|soundcloud link]",
		description: "Checks the specified link, or the current media, for the last time it was played in the community."
	});
};
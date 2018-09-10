module.exports = function (bot, filename) {
	bot.commands.register("skip", filename, ["s"], 2000, true, {type: "per_use", duration: 4}, function (raw_data, command) {
		let dj = bot.plug.dj();
		let current_media = bot.plug.historyEntry();

		if (dj && current_media)
			return dj.skip(current_media.id).then(() => {
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.utils.replace(bot.lang.commands.skip, {
						mod: raw_data.un,
						user: dj.username
					})
				}));
			}).catch(console.error);
	}, {
		parameters: "",
		description: "Force skips the current DJ."
	});
};
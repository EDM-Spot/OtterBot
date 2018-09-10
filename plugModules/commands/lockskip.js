module.exports = function (bot, filename) {
	bot.commands.register("lockskip", filename, ["ls"], 2000, true, {type: "per_use", duration: 4}, function (raw_data, command) {
		let dj = bot.plug.dj();
		let current_media = bot.plug.historyEntry();

		if (dj && current_media)
			return bot.utils.lockskip(dj).then(() => {
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.utils.replace(bot.lang.commands.lockskip, {
						mod: raw_data.un,
						user: dj.username
					})
				}));
			}).catch(console.error);
	}, {
		parameters: "",
		description: "Executes a lockskip, which skips the current DJ and moves them back to the 3rd position to have another try."
	});
};
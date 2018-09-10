module.exports = function (bot, filename) {
	bot.commands.register("commands", filename, ["cmds"], 0, true, {type: "per_use", duration: 60}, function (raw_data, command) {
		return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
			command: command.name,
			user: raw_data.un,
			message: bot.lang.commands.commands
		})).delay(6e4).call("delete");
	}, {
		parameters: "",
		description: "Links to this page."
	});
};
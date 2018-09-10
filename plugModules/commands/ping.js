module.exports = function (bot, filename) {
	bot.commands.register("ping", filename, ["pong", "marco"], 2000, true, {type: "per_use", duration: 10}, function (raw_data, command) {
		if (command.platform === "discord")
			return raw_data.channel.createMessage(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.author.username,
				message: bot.lang.commands.ping[command.name]
			}));
		else
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.ping[command.name]
			})).delay(1e4).call("delete");
	}, {
		parameters: "",
		description: "Pong!"
	});
};
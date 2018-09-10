module.exports = function (bot, filename) {
	bot.commands.register("reload", filename, [], 3000, true, {type: "per_use", duration: 10}, function (raw_data, command) {
		setTimeout(() => process.kill(9), 2e3);
	}, {
		parameters: "",
		description: "Fully reloads the bot."
	});
};
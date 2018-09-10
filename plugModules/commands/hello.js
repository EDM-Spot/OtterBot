module.exports = function (bot, filename) {
	bot.commands.register("hello", filename, [], 1000, true, {type: "per_use", duration: 60}, function (raw_data, command) {
		return !Math.floor(Math.random() * 50) ? raw_data.reply("hello...").delay(4500).then(() => {
			return bot.plug.chat("... it's me...");
		}) : bot.plug.chat(`Hi There, @${raw_data.un}`);
	}, {
		parameters: "",
		description: "Hello..."
	});
};
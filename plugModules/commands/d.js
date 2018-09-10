module.exports = function (bot, filename) {
	bot.commands.register("d", filename, [], 1000, true, {type: "none", duration: 0}, function (raw_data, command) {
		return raw_data.delete();
	}, {
		parameters: "",
		description: "Deletes your own message. Why not?"
	});
};
module.exports = function (bot, filename) {
	bot.commands.register("rcs", filename, ["rcslink"], 0, true, {type: "per_use", duration: 300}, function (raw_data, command) {
		let user;

		if (command.args.length && command.args.join(" ").charAt(0) === "@") {
			let username = command.args.join(" ").substr(1);
			user = bot.plug.users().filter(u => u.username.toLowerCase() === username.toLowerCase())[0] || bot.plug.users().filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];
		}

		return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
			command: command.name,
			user: raw_data.un,
			message: `${bot.lang.commands.rcs} ${user || ""}`
		})).delay(6e4).call("delete");
	}, {
		parameters: "[@username]",
		description: "Links the third-party enhancement extension/script, RCS."
	});
};

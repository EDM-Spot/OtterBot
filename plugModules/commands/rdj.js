module.exports = function (bot, filename) {
	bot.commands.register("rdj", filename, ["residentdj", "resdj", "sub", "subs", "subscribe", "subscriber"], 1000, true, {type: "per_use", duration: 60}, function (raw_data, command) {
		let user;

		if (command.args.length && command.args.join(" ").charAt(0) === "@") {
			let username = command.args.join(" ").substr(1);
			user = bot.plug.users().filter(u => u.username.toLowerCase() === username.toLowerCase())[0] || bot.plug.users().filter(u => u.username.toLowerCase().trim() === username.toLowerCase().trim())[0];
		}

		return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
			command: command.name,
			user: raw_data.un,
			message: `${bot.lang.commands.rdj} ${user || ""}`
		})).delay(6e4).call("delete");
	}, {
		parameters: "[@username]",
		description: "Explains how the Resident DJ role is used within the community."
	});
};
module.exports = function (bot, filename) {
	bot.commands.register("eta", filename, [], 0, true, {type: "per_user", duration: 180}, function (raw_data, command) {
		let waitlist = bot.plug.waitlist();
		let dj = bot.plug.dj();

		if (dj && dj.id === raw_data.uid)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.eta.isdj
			})).delay(1e4).call("delete");
		else if (!waitlist.contains(raw_data.uid))
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.eta.notinlist
			})).delay(1e4).call("delete");
		else {
			let position = waitlist.positionOf(raw_data.uid);
			if (position === 0)
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.eta.isnext
				})).delay(3e4).call("delete");
			else {
				let hours = Math.floor((position * 4) / 60);
				let minutes = (position * 4) % 60;
				let readable = `${hours ? `${hours}h${minutes ? `${minutes}m` : ""}` : `${minutes}m`}`;

				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.utils.replace(bot.lang.commands.eta.result, {
						eta: readable
					})
				})).delay(6e4).call("delete");
			}
		}
	}, {
		parameters: "",
		description: "Calculates the ETA (Estimated Time of Arrival) for the user to DJ."
	});
};
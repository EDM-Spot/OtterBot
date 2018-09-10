module.exports = function (bot, filename) {
	bot.commands.register("unlock", filename, [], 2000, true, {type: "per_use", duration: 10}, async function (raw_data, command) {
		if (bot.plug.isLocked() && !bot.utils.queue.users.length)
			await bot.plug.setLock(false);
		else if (bot.utils.queue.users.length)
			return await bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.cantUnlock
			})).delay(6e4).call("delete");
	}, {
		parameters: "",
		description: "Unlocks the waitlist, if it is locked and no one is waiting to be added."
	});
};
module.exports = function (bot, filename) {
	bot.commands.register("nb3xp", filename, ["nb3points"], 0, true, {type: "per_user", duration: 120}, function (raw_data, command) {
		return bot.db.models.users.findOrCreate({
			where: {
				id: raw_data.uid
			},
			defaults: {
				id: raw_data.uid
			}
		}).spread((instance, created) => {
			return raw_data.reply(bot.utils.replace(bot.lang.commands.nb3xp, {
				points: bot.utils.numberWithCommas(instance.get("points"))
			})).delay(6e4).call("delete");
		}).catch(console.error);
	}, {
		parameters: "",
		description: "Informs how much NB3 XP you've got."
	});
};
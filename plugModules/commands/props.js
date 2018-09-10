module.exports = function (bot, filename) {
	bot.commands.register("props", filename, [], 0, true, {type: "per_user", duration: 60}, function (raw_data, command) {
		let current_media = bot.plug.historyEntry();

		if (!current_media)
			return raw_data.reply(bot.lang.commands.props.nodj).delay(1e4).call("delete");
		else if (current_media.dj && current_media.dj.id === raw_data.uid)
			return raw_data.reply(bot.lang.commands.props.propself).delay(1e4).call("delete");
		else return bot.db.models.props.findOrCreate({
			where: {
				identifier: `historyID-${current_media.id}:dj-${current_media.dj.id}:user-${raw_data.uid}`
			},
			defaults: {
				id: raw_data.uid,
				dj: current_media.dj.id,
				historyID: current_media.id,
				identifier: `historyID-${current_media.id}:dj-${current_media.dj.id}:user-${raw_data.uid}`
			}
		}).catch(console.error);
	}, {
		parameters: "",
		description: "Gives props to the current DJ."
	});
};
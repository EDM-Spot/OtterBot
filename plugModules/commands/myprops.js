module.exports = function (bot, filename) {
	bot.commands.register("myprops", filename, [], 0, true, {type: "per_user", duration: 30}, function (raw_data, command) {
		if (!command.args.length)
			return bot.db.models.users.findOrCreate({
				where: {
					id: raw_data.uid
				},
				defaults: {
					id: raw_data.uid
				}
			}).then((instances, created) => {
				if (!instances.length) return;

				let instance = instances.shift();

				let props = instance.toJSON().props;

				return raw_data.reply(props ? bot.utils.replace(bot.lang.commands.myprops.result, {
					props: props,
					plural: props > 1 ? "s" : ""
				}) : bot.lang.commands.myprops.noprops).delay(6e4).call("delete");
			}).catch(console.error);
		else {
			if (command.args.shift().toLowerCase() === "given")
				return bot.db.models.props.count({
					where: {
						id: raw_data.uid
					}
				}).then(props_given => {
					return raw_data.reply(props_given ? bot.utils.replace(bot.lang.commands.myprops.given, {
						props: props_given,
						plural: props_given > 1 ? "s" : ""
					}) : bot.lang.commands.myprops.nonegiven).delay(6e4).call("delete");
				}).catch(console.error);
		}
	}, {
		parameters: "[given]",
		description: "Checks how many props the user has, or how many the user has given."
	});
};
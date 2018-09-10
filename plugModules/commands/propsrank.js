module.exports = function (bot, filename) {
	bot.commands.register("propsrank", filename, ["propsleaderboards"], 1000, true, {type: "per_use", duration: 3600}, function (raw_data, command) {
		return bot.db.models.users.findAll({
			attributes: ["id", "props"],
			order: [["props", "DESC"]],
			where: {
				props: {
					$not: 0
				}
			},
			limit: 5
		}).then(instances => {
			instances = instances.map(instance => instance.toJSON());

			return bot.plug.post("users/bulk", {ids: instances.map(instance => instance.id)}).then(users => {
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: instances.map(instance => `${users.filter(user => instance.id === user.id)[0].username} (${instance.props})`).join(", ")
				})).delay(6e4).call("delete");
			}).catch(console.error);
		});
	}, {
		parameters: "",
		description: "Lists the top 5 users with the most props."
	});
};
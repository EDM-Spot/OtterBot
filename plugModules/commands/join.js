module.exports = function (bot, filename) {
	bot.commands.register("join", filename, ["joinroulette", "roulettejoin", "enter", "jjoin"], 0, true, {type: "per_user", duration: 10}, function (raw_data, command) {
		let dj = bot.plug.dj();
		let waitlist = bot.plug.waitlist();

		if (!bot.utils.roulette.check())
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				messagE: bot.lang.commands.join.noroulette
			})).delay(1e4).call("delete");
		else if (dj && dj.id === raw_data.uid)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				messagE: bot.lang.commands.join.isthedj
			})).delay(1e4).call("delete");
		else if (waitlist.contains(raw_data.uid) && waitlist.positionOf(raw_data.uid) <= 4)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				messagE: bot.lang.commands.join.closetodj
			})).delay(1e4).call("delete");
		else if (bot.utils.roulette.players.includes(raw_data.uid)) return;
		else {
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

				if (props < bot.utils.roulette.price)
					return raw_data.reply(bot.lang.commands.join.noprops).delay(1e4).call("delete");
				else return instance.decrement("props", {by: bot.utils.roulette.price}).then(() => bot.utils.roulette.add(raw_data.uid)).catch(console.error);
			}).catch(console.error);
		}
	}, {
		parameters: "",
		description: "Joins the roulette, if there is one active. This may also charge the user in props if the roulette had a set price."
	});
};
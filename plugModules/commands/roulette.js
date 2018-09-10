module.exports = function (bot, filename) {
	bot.commands.register("roulette", filename, ["roullete"], 2000, true, {type: "none", duration: 1}, function (raw_data, command) {
		if (!command.args.length)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.roulette.noargs
			})).delay(6e4).call("delete");
		else {
			let parameters = ["check", "start", "end"];
			let parameter = command.args.shift().toLowerCase();

			if (!parameters.includes(parameter))
				return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
					command: command.name,
					user: raw_data.un,
					message: bot.lang.commands.roulette.invalidarg
				})).delay(6e4).call("delete");
			else {
				switch (parameter) {
					case "check":
						if (bot.utils.roulette.check())
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.lang.commands.roulette.started
							})).delay(6e4).call("delete");
						else {
							return bot.db.models.cooldowns.findOne({
								where: {
									command: "roulette@start"
								}
							}).then(instance => {
								if (instance !== null && typeof instance !== "undefined")
									return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
										command: command.name,
										user: raw_data.un,
										message: bot.utils.replace(bot.lang.commands.roulette.incooldown, {
											how_long: Math.floor((+new Date() - +new Date(instance.get("created_at"))) / 6e4),
											minutes_left: Math.ceil(((+new Date(instance.get("created_at")) + 36e5) - +new Date()) / 6e4)
										})
									})).delay(6e4).call("delete");
								else
									return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
										command: command.name,
										user: raw_data.un,
										message: bot.lang.commands.roulette.nomorecooldown
									})).delay(6e4).call("delete");
							}).catch(console.error);
						}
						break;
					case "start":
						if (!bot.utils.roulette.check())
							return bot.utils.roulette.check(true).then(instance => {
								if (instance !== null && typeof instance !== "undefined")
									return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
										command: command.name,
										user: raw_data.un,
										message: bot.utils.replace(bot.lang.commands.roulette.incooldown, {
											how_long: Math.floor((+new Date() - +new Date(instance.get("created_at"))) / 6e4),
											minutes_left: Math.ceil(((+new Date(instance.get("created_at")) + 36e5) - +new Date()) / 6e4)
										})
									})).delay(6e4).call("delete");
								else {
									let waitlist = bot.plug.waitlist();

									/*if (waitlist.length <= 14)
										return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
											command: command.name,
											user: raw_data.un,
											message: bot.lang.commands.roulette.nowaitlist
										}));*/

									let duration = 60;

									if (command.args.length) {
										let specified_duration = parseInt(command.args.shift());

										if (isNaN(specified_duration) || (!isNaN(specified_duration) && specified_duration < 0))
											return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
												command: command.name,
												user: raw_data.un,
												message: bot.lang.commands.roulette.invalidduration
											})).delay(6e4).call("delete");
										else
											duration = specified_duration;
									}

									let price = 1;

									if (command.args.length) {
										let specified_price = parseInt(command.args.shift());

										if (isNaN(specified_price) || (!isNaN(specified_price) && specified_price < 0))
											return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
												command: command.name,
												user: raw_data.un,
												message: bot.lang.commands.roulette.invalidprice
											})).delay(6e4).call("delete");
										else
											price = specified_price;
									}

									return bot.utils.roulette.start(raw_data.uid, duration, price).then(started => {
										return bot.plug.chat(bot.lang.commands.roulette.starting).then(message => {
											bot.plug.chat(bot.utils.replace(bot.lang.commands.roulette.info, {
												duration: duration,
												price: price === 0 ? "free" : `${price} prop${price > 1 ? "s" : ""}`
											})).delay(duration * 1e3).call("delete");
										});
									}).catch(err => {
										return bot.plug.chat(bot.lang.commands.roulette.error).delay(6e4).call("delete");
									});
								}
							}).catch(console.error);
						else
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.lang.commands.roulette.started
							})).delay(6e4).call("delete");
						break;
					case "end":
						if (!bot.utils.roulette.check())
							return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
								command: command.name,
								user: raw_data.un,
								message: bot.lang.commands.roulette.notstarted
							})).delay(6e4).call("delete");
						else {
							if (bot.utils.roulette.end())
								return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
									command: command.name,
									user: raw_data.un,
									message: bot.lang.commands.roulette.stopped
								})).delay(6e4).call("delete");
						}
						break;
				}
			}
		}
	}, {
		parameters: "<check|end|start [duration] [price]>",
		description: "Roulette management command, can check if a roulette can be ran, can end or start a roulette (with specified duration or price, both defaulting to 60 and 1 respectively)."
	});
};
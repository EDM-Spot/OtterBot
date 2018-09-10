module.exports = function (bot, filename) {
	bot.commands.register("check", filename, ["regioncheck", "videocheck"], 2000, true, {type: "per_use", duration: 10}, function (raw_data, command) {
		if (!command.args.length)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.check.nolink
			})).delay(6e4).call("delete");

		let id = bot.youtube.getMediaID(command.args.join(" "));

		if (!id)
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.check.invalidlink
			})).delay(6e4).call("delete");

		return bot.youtube.getMedia(id).then(media => {
			let response;
			if (typeof media.status !== "object" || media.status.uploadStatus !== "processed" || media.status.privacyStatus === "private" || !media.status.embeddable)
				response = bot.lang.commands.check.unavailable;
			else if (typeof media.contentDetails === "object" && typeof media.contentDetails.regionRestriction === "object" && (Array.isArray(media.contentDetails.regionRestriction.allowed) || Array.isArray(media.contentDetails.regionRestriction.denied) || Array.isArray(media.contentDetails.regionRestriction.blocked))) {
				let regionRestriction = media.contentDetails.regionRestriction;

				if ((Array.isArray(regionRestriction.allowed) && !regionRestriction.allowed.includes("US")) || (Array.isArray(regionRestriction.allowed) && regionRestriction.denied.includes("US")) || (Array.isArray(regionRestriction.blocked) && regionRestriction.blocked.includes("US")))
					response = bot.lang.commands.check.unavailableonUS;
				else if ((Array.isArray(regionRestriction.denied) && regionRestriction.denied.length >= 96) || (Array.isArray(regionRestriction.blocked) && regionRestriction.blocked.length >= 96) || (Array.isArray(regionRestriction.allowed) && regionRestriction.allowed.length <= 96))
					response = bot.utils.replace(bot.lang.commands.check.blockedintoomany, {
						count: Math.max(regionRestriction.blocked.length || 0, regionRestriction.denied.length || 0) || 149
					});
				else {
					let countries;

					if (Array.isArray(regionRestriction.blocked) && regionRestriction.blocked.length < 96) {
						if (regionRestriction.blocked.length >= 24) {
							countries = regionRestriction.blocked.splice(0, 24);
							countries = [...countries, `and ${regionRestriction.blocked.length} more`].join(", ");
						} else {
							countries = regionRestriction.blocked.join(", ");
						}

						response = bot.utils.replace(bot.lang.commands.check.blockedin, {
							countries: countries
						});
					} else if (Array.isArray(regionRestriction.denied) && regionRestriction.denied.length < 96) {
						if (regionRestriction.denied.length >= 24) {
							countries = regionRestriction.denied.splice(0, 24);
							countries = [...countries, `and ${regionRestriction.denied.length} more`].join(", ");
						} else {
							countries = regionRestriction.denied.join(", ");
						}

						response = bot.utils.replace(bot.lang.commands.check.blockedin, {
							countries: countries
						});
					} else if (Array.isArray(regionRestriction.allowed) && regionRestriction.allowed.length < 96) {
						if (regionRestriction.allowed.length >= 24) {
							countries = regionRestriction.allowed.splice(0, 24);
							countries = [...countries, `and ${regionRestriction.allowed.length} more`].join(", ");
						} else {
							countries = regionRestriction.allowed.join(", ");
						}

						response = bot.utils.replace(bot.lang.commands.check.notallowedin, {
							countries: countries
						});
					}
				}
			} else {
				response = bot.utils.replace(bot.lang.commands.check.valid, {
					title: media.snippet.title
				});
			}

			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: response ? response : "missing response"
			})).delay(6e4).call("delete");
		}).catch(err => {
			return bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.lang.commands.check.plausible
			})).delay(6e4).call("delete");
		});
	}, {
		parameters: "[youtube link]",
		description: "Checks if the specified (if none was specified it takes the current) media is unavailable in any sort of way"
	});
};
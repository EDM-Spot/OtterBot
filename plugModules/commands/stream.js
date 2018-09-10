module.exports = function (bot, filename) {
	bot.commands.register("stream", filename, [], 1000, true, {type: "per_use", duration: 30}, async function (raw_data, command) {
		let nightblue3 = await bot.twitch.getStream("nightblue3"); // 26946000
		let ash_on_lol = await bot.twitch.getStream("ash_on_lol"); // 60198919

		if (nightblue3.stream && ash_on_lol.stream) {
			await bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.utils.replace(bot.lang.commands.stream.both, {
					streamer1: nightblue3.stream.channel.display_name,
					streamer2: ash_on_lol.stream.channel.display_name,
					link1: nightblue3.stream.channel.url,
					link2: ash_on_lol.stream.channel.url
				})
			}));
			await bot.plug.chat(bot.utils.replace(bot.lang.commands.stream.viewers, {
				preview: nightblue3.stream.preview.medium,
				viewers: nightblue3.stream.viewers
			})).delay(6e4).call("delete");
			return await bot.plug.chat(bot.utils.replace(bot.lang.commands.stream.viewers, {
				preview: ash_on_lol.stream.preview.medium,
				viewers: ash_on_lol.stream.viewers
			})).delay(6e4).call("delete");
		} else if ((nightblue3.stream && !ash_on_lol.stream) || (!nightblue3.stream && ash_on_lol.stream)) {
			await bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.utils.replace(bot.lang.commands.stream.only, {
					streamer: (nightblue3.stream || ash_on_lol.stream).channel.display_name,
					link: (nightblue3.stream || ash_on_lol.stream).channel.url
				})
			}));
			return await bot.plug.chat(bot.utils.replace(bot.lang.commands.stream.viewers, {
				preview: (nightblue3.stream || ash_on_lol.stream).preview.medium,
				viewers: (nightblue3.stream || ash_on_lol.stream).viewers
			})).delay(6e4).call("delete");
		} else if (!nightblue3.stream && !ash_on_lol.stream) {
			return await bot.plug.chat(bot.utils.replace(bot.lang.commands.default, {
				command: command.name,
				user: raw_data.un,
				message: bot.utils.replace(bot.lang.commands.stream.neither, {
					streamer1: "nightblue3 (https://twitch.tv/nightblue3)",
					streamer2: "ash_on_lol (https://twitch.tv/ash_on_lol)",
				})
			})).delay(6e4).call("delete");
		}
	}, {
		parameters: "",
		description: "Checks if Nightblue3 or ash_on_lol are streaming on twitch.tv, if so, some extra info will be displayed."
	});
};